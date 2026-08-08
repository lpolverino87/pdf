import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME.",
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

function getR2Client() {
  const config = getR2Config();

  return {
    config,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  };
}

export async function createModuloUploadUrl({
  fileKey,
  fileSize,
}: {
  fileKey: string;
  fileSize: number;
}) {
  const { client, config } = getR2Client();
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
      ContentType: "application/pdf",
      ContentLength: fileSize,
    }),
    { expiresIn: 600 },
  );

  return uploadUrl;
}

export async function createModuloDownloadUrl(fileKey: string) {
  const { client, config } = getR2Client();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: "inline",
    }),
    { expiresIn: 300 },
  );
}

export async function deleteModuloFileFromR2(fileKey: string) {
  const { client, config } = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
    }),
  );
}