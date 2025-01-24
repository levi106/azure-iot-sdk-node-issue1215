'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
var crypto = require('crypto');
require('log-timestamp');

var lastSeq = 0;
var tokenValidTimeInSeconds = 60*60;
var tokenRenewalMarginInSeconds = 15;
if (process.env.TOKEN_VALID_TIME) {
  tokenValidTimeInSeconds = parseInt(process.env.TOKEN_VALID_TIME);
}
if (process.env.TOKEN_RENEWAL_MARGIN) {
  tokenRenewalMarginInSeconds = parseInt(process.env.TOKEN_RENEWAL_MARGIN);
}

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

// This function just pipes the messages without any change.
async function pipeMessage(client, inputName, msg) {

  if (inputName === 'input1') {
    const date = new Date().toISOString();
    const seq = parseInt(msg.properties.getValue('sequenceNumber'), 10);
    const stop = msg.properties.getValue('stop') === "true";
    if (stop) {
      console.warn(`${date}: Stopped (seq=${seq})`);
    }
    if (lastSeq != 0 && seq > lastSeq+1) {
      console.warn(`${date}: Error expected: ${lastSeq+1}, actual: ${seq}`);
      const stopMsg = new Message(data);
      client.sendOutputEvent('output1', stopMsg, printResultFor('Sending stop message'));
    }
  }
  client.complete(msg, printResultFor('Receiving message'));
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
  };
}
