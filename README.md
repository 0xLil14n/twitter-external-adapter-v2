# Twitter API External Adapter

#### description
this is a chainlink external adapter used to verify twitter someone's handle
The user tweets a randomly generated string from their twitter account, 
then the smart contract calls this adapter with the given confirmation string, twitterHandle and tweetID to confirm it was tweeted from the right account.

In order to use, you must have a Chainlink Node set up. (don't forget to configure your bridge to use your IP address instead of localhost)

## how to use this chainlink external adapter locally:

```yarn start```
runs on port 8080

###sample curl
``` curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{"id": 1, "data": {"tweetId": "1443174455128244226", "twitterHandle": "0xlil14n", "verificationString": "mercury"}}' ```

### inputs:
1. ```tweetId```
2. ```twitterHandle```
3. ```verificationString```