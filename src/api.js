const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
const router = express.Router();

app.use(cors());
var jsonParser = bodyParser.json()

router.get('/', (req,res) => {
  res.json({
    'hello' : 'hi',
  });
});

const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
}

// The new /save-subscription endpoint
router.post('/save-subscription', jsonParser, async (req, res) => {
  const subscription = req.body
  console.log('subscription', subscription);
  await saveToDatabase(subscription) //Method to save the subscription to Database
  res.json({ message: 'This is the BE, I saw post request - success' })
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
  console.log("subscription.endpoint", subscription.endpoint)
  webpush.sendNotification(subscription, dataToSend)
  .then(console.log('subscription in sendNotification', subscription))
  .catch((err) => {
    console.log('*** err', err);
    console.log('*** err.statusCode', err.statusCode);
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('Subscription has expired or is no longer valid: ', err);
      return deleteSubscriptionFromDatabase(subscription._id);
    } else {
      throw err;
    }
  });
}
//route to test send notification
router.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  console.log('subscription', subscription);
  const message = 'Hello World'
  sendNotification(subscription, message)
  res.json({ message: 'message sent' })
})


app.use('/.netlify/functions/api', router)
// app.use('/.netlify/functions/api', cors(), router, bodyParser.json());

// in order for lambda to run, we need to export a handler function
module.exports.handler = serverless(app);