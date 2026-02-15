import admin from "firebase-admin";
import fs from "fs";
import path from "path";

/**
 * Load Firebase service account from project root (CWD)
 */
const serviceAccountPath = path.join(
  process.cwd(),
  "./src/config/files/firebase-service-account.json",
);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

/**
 * Initialize Firebase Admin SDK (singleton)
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send push notification via Firebase
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional extra data (string values only)
 */
export const sendPushNotification = async (
  token,
  title = "test title",
  body = "test body",
  data = {},
) => {
  if (!token) return console.warn("⚠️ No Firebase token found, skipping notification.");

  const message = {
    token,
    notification: { title, body },
    data,
    android: { priority: "high" },
    apns: {
      headers: { "apns-priority": "10" },
    },
  };

  try {
    const res = await admin.messaging().send(message);
    console.warn(`✅ Notification sent to ${token.slice(0, 15)}...`, res);
    return res;
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);
  }
};

// testing notification
// const token = "token";
// await sendPushNotification(token);
