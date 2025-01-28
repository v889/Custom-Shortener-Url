import axios from "axios";
import { OAuth2Client } from "google-auth-library";
export const tokenVerify = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const client_id = process.env.CLIENT_ID || "YOUR_CLIENT_ID";

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    req.userDetails = response.data;
    next();
  } catch (err) {
    console.error("Error during token verification:", err.message);

    if (!res.headersSent) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      next(err);
    }
  }
};

