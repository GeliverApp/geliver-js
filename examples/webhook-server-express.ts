// Minimal webhook server using Express
// Install: npm i express @types/express
import express from 'express';
import { verifyWebhookSignature } from '../src/webhooks.js';
import type { WebhookUpdateTrackingRequest } from '../src/models/index.js';

const app = express();
app.use(express.json({ type: '*/*' }));

app.post('/webhooks/geliver', (req, res) => {
  const ok = verifyWebhookSignature(JSON.stringify(req.body), req.headers as any, { enableVerification: false });
  if (!ok) return res.status(400).send('invalid');
  const evt = req.body as WebhookUpdateTrackingRequest;
  if (evt.event === 'TRACK_UPDATED') {
    console.log('Tracking update:', evt.data.trackingUrl, evt.data.trackingNumber);
  }
  res.send('ok');
});

app.listen(3000, () => console.log('listening on :3000'));
