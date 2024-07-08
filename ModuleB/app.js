'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
//var Transport = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
require('log-timestamp');

var lastSeq = 0;

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    let options = client._methodClient._options;
    options.tokenRenewal = {
      tokenValidTimeInSeconds: 10,
      tokenRenewalMarginInSeconds: 5
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
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    const date = new Date().toISOString();
    const seq = parseInt(msg.properties.getValue('sequenceNumber'), 10);
    console.log(`${date}: ${seq}`);
    if (lastSeq != 0 && seq != lastSeq+1) {
      console.warn(`${date}: seq# ${lastSeq+1} skipped`);
    }
    lastSeq = seq;
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
