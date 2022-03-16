
/*
  Registers to ONE Queue.
*/
var consumer = function(consumer_hook ){
  "use strict";
  const queueIdSendEmail = 0;
  const queueIdSendNotif = 1;

  var request = require('request');
  var http = require('http');
  var qs = require('querystring');
  var host = 'localhost';
  var port = 3003;

  var server = http.createServer(function (req, res) {
      const protocol = req.connection.encrypted ? 'https' : 'http';
      const url = new URL(`${protocol}://${req.headers.host}${req.url}`);

      // this server only accpet POST /notify
      if (url.pathname !== '/notify' || req.method !== 'POST') {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: 'invalid path' }));
        return;
      }

      var chunks = '';
      req.on('data', function (chunk) {
        chunks += chunk;
        if (chunks.length > 1e6)  // 1e6 ~~~ 1MB
          request.connection.destroy(); // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
      });

      req.on('end', function () {
        res.writeHead(200, {'Content-Type': 'application/json'});
        var content = qs.parse(chunks);
        if (content.body === undefined) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ message: 'bad request' }));
          return;
        }

        var message = 'success sending notif';
        if (content.body.includes('send_email')) {
          message = 'success sending email'
        }

        var msg = {
          status: 'ok',
          message,
          content, // These are used for debugging and testing with multiple consumers.
          port: server.address().port,
        }
        res.end( JSON.stringify( msg ) +'\n');

        if (!module.parent)
          console.log( JSON.stringify(msg) );
        if ( typeof consumer_hook === 'function')
          consumer_hook( msg );
      });
  })
  .listen(port, host, function(){
    var address = server.address();

    console.log('Consumer Server listening on %j', address);

    const formPayload = {
      callback_url:'http://localhost:'+address.port+'/notify'
    };

    // subscribe to queue send email
    request.post('http://localhost:3000/queues/'+queueIdSendEmail+'/consumers', { form: formPayload }, function (error, res, body) {
      if ( error || (res.statusCode / 100 | 0) !== 2 ){ 
        // error occured or status != 2XX
        console.log('Failed URL request...');
      }
    });

    // subscribe to queue send notif
    request.post('http://localhost:3000/queues/'+queueIdSendNotif+'/consumers',{form:formPayload},function (error, res, body) {
      if ( error || (res.statusCode / 100 | 0) !== 2 ){ 
        // error occured or status != 2XX
        console.log('Failed URL request...');
      }
    });

  });
};

if (!module.parent) {
    consumer();
} else {
    module.exports = consumer;
}
