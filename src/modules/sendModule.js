const sendModule = (res, status, result) => {
   res.status(status).send(result);
}
sendModule.exports = sendModule;