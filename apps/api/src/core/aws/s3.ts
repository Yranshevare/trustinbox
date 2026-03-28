import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

type AwsConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

export type UploadInput = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

const globalForAws = globalThis as {
  s3?: S3Client;
  cfg?: AwsConfig;
};

export const parseFile = async (f: File) => {
  if (!f) return undefined;
  return {
    buffer: Buffer.from(await f.arrayBuffer()),
    originalname: f.name,
    mimetype: f.type,
  };
};

const getConfig = (): AwsConfig => {
  if (globalForAws.cfg) return globalForAws.cfg;

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('Missing required AWS configuration');
  }

  const cfg = { region, accessKeyId, secretAccessKey, bucketName };
  globalForAws.cfg = cfg;
  return cfg;
};

const getS3 = (): S3Client => {
  if (globalForAws.s3) return globalForAws.s3;

  const { region, accessKeyId, secretAccessKey } = getConfig();

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  globalForAws.s3 = client;
  return client;
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (c) => chunks.push(Buffer.from(c)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

export const uploadFile = async (
  file: UploadInput,
  folder?: string,
): Promise<{ key: string; url: string }> => {
  const { bucketName, region } = getConfig();
  const s3 = getS3();

  const key = folder ? `${folder}/${file.originalname}` : file.originalname;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  return { key, url };
};

export const getFile = async (key: string): Promise<Buffer> => {
  const { bucketName } = getConfig();
  const s3 = getS3();

  const res = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  return streamToBuffer(res.Body as Readable);
};

export const getFileSignedUrl = async (
  key: string,
  expiresIn = 3600,
): Promise<string> => {
  const { bucketName } = getConfig();
  const s3 = getS3();

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
    { expiresIn },
  );
};

export const deleteFile = async (key: string): Promise<void> => {
  const { bucketName } = getConfig();
  const s3 = getS3();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

export const listFiles = async (prefix?: string): Promise<string[]> => {
  const { bucketName } = getConfig();
  const s3 = getS3();

  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }),
  );

  return (
    res.Contents?.map((o) => o.Key).filter(
      (k): k is string => k !== undefined,
    ) ?? []
  );
};

export const fileExists = async (key: string): Promise<boolean> => {
  const { bucketName } = getConfig();
  const s3 = getS3();

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
    return true;
  } catch (e) {
    if ((e as { name?: string }).name === 'NotFound') return false;
    throw e;
  }
};
