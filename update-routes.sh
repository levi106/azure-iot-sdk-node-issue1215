source .env
az iot edge set-modules -n $HUB_ID -d $EDGE_ID -k deployBase.json