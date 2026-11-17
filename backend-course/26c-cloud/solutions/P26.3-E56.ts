// P26.3-E56: קבלה רק לבעלים — כתובת חתומה להורדה
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Req = { userId: number; orderId: number; ownerOf: (orderId: number) => Promise<number | null> };

export async function receiptLink(s3: S3Client, bucket: string, { userId, orderId, ownerOf }: Req): Promise<{ status: 200; url: string } | { status: 404 }> {
  if ((await ownerOf(orderId)) !== userId) return { status: 404 };
  const Key = `receipts/${orderId}.pdf`;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key }));
  } catch (err) {
    if ((err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return { status: 404 };
    throw err;
  }
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key, ResponseContentDisposition: `attachment; filename="receipt-${orderId}.pdf"` }),
    { expiresIn: 60 },
  );
  return { status: 200, url };
}
