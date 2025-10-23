// Minimal webhook server using Express
// Install: npm i express @types/express
import express from 'express';
import { verifyWebhookSignature } from '../src/webhooks.js';

const app = express();
app.use(express.json({ type: '*/*' }));

app.post('/webhooks/geliver', (req, res) => {
  const ok = verifyWebhookSignature(JSON.stringify(req.body), req.headers as any, { enableVerification: false });
  if (!ok) return res.status(400).send('invalid');
  // process event
  res.send('ok');
});

app.listen(3000, () => console.log('listening on :3000'));

