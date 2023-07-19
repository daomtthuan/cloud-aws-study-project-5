import * as AWS from 'aws-sdk';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

export class AttachmentUtils {
  private readonly bucketName: string;
  private readonly signedUrlExpiration: string;
  private readonly s3: AWS.S3;

  constructor() {
    this.bucketName = process.env.ATTACHMENT_S3_BUCKET;
    this.signedUrlExpiration = process.env.SIGNED_URL_EPIRATION;
    this.s3 = new XAWS.S3({ signatureVersion: 'v4' });
  }

  public getAttachmentUrl(fileId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${fileId}`;
  }

  public getUploadUrl(fileId: string) {
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: fileId,
      Expires: this.signedUrlExpiration,
    });

    return url as string;
  }
}
