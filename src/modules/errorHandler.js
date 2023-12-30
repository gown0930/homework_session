const createResult = require('./result');

const handleServerError = (error, res, statusCode = 500, customMessage) => {
   console.error(error);

   const errorMessage = error.message || customMessage || "서버 에러가 발생하였습니다.";
   const status = error.status || statusCode;

   return res.status(status).send(createResult(errorMessage));
};

module.exports = handleServerError;