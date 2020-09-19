const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
const router = express.Router();

router.get('/', (req,res) => {
  res.json({
    'hello' : 'hi',
  });
});

const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription
}

// The new /save-subscription endpoint
router.post('/save-subscription', async (req, res) => {
  const subscription = req.body
  await saveToDatabase(subscription) //Method to save the subscription to Database
  res.json({ message: 'success' })
})
const vapidKeys = {
  publicKey:
    'BN34_hJAjkmgVyIcWJOajEn9dSGnEmRdEMgsYzFZf1RXJOiGR9W3O4RFkUEOlKqmlFU2iX9MRy_1Ycuvgg5LvUE',
  privateKey: '3ZT8c4IifAP4FOXyC4M6zM1Z1Ual5rjLc3n2qYUmsGM',
}

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:myuserid@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend)
}
//route to test send notification
router.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  const message = 'This is coming from the express server'
  sendNotification(subscription, message)
  res.json({ message: 'message sent' })
})

app.use(bodyParser.json())
app.use(cors())
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://amazing-stonebraker-19f8f7.netlify.app');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/.netlify/functions/api', router);

// in order for lambda to run, we need to export a handler function
module.exports.handler = serverless(app);