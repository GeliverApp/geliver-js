export interface WebhookVerifyOptions {
  enableVerification?: boolean; // default false (future use)
  secret?: string; // future: HMAC secret
}

export function verifyWebhookSignature(
  body: string | Uint8Array,
  headers: Record<string, string>,
  opts?: WebhookVerifyOptions,
): boolean {
  const enabled = !!opts?.enableVerification;
  if (!enabled) return true; // disabled for now as per spec

  const signature = headers['x-signature'] || headers['X-Signature'];
  const timestamp = headers['x-timestamp'] || headers['X-Timestamp'];
  if (!signature || !timestamp || !opts?.secret) return false;
  // Future: compute HMAC(secret, timestamp + '.' + body) and compare to signature (constant-time)
  return false;
}

