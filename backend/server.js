import express from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,credentials: {accessKeyId: process.env.AWS_ACCESS_KEY,secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});


app.post("/generate-url", async (req, res) => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: "filename & filetype is require" });
  }

  console.log("Generating URL for:", { fileName, fileType });
  console.log("Bucket:", process.env.AWS_BUCKET);
  console.log("Region:", process.env.AWS_REGION);

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("Generated URL (first 100 chars):", url.substring(0, 100) + "...");
    res.json({ url });
  } catch (err) {
    console.error("Error generating URL:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("my server is running on the port 5000"));
