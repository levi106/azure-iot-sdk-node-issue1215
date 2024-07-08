source ../.env
az iot hub module-identity create -n $HUB_ID -d $EDGE_ID -m ModuleC
modcs=$(az iot hub module-identity connection-string show -n $HUB_ID -d $EDGE_ID -m ModuleC -o tsv)

echo "export EdgeModuleCACertificateFile=../_certs/ca.pem" > .env
echo "export IotHubConnectionString=\"$modcs;GatewayHostName=localhost\"" >> .env
