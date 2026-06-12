/* ======================================================
   BROWSE A TEACHER LMS
   CLOUDFLARE STREAM BACKEND
====================================================== */

const {
  onCall,
  HttpsError
} = require(
  "firebase-functions/v2/https"
);

const {
  defineSecret
} = require(
  "firebase-functions/params"
);

const {
  initializeApp
} = require(
  "firebase-admin/app"
);

const {
  getFirestore,
  FieldValue
} = require(
  "firebase-admin/firestore"
);

const logger = require(
  "firebase-functions/logger"
);


initializeApp();


const db =
  getFirestore();


/* ------------------------------------------------------
   SECURE CLOUDFLARE VALUES
------------------------------------------------------ */

const cloudflareAccountId =
  defineSecret(
    "CLOUDFLARE_ACCOUNT_ID"
  );

const cloudflareApiToken =
  defineSecret(
    "CLOUDFLARE_STREAM_API_TOKEN"
  );

const cloudflareCustomerCode =
  defineSecret(
    "CLOUDFLARE_STREAM_CUSTOMER_CODE"
  );


const streamSecrets = [
  cloudflareAccountId,
  cloudflareApiToken
];


const playbackSecrets = [
  cloudflareAccountId,
  cloudflareApiToken,
  cloudflareCustomerCode
];


/* ------------------------------------------------------
   SAFE TEXT HELPERS
------------------------------------------------------ */

function cleanText(
  value,
  maximumLength
) {
  return String(value || "")
    .trim()
    .slice(
      0,
      maximumLength
    );
}


function normalizeCustomerCode(
  value
) {
  return String(value || "")
    .trim()
    .replace(
      /^customer-/,
      ""
    )
    .replace(
      /\.cloudflarestream\.com.*$/,
      ""
    );
}


function isAllowedSubject(
  subject
) {
  return (
    subject === "Accounting" ||
    subject === "Chemistry"
  );
}


function isAllowedAccessType(
  accessType
) {
  return (
    accessType === "free" ||
    accessType === "paid"
  );
}


/* ------------------------------------------------------
   AUTHENTICATION HELPERS
------------------------------------------------------ */

async function requireSignedInUser(
  request
) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Please sign in first."
    );
  }


  return request.auth.uid;
}


async function requireActiveAdmin(
  request
) {
  const userUid =
    await requireSignedInUser(
      request
    );


  const profileSnapshot =
    await db
      .collection("users")
      .doc(userUid)
      .get();


  if (!profileSnapshot.exists) {
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required."
    );
  }


  const profile =
    profileSnapshot.data();


  if (
    profile.role !== "admin" ||
    profile.status !== "active"
  ) {
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required."
    );
  }


  return userUid;
}


/* ------------------------------------------------------
   CLOUDFLARE API HELPERS
------------------------------------------------------ */

function createCloudflareHeaders() {
  return {
    Authorization:
      "Bearer " +
      cloudflareApiToken.value(),

    "Content-Type":
      "application/json"
  };
}


async function readCloudflareJson(
  response,
  actionName
) {
  let payload = {};


  try {
    payload =
      await response.json();

  } catch (error) {
    logger.error(
      "Cloudflare response parsing failed.",
      {
        actionName:
          actionName,

        status:
          response.status
      }
    );
  }


  if (
    !response.ok ||
    payload.success !== true
  ) {
    logger.error(
      "Cloudflare API request failed.",
      {
        actionName:
          actionName,

        status:
          response.status,

        errors:
          payload.errors || []
      }
    );


    throw new HttpsError(
      "internal",
      "Cloudflare could not complete the request."
    );
  }


  return payload.result;
}


function mapCloudflareStreamState(
  streamVideo
) {
  const statusState =
    cleanText(
      streamVideo?.status?.state,
      40
    );


  if (
    statusState === "error"
  ) {
    return "error";
  }


  if (
    statusState === "ready" &&
    streamVideo.readyToStream === true
  ) {
    return "ready";
  }


  return "processing";
}


/* ======================================================
   1. CREATE ONE-TIME CLOUDFLARE UPLOAD URL
====================================================== */

exports.createStreamDirectUpload =
  onCall(
    {
      invoker:
        "public",

      secrets:
        streamSecrets
    },

    async function (
      request
    ) {
      const adminUid =
        await requireActiveAdmin(
          request
        );


      const title =
        cleanText(
          request.data?.title,
          160
        );


      const subject =
        cleanText(
          request.data?.subject,
          40
        );


      const teacher =
        cleanText(
          request.data?.teacher,
          120
        );


      const description =
        cleanText(
          request.data?.description,
          1500
        );


      const accessType =
        cleanText(
          request.data?.accessType,
          20
        );


      const priceLkr =
        Number(
          request.data?.priceLkr
        );


      const maxDurationMinutes =
        Number(
          request.data
            ?.maxDurationMinutes
        );


      if (
        !title ||
        !teacher ||
        !description
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Please complete all required video fields."
        );
      }


      if (
        !isAllowedSubject(
          subject
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Only Accounting and Chemistry are available."
        );
      }


      if (
        !isAllowedAccessType(
          accessType
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Choose Free or Paid access."
        );
      }


      if (
        !Number.isFinite(
          priceLkr
        ) ||
        priceLkr < 0
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Enter a valid LKR price."
        );
      }


      if (
        accessType === "free" &&
        priceLkr !== 0
      ) {
        throw new HttpsError(
          "invalid-argument",
          "A free video must have a price of zero."
        );
      }


      if (
        accessType === "paid" &&
        priceLkr <= 0
      ) {
        throw new HttpsError(
          "invalid-argument",
          "A paid video must have a price above zero."
        );
      }


      if (
        !Number.isInteger(
          maxDurationMinutes
        ) ||
        maxDurationMinutes < 1 ||
        maxDurationMinutes > 600
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Maximum duration must be between 1 and 600 minutes."
        );
      }


      const maxDurationSeconds =
        maxDurationMinutes * 60;


      const cloudflareResponse =
        await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" +
          encodeURIComponent(
            cloudflareAccountId.value()
          ) +
          "/stream/direct_upload",

          {
            method:
              "POST",

            headers:
              createCloudflareHeaders(),

            body:
              JSON.stringify({
                maxDurationSeconds:
                  maxDurationSeconds,

                requireSignedURLs:
                  true,

                creator:
                  adminUid,

                allowedOrigins: [
                  "browseateacher.com",
                  "www.browseateacher.com",
                  "browse-a-teacher-lms.web.app",
                  "localhost"
                ],

                meta: {
                  lmsTitle:
                    title,

                  lmsSubject:
                    subject
                }
              })
          }
        );


      const cloudflareUpload =
        await readCloudflareJson(
          cloudflareResponse,
          "createStreamDirectUpload"
        );


      if (
        !cloudflareUpload?.uid ||
        !cloudflareUpload?.uploadURL
      ) {
        throw new HttpsError(
          "internal",
          "Cloudflare did not return an upload URL."
        );
      }


      const videoReference =
        db
          .collection("videos")
          .doc();


      await videoReference.set({
        title:
          title,

        subject:
          subject,

        teacher:
          teacher,

        description:
          description,

        cloudflareVideoUid:
          cloudflareUpload.uid,

        thumbnailUrl:
          "",

        priceLkr:
          priceLkr,

        accessType:
          accessType,

        status:
          "hidden",

        streamState:
          "uploading",

        uploadedBy:
          adminUid,

        createdAt:
          FieldValue
            .serverTimestamp(),

        updatedAt:
          FieldValue
            .serverTimestamp()
      });


      return {
        videoId:
          videoReference.id,

        cloudflareVideoUid:
          cloudflareUpload.uid,

        uploadURL:
          cloudflareUpload.uploadURL,

        maximumFileSizeBytes:
          200 * 1024 * 1024
      };
    }
  );


/* ======================================================
   2. REFRESH CLOUDFLARE PROCESSING STATUS
====================================================== */

exports.syncStreamVideoStatus =
  onCall(
    {
      invoker:
        "public",

      secrets:
        streamSecrets
    },

    async function (
      request
    ) {
      await requireActiveAdmin(
        request
      );


      const videoId =
        cleanText(
          request.data?.videoId,
          160
        );


      if (!videoId) {
        throw new HttpsError(
          "invalid-argument",
          "Video ID is required."
        );
      }


      const videoReference =
        db
          .collection("videos")
          .doc(videoId);


      const videoSnapshot =
        await videoReference
          .get();


      if (
        !videoSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "The video could not be found."
        );
      }


      const video =
        videoSnapshot.data();


      const cloudflareVideoUid =
        cleanText(
          video.cloudflareVideoUid,
          100
        );


      if (!cloudflareVideoUid) {
        throw new HttpsError(
          "failed-precondition",
          "The Cloudflare video UID is missing."
        );
      }


      const cloudflareResponse =
        await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" +
          encodeURIComponent(
            cloudflareAccountId.value()
          ) +
          "/stream/" +
          encodeURIComponent(
            cloudflareVideoUid
          ),

          {
            method:
              "GET",

            headers:
              createCloudflareHeaders()
          }
        );


      const streamVideo =
        await readCloudflareJson(
          cloudflareResponse,
          "syncStreamVideoStatus"
        );


      const streamState =
        mapCloudflareStreamState(
          streamVideo
        );


      await videoReference.update({
        streamState:
          streamState,

        updatedAt:
          FieldValue
            .serverTimestamp()
      });


      return {
        videoId:
          videoId,

        streamState:
          streamState,

        readyToStream:
          streamVideo
            .readyToStream === true,

        cloudflareStatus:
          cleanText(
            streamVideo
              ?.status
              ?.state,
            40
          ),

        progressPercent:
          Number(
            streamVideo
              ?.status
              ?.pctComplete || 0
          )
      };
    }
  );


/* ======================================================
   3. DELETE CLOUDFLARE VIDEO AND LMS METADATA
====================================================== */

exports.deleteStreamVideo =
   onCall(
    {
      invoker:
        "public",

      secrets:
        streamSecrets
    },

    async function (
      request
    ) {
      await requireActiveAdmin(
        request
      );


      const videoId =
        cleanText(
          request.data?.videoId,
          160
        );


      if (!videoId) {
        throw new HttpsError(
          "invalid-argument",
          "Video ID is required."
        );
      }


      const videoReference =
        db
          .collection("videos")
          .doc(videoId);


      const videoSnapshot =
        await videoReference
          .get();


      if (
        !videoSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "The video could not be found."
        );
      }


      const video =
        videoSnapshot.data();


      const cloudflareVideoUid =
        cleanText(
          video.cloudflareVideoUid,
          100
        );


      if (
        cloudflareVideoUid
      ) {
        const deleteResponse =
          await fetch(
            "https://api.cloudflare.com/client/v4/accounts/" +
            encodeURIComponent(
              cloudflareAccountId.value()
            ) +
            "/stream/" +
            encodeURIComponent(
              cloudflareVideoUid
            ),

            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  "Bearer " +
                  cloudflareApiToken
                    .value()
              }
            }
          );


        /*
          Treat an already-removed Cloudflare file
          as safe to continue deleting locally.
        */
        if (
          !deleteResponse.ok &&
          deleteResponse.status !== 404
        ) {
          let errorText = "";


          try {
            errorText =
              await deleteResponse.text();

          } catch (error) {
            errorText =
              "Unable to read Cloudflare error.";
          }


          logger.error(
            "Cloudflare delete failed.",
            {
              videoId:
                videoId,

              status:
                deleteResponse.status,

              errorText:
                errorText
            }
          );


          throw new HttpsError(
            "internal",
            "Cloudflare could not remove the video."
          );
        }
      }


      /*
        Revoke existing paid-video permissions.
      */
      const accessSnapshot =
        await db
          .collection(
            "videoAccess"
          )
          .where(
            "videoId",
            "==",
            videoId
          )
          .get();


      let deleteBatch =
        db.batch();


      let batchSize =
        0;


      for (
        const accessDocument
        of accessSnapshot.docs
      ) {
        deleteBatch.delete(
          accessDocument.ref
        );


        batchSize += 1;


        if (
          batchSize === 450
        ) {
          await deleteBatch
            .commit();


          deleteBatch =
            db.batch();


          batchSize =
            0;
        }
      }


      if (
        batchSize > 0
      ) {
        await deleteBatch
          .commit();
      }


      await videoReference
        .delete();


      return {
        success:
          true,

        videoId:
          videoId
      };
    }
  );


