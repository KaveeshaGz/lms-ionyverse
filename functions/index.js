/* ======================================================
   BROWSE A TEACHER LMS
   Protected Cloudflare Stream Playback
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
  getFirestore
} = require(
  "firebase-admin/firestore"
);

const logger = require(
  "firebase-functions/logger"
);


initializeApp();


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


/* ------------------------------------------------------
   NORMALIZE CLOUDFLARE CUSTOMER CODE
------------------------------------------------------ */

function normalizeCustomerCode(value) {
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


/* ------------------------------------------------------
   CREATE SHORT-LIVED SECURE PLAYER URL
------------------------------------------------------ */

exports.getStreamPlaybackToken =
  onCall(
    {
      secrets: [
        cloudflareAccountId,
        cloudflareApiToken,
        cloudflareCustomerCode
      ]
    },

    async function (request) {
      /*
        Firebase automatically validates the
        Authentication token for callable requests.
      */
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Please sign in first."
        );
      }


      const studentUid =
        request.auth.uid;

      const videoId =
        String(
          request.data?.videoId || ""
        ).trim();


      if (!videoId) {
        throw new HttpsError(
          "invalid-argument",
          "Video ID is required."
        );
      }


      const db =
        getFirestore();


      /*
        Check whether this user is an active admin.
        Admins may preview hidden or paid videos.
      */
      const userSnapshot =
        await db
          .collection("users")
          .doc(studentUid)
          .get();


      const userProfile =
        userSnapshot.exists
          ? userSnapshot.data()
          : {};


      const isAdmin =
        userProfile.role === "admin" &&
        userProfile.status === "active";


      /*
        Load the selected video metadata.
      */
      const videoSnapshot =
        await db
          .collection("videos")
          .doc(videoId)
          .get();


      if (!videoSnapshot.exists) {
        throw new HttpsError(
          "not-found",
          "The requested video could not be found."
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
          "This video is not currently available."
        );
      }


      /*
        Paid videos require an active access document.
        Free videos may open immediately.
      */
      if (
        video.accessType !== "free" &&
        !isAdmin
      ) {
        const accessId =
          studentUid +
          "_" +
          videoId;


        const accessSnapshot =
          await db
            .collection("videoAccess")
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


      const videoUid =
        String(
          video.cloudflareVideoUid || ""
        ).trim();


      if (!videoUid) {
        logger.error(
          "Missing Cloudflare UID for video:",
          videoId
        );


        throw new HttpsError(
          "failed-precondition",
          "This video has not been configured correctly."
        );
      }


      /*
        Ask Cloudflare for a temporary signed token.
        Never expose the Cloudflare API token to
        the browser.
      */
      const response =
        await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" +
          encodeURIComponent(
            cloudflareAccountId.value()
          ) +
          "/stream/" +
          encodeURIComponent(
            videoUid
          ) +
          "/token",

          {
            method:
              "POST",

            headers: {
              Authorization:
                "Bearer " +
                cloudflareApiToken
                  .value()
            }
          }
        );


      const payload =
        await response.json();


      if (
        !response.ok ||
        payload.success !== true ||
        !payload.result?.token
      ) {
        logger.error(
          "Cloudflare playback-token request failed.",
          {
            status:
              response.status,

            videoId:
              videoId,

            errors:
              payload.errors || []
          }
        );


        throw new HttpsError(
          "internal",
          "Secure video playback could not be created."
        );
      }


      const customerCode =
        normalizeCustomerCode(
          cloudflareCustomerCode
            .value()
        );


      if (!customerCode) {
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
          payload.result.token +
          "/iframe"
      };
    }
  );