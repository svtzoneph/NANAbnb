const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// VAPID keys from STEP 2
const vapidKeys = {
  publicKey: 'BCKv40EB0-UZ4q__UZISg5YatDKAjPL6I4G26wUAQuem1iZB3624Lt1CN883zRDKetExU-V08sm5BpVz5cOlCuM',
  privateKey: '5t4zgTF8kffvwzupWRY3fxQR1wRHDN4kkFAfm0RLSwU'
};

webPush.setVapidDetails('mailto:you@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

let subscriptions = [];

// Save subscriptions
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Send notification endpoint
app.post('/sendNotification', (req, res) => {
  const { title, body, url } = req.body;
  const payload = JSON.stringify({ title, body, url });

  Promise.all(subscriptions.map(sub => webPush.sendNotification(sub, payload)))
    .then(() => res.status(200).json({ message: 'Notification sent!' }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
