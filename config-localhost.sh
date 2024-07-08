dotnet dev-certs https -ep _certs/localhost.pem --format PEM --no-password
chmod +r _certs/*
cp _certs/localhost.pem _certs/ca.pem
