import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials once at startup
const credentialsPath = path.resolve(
  __dirname,
  "../../storage/app/firebase/firebase_credentials.json"
);
const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
const projectId = process.env.FIREBASE_PROJECT_ID || credentials.project_id;
/**
 * Get Firebase access token
 */
async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

/**
 * Send notification to a device via Firebase Cloud Messaging
 * @param {string} deviceToken
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
export async function fcmNotify(
  deviceToken,
  title = "Default Title",
  body = "Default Body",
  data = {}
) {
  // console.log({ deviceToken, title, body });
  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  // Convert all data values to strings
  const formattedData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)])
  );

  const payload = {
    message: {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      data: formattedData,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error sending notification:",
      error.response?.data || error.message
    );
    // throw error;
  }
}

