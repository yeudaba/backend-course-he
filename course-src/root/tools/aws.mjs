// עוזר לבדיקות של יחידה 26.3: לקוחות AWS SDK מול LocalStack (אמולטור של AWS שרץ ב־Docker).
// החיבור: COURSE_AWS_ENDPOINT ב־.env (ברירת מחדל http://localhost:4566). המפתחות — "test", כמו ש־LocalStack מצפה.
// כל בדיקה מקבלת bucket ו/או queue עם שם ייחודי, ומוחקת אותם בסוף.
import { S3Client, CreateBucketCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteBucketCommand } from "@aws-sdk/client-s3";
import { SQSClient, CreateQueueCommand, DeleteQueueCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";

export const awsEndpoint = process.env.COURSE_AWS_ENDPOINT || "http://localhost:4566";
export const awsConfig = {
  region: "us-east-1",
  endpoint: awsEndpoint,
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

export const s3Client = () => new S3Client({ ...awsConfig, forcePathStyle: true });
export const sqsClient = () => new SQSClient(awsConfig);

const unique = (prefix) => `${prefix}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

export async function bucketSandbox(t) {
  const s3 = s3Client();
  const bucket = unique("chk");
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  } catch (err) {
    throw new Error(`אין חיבור ל־LocalStack (${awsEndpoint}): ${err.message}. הרץ את הקונטיינר (יחידה 26.3, קופסת 🧰)`);
  }
  t.after(async () => {
    for (;;) {
      const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
      if (!page.Contents?.length) break;
      await s3.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: page.Contents.map((o) => ({ Key: o.Key })) } }));
    }
    await s3.send(new DeleteBucketCommand({ Bucket: bucket })).catch(() => {});
    s3.destroy();
  });
  return { s3, bucket };
}

export async function queueSandbox(t, { attributes = {}, name = unique("chk") } = {}) {
  const sqs = sqsClient();
  let QueueUrl;
  try {
    ({ QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: name, Attributes: attributes })));
  } catch (err) {
    throw new Error(`אין חיבור ל־LocalStack (${awsEndpoint}): ${err.message}. הרץ את הקונטיינר (יחידה 26.3, קופסת 🧰)`);
  }
  t.after(async () => {
    await sqs.send(new DeleteQueueCommand({ QueueUrl })).catch(() => {});
    sqs.destroy();
  });
  const arn = async () => (await sqs.send(new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ["QueueArn"] }))).Attributes.QueueArn;
  return { sqs, queueUrl: QueueUrl, name, arn };
}
