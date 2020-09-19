const express = require('express');

const serverless = require('serverless-http');

const app = express();
const router = express.Router();

router.get('/', (req,res) => {
  res.json({
    'hello' : 'hi',
  });
});

app.use('/.netlify/functions/api', router);

// in order for lambda to run, we need to export a handler function
module.exports.handler = serverless(app);