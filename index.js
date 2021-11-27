const { Requester, Validator } = require('@chainlink/external-adapter')
require('dotenv').config();
const {TwitterApi} = require('twitter-api-v2');
// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  twitterHandle:['twitterHandle'],
  tweetId:['tweetId'],
  verificationString:['verificationString'],
  endpoint: false
}
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const twitterAppOnlyClient = (new TwitterApi(TWITTER_BEARER_TOKEN)).v2; // free version of twitter api only supports v2

const createRequest = async (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const apiKey = process.env.API_KEY;
  const tweetId = validator.validated.data.tweetId
  const twitterHandle = validator.validated.data.twitterHandle
  const verificationString = validator.validated.data.verificationString

    twitterAppOnlyClient.singleTweet(
        tweetId, {
            expansions: [
                'author_id',
            ],
        }
    )
    .then(response => {
        twitterAppOnlyClient.user(response.data.author_id)
        .then(user => {
            const username = user.data.username
            if(response.data.text.includes(verificationString) && username.toLowerCase() === twitterHandle.toLowerCase()){
                callback(200, Requester.success(jobRunID, response));
            } else {
                callback(500, Requester.errored(jobRunID, "Did not validate"))
            }
        })
        .catch(error => {
            console.log('error', error);
            callback(500, Requester.errored(jobRunID, error))
        });;
    })
    .catch(error => {
    console.log('error', error);
        callback(500, Requester.errored(jobRunID, error))
    });

}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
