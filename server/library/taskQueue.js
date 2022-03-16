"use strict";

var request = require('request');
var Deque = require('./deque.js');

// Queue -- https://github.com/caolan/async/blob/master/deps/nodeunit.js#L1050
var TaskQueue = function (worker) {
  var workers = 0;

  var tasks = new Deque(5000); // Set initial capactity at 5,000 items. Deque automatically expands.
  var q = {
      push: function (data) {
          tasks.insertFront(data);
          process.nextTick(q.process);
      },
      clearByCID: function(cid){
        for( var i = 0; i< tasks.length; i++){
          var msg = tasks.get(i);
          if (msg && msg.consumer_id == cid)
            tasks.set(i,null);
        }
      },
      getRawDeque: function(){ return tasks; }, // For Debugging Purposes
      process: function () {
          if (workers < CONCURRENT_TASKS_PER_QUEUE && !tasks.isEmpty()) {
              var task = tasks.removeBack();
              workers += 1;
              return worker(task, function () {
                  workers -= 1;
                  return q.process();
              });
          }
      },
  };
  return q;
};

var tqFactory = function() {
  var tq = new TaskQueue(function (task, callback) {

    if ( task )// Deleting from an array leaves a null location behind.
      request.post({url:task.callback_url, form: {
        id: task.message_id,
        timestamp: task.timestamp,
        body: task.body
      }}, function(err,res,body){
        if ( err || !res || (res.statusCode / 100 | 0) !== 2 ){ // Status == 2XX
          // RETRY PUBLISHING QUEUE BECAUSE REQUEST ON CALLBACK URL FAILED
          console.log('Failed URL request: ', JSON.stringify(task));
          if ( MAX_REQUEST_RETRIES > task.message_attempt++ )
            tq.push(task);
        }
        return callback();
      });
    else
      return callback();
  });
  return tq;
};
module.exports = tqFactory;
