const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://multicloud-lovat.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

const apiKey =
  process.env.STREAM_API_KEY || process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret =
  process.env.STREAM_API_SECRET || process.env.STREAM_SECRET_KEY;

if (!apiKey || !apiSecret) {
  console.error("Missing Stream API Key or Secret in .env file");
  process.exit(1);
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createStreamToken(userId) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { user_id: userId };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signingInput)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${signingInput}.${signature}`;
}

app.post("/get-token", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const token = createStreamToken(userId);
    res.json({ token, apiKey });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
