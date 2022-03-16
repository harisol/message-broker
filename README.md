A modification from: https://github.com/jagracey/Message-Broker

## A pure NodeJS implementation of a simple pub/sub message broker.

> Create a simple message broker queueing system with an HTTP based RESTful API coded in NodeJS.
> The message broker needs to guarantee that messages published to the queue will be eventually be delivered to all registered consumers.

## Specification Notes:
- Consumer simply needs to respond with a 2XX status code to confirm receipt.
- Each message queue gets its own circular buffer datastructure.
- Failed consumer requests get put back into the start of the queue- without a minimum delay.
- MAX_REQUEST_RETRIES is set to Infinity.
- Callback_URL is not validated as a URL
- In order to maintain simplicity and unique consumer IDs, the (array) register of consumers uses the array index as a consumer ID. This means that the system sets the index null when we delete the consumer. On a future update, an associative array is a better choice. The same applies to the list of Queues.
- Testing has been lightly performed with a bastardized hybrid of unit & integration testing together.
- Tested on Node v5.5.0 with a few uses of ES6.


### Getting the system running

- Run Broker.js with `npm start` or `npm run broker`,
- Run consumer with `npm run consumer` and producer with `npm run producer`
- Run mocha tests with `npm test`, or simple bash script with `npm run bash-test`


##### NPM Run
***
```
Lifecycle scripts included in message-broker:
  start
    node server/broker.js
  test
    mocha tests/main.js --reporter spec --timeout 3000

available via `npm run-script`:
  broker
    node server/broker.js
  consumer
    node clients/consumer.js
  producer
    node clients/producer.js
  bash-test
    bash tests/test.sh
```


## Project Structure
```
.
├── clients
│   ├── consumer.js
│   └── producer.js
├── package.json
├── README.md
├── server
│   ├── broker.js
│   ├── controllers
│   │   ├── consumer.js
│   │   ├── publisher.js
│   │   └── queueManager.js
│   └── library
│       ├── deque.js
│       ├── spoon.js
│       └── taskQueue.js
└── tests
    ├── main.js
    └── test.sh
```


## RESTful API spec
***
### Queues management

- `GET /queues`
  - Gets the list of queues
  - Returns:
     - list of queues: `[{
     id: '<queue id>',
     name: '<queue name>'
}]`
- `POST /queues`
  - Creates a new queue
  - Parameters:
    - name: name of new queue
  - Returns:
    - `{
     status: 'ok',  
     id: '<New object id>'
}`
- `PUT /queues/:qid`
  - Edits existing queue object
   - Parameters:
    - name: new name of exisiting queue
  - Returns:
    - `{
     status: 'ok'
}`
- `DELETE /queues/:qid`
  - Deletes existing queue object
  - Parameters:
    - name: name of queue
  - Returns:
    - `{
     status: 'ok'
    }`

### Publish messages

- `POST /queues/:qid/messages`
  - Sends a new message to all registered consumers
  - Parameters:
    - body: message body (text)
  - Returns:
    - `{
     status: 'ok'
    }`
  - **NOTE**: When a new message is published, the broker sends an HTTP POST to the consumer's callback_url with:
    - id: unique message ID
    - timestamp: shows when message was published  
    - body: message body

### Consume messages

- `GET /queues/:qid/consumers`
  - Return the list of consumers (subscribers) for the given queue.
  - Returns:
    - `
        [{
            id: '<consumer_id>',
            queue_id: '<queue_id>',
            callback_url: '<URL for receiving messages>'
        }]`
- `POST /queues/:qid/consumers`
  - Subscribe to queue id
  - Parameters:
    - callback_url: URL for receiving messages
  - Returns:
    - `{
     status: 'ok'
    }`
- `DELETE /queues/:qid/consumers/:consumer_id`
  - Delete the specified consumer from the queue.
  - Returns:
    - `{
     status: 'ok'
    }`

## Error Reporting
The general convention of error reporting is as follows:
- The following HTTP Status codes are used when appropriate: `200`, `201`,`400`, `404`, and `410`.
- The following JSON status message is typically returned:
```
{
     status: 'error',
     error: '<error description>'
}
```

<br><br><br>

License
-------

The BSD-3-Clause

Copyright (c) 2016, John Gracey
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of Free Code Camp nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY FREE CODE CAMP AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
