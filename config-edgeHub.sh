source .env
az account set -s $SUB_ID
az iot hub device-identity create -n $HUB_ID -d $EDGE_ID --edge-enabled

sasKey=$(az iot hub device-identity show -n $HUB_ID -d $EDGE_ID --query authentication.symmetricKey.primaryKey -o tsv)
aziotedge-modinit --ConnectionStrings:IoTEdge="HostName=$HUB_ID.azure-devices.net;DeviceId=$EDGE_ID;SharedAccessKey=$sasKey" --moduleId='$edgeHub'
az iot edge set-modules -n $HUB_ID -d $EDGE_ID -k deployBase.json