/* ======================================================
   4. CREATE PROTECTED VIDEO PLAYER URL
====================================================== */

exports.getStreamPlaybackToken =
   onCall(
    {
      invoker:
        "public",

      secrets:
        playbackSecrets
    },

    async function (
      request
    ) {
      const userUid =
        await requireSignedInUser(
          request
        );


      const videoId =
        cleanText(
          request.data?.videoId,
          160
        );


      if (!videoId) {
        throw new HttpsError(
          "invalid-argument",
          "Video ID is required."
        );
      }


      const userSnapshot =
        await db
          .collection("users")
          .doc(userUid)
          .get();


      if (
        !userSnapshot.exists
      ) {
        throw new HttpsError(
          "permission-denied",
          "Your account profile could not be found."
        );
      }


      const userProfile =
        userSnapshot.data();


      const isAdmin =
        userProfile.role === "admin" &&
        userProfile.status === "active";


      const isActiveStudent =
        userProfile.role === "student" &&
        userProfile.status === "active";


      if (
        !isAdmin &&
        !isActiveStudent
      ) {
        throw new HttpsError(
          "permission-denied",
          "Your account is not active."
        );
      }


      const videoSnapshot =
        await db
          .collection("videos")
          .doc(videoId)
          .get();


      if (
        !videoSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "The video could not be found."
        );
      }


      const video =
        videoSnapshot.data();


      if (
        video.status !== "published" &&
        !isAdmin
      ) {
        throw new HttpsError(
          "permission-denied",
          "This video is not currently published."
        );
      }


      if (
        video.streamState !== "ready"
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This video is still processing."
        );
      }


      if (
        video.accessType !== "free" &&
        !isAdmin
      ) {
        const accessId =
          userUid +
          "_" +
          videoId;


        const accessSnapshot =
          await db
            .collection(
              "videoAccess"
            )
            .doc(accessId)
            .get();


        if (
          !accessSnapshot.exists ||
          accessSnapshot.data()
            .active !== true
        ) {
          throw new HttpsError(
            "permission-denied",
            "Payment approval is required before watching this video."
          );
        }
      }


      const cloudflareVideoUid =
        cleanText(
          video.cloudflareVideoUid,
          100
        );


      if (
        !cloudflareVideoUid
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This video is not configured correctly."
        );
      }


      const cloudflareResponse =
        await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" +
          encodeURIComponent(
            cloudflareAccountId.value()
          ) +
          "/stream/" +
          encodeURIComponent(
            cloudflareVideoUid
          ) +
          "/token",

          {
            method:
              "POST",

            headers:
              createCloudflareHeaders()
          }
        );


      const tokenResult =
        await readCloudflareJson(
          cloudflareResponse,
          "getStreamPlaybackToken"
        );


      if (
        !tokenResult?.token
      ) {
        throw new HttpsError(
          "internal",
          "A secure playback token could not be generated."
        );
      }


      const customerCode =
        normalizeCustomerCode(
          cloudflareCustomerCode
            .value()
        );


      if (
        !customerCode
      ) {
        throw new HttpsError(
          "failed-precondition",
          "The Cloudflare customer code is missing."
        );
      }


      return {
        iframeUrl:
          "https://customer-" +
          customerCode +
          ".cloudflarestream.com/" +
          tokenResult.token +
          "/iframe"
      };
    }
  );