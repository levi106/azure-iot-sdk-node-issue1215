source .env
export DEBUG=azure-iot-*,mqttjs:*
nodejs app.js 2>&1 | tee module.log
