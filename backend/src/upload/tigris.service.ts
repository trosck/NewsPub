import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { put, type PutOptions, type PutResponse } from "@tigrisdata/storage";

@Injectable()
export class TigrisService {
  private readonly storageConfig: PutOptions["config"];

  constructor(configService: ConfigService) {
    this.storageConfig = {
      accessKeyId: configService.getOrThrow<string>("s3.accessKeyId"),
      secretAccessKey: configService.getOrThrow<string>("s3.secretAccessKey"),
      endpoint: configService.getOrThrow<string>("s3.endpoint"),
      iamEndpoint: configService.getOrThrow<string>("s3.iamEndpoint"),
      bucket: configService.getOrThrow<string>("s3.bucket"),
    };
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<PutResponse> {
    const { data, error } = await put(key, body, {
      contentType,
      access: "public",
      config: this.storageConfig,
    });

    if (error) throw error;

    return data;
  }
}
