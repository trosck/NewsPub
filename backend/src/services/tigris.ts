import { put, type PutResponse, type PutOptions } from "@tigrisdata/storage";

import {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
  S3_IAM_ENDPOINT,
  S3_BUCKET,
} from "../config/env.js";

const storageConfig: PutOptions["config"] = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  endpoint: S3_ENDPOINT,
  iamEndpoint: S3_IAM_ENDPOINT,
  bucket: S3_BUCKET,
};

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<PutResponse> {
  const { data, error } = await put(key, body, {
    contentType,
    access: "public",
    config: storageConfig,
  });

  if (error) throw error;

  return data;
}
