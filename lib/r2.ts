import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { DOCUMENT_MAX_BYTES } from "@/lib/documents/constants";

export class R2ConfigError extends Error {
  constructor() {
    super(
      "R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_ENDPOINT to .env.local.",
    );
    this.name = "R2ConfigError";
  }
}

type R2Config = {
  bucket: string;
  client: S3Client;
};

let cached: R2Config | undefined;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new R2ConfigError();
  }
  return value;
}

function getR2(): R2Config {
  if (cached) {
    return cached;
  }

  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  cached = {
    bucket,
    client: new S3Client({
      region: "auto",
      endpoint,
      // Path-style keeps the host as {accountId}.r2.cloudflarestorage.com so
      // CSP `*.r2.cloudflarestorage.com` matches (virtual-hosted would be
      // {bucket}.{accountId}.r2… which a single CSP * does not cover).
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };

  return cached;
}

export async function presignDocumentPut(input: {
  key: string;
  contentType: string;
  contentLength: number;
  expiresIn: number;
}): Promise<string> {
  const { client, bucket } = getR2();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.contentLength,
  });

  return getSignedUrl(client, command, { expiresIn: input.expiresIn });
}

export async function presignDocumentGet(input: {
  key: string;
  filename: string;
  contentType: string;
  expiresIn: number;
}): Promise<string> {
  const { client, bucket } = getR2();
  const safeName = input.filename.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ResponseContentType: input.contentType,
    ResponseContentDisposition: `inline; filename="${safeName}"`,
  });

  return getSignedUrl(client, command, { expiresIn: input.expiresIn });
}

export type HeadedObject = {
  contentLength: number;
  contentType: string | undefined;
};

export async function headDocumentObject(
  key: string,
): Promise<HeadedObject | null> {
  const { client, bucket } = getR2();

  try {
    const result = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );

    return {
      contentLength: result.ContentLength ?? 0,
      contentType: result.ContentType,
    };
  } catch {
    return null;
  }
}

export async function readDocumentPrefix(
  key: string,
  bytes = 16,
): Promise<Uint8Array | null> {
  const { client, bucket } = getR2();

  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: `bytes=0-${bytes - 1}`,
      }),
    );

    const body = result.Body;
    if (!body) {
      return null;
    }

    return await body.transformToByteArray();
  } catch {
    return null;
  }
}

export async function deleteDocumentObject(key: string): Promise<void> {
  const { client, bucket } = getR2();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function isWithinUploadCap(contentLength: number): boolean {
  return contentLength > 0 && contentLength <= DOCUMENT_MAX_BYTES;
}
