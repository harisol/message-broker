"use strict";
/*
  Creates random data to send to the Broker.
*/
const DELAY = 5; // in seconds
// var queueId = process.argv.slice(2)[0] || 2;

var request = require('request');
var crypto = require('crypto');

var message_count = 0;

function produceMessage(queueId){
  const hash = crypto.createHash('md5')
              .update( Math.random().toString() )
              .digest("hex");
  var payload = hash +'|'+ (message_count++) +'|'+ queueId;

  if (queueId === 0) {
    payload = 'send_email' + '|' + payload;
  }
  if (queueId === 1) {
    payload = 'send_notif' + '|' + payload;
  }

  console.log(`Sending request: ${payload}`);

    var options = {
      url: `http://localhost:3000/queues/publish/${queueId}`,
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain' }
    };
    request.post(options,function (error, res, body) {
      if (error){
        // Arbitrarily decide to exit if the Broker breaks
        console.log(error, body, (res||{}).statusCode);
        return process.exit(1);
      }
      console.log(body);

      // keep looping produce message
      setTimeout(() => produceMessage(queueId), DELAY * 1000);
    });

}

const requestAtOnce = 2;
for ( var i= 0; i < requestAtOnce; i++) {
  produceMessage(0);
}
for ( var i= 0; i < requestAtOnce; i++) {
  produceMessage(1);
}
