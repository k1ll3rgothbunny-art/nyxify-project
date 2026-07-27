import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
  }
});

const BUCKET = process.env.S3_BUCKET!;

// Vault files are stored private; every download goes through a short-lived
// signed URL so a customer can never share a permanent link to someone else's file.
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresInSeconds = 300) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

// Direct server-side upload — used whenever we already have the file bytes on
// the server (order reference uploads, Discord ticket deliveries, admin
// uploads). This is what actually moves data into storage; it needs no
// browser CORS configuration at all, unlike the presigned-URL flow above.
export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return key;
}
