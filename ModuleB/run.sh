source .env
export DEBUG=*
nodejs app.js 2>&1 | tee module.log
