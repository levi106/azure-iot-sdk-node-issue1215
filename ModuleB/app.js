'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
//var Transport = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
var crypto = require('crypto');
require('log-timestamp');

var lastSeq = 0;
var tokenValidTimeInSeconds = 60;
var tokenRenewalMarginInSeconds = 5;
var wait = 0;
if (process.env.TOKEN_VALID_TIME) {
  tokenValidTimeInSeconds = parseInt(process.env.TOKEN_VALID_TIME);
}
if (process.env.TOKEN_RENEWAL_MARGIN) {
  tokenRenewalMarginInSeconds = parseInt(process.env.TOKEN_RENEWAL_MARGIN);
}
if (process.env.WAIT) {
  wait = parseInt(process.env.WAIT);
}

console.log(`tokenValidTimeInSeconds:${tokenValidTimeInSeconds}, tokenRenewalMarginInSeconds:${tokenRenewalMarginInSeconds}`);

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    let options = client._methodClient._options;
    options.tokenRenewal = {
      tokenValidTimeInSeconds: tokenValidTimeInSeconds,
      tokenRenewalMarginInSeconds: tokenRenewalMarginInSeconds
    };
    client.setOptions(options);
    client.open(function (err) {
      if (err) {
        console.error(err.toString());
        process.exit(-1);        
      }
      console.log('IoT Hub module client initialized');
      client.on('inputMessage', function (inputName, msg) {
        pipeMessage(client, inputName, msg);
      });
    });
  }
});

function delay(ms) {
  return new Promise((resolve => {
    setTimeout(resolve, ms);
  }))
}

// This function just pipes the messages without any change.
async function pipeMessage(client, inputName, msg) {

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    const date = new Date().toISOString();
    const seq = parseInt(msg.properties.getValue('sequenceNumber'), 10);
    console.log(`${date}: ${seq}`);
    const outMsg = new Message(message);
    outMsg.properties.add('sequenceNumber', seq);
    if (lastSeq != 0 && seq > lastSeq+1) {
      console.warn(`${date}: Error expected: ${lastSeq+1}, actual: ${seq}`);
      const data = JSON.stringify({cmd: 'stop'});
      const stopMsg = new Message(data);
      client.sendOutputEvent('output1', stopMsg, printResultFor('Sending stop message'));
      outMsg.properties.add('stop', 'true');
    } else {
      outMsg.properties.add('stop', 'false');
    }
    client.sendOutputEvent('output2', outMsg, printResultFor('Sending output message'));
    lastSeq = seq;
    await delay(wait);
  }
  client.complete(msg, printResultFor('Receiving message'));
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    // if (res) {
    //   console.log(op + ' status: ' + res.constructor.name);
    // }
  };
}
