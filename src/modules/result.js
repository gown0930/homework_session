const createResult = (message = null) => {
   return {
      message: message,
      data: {
         token: ""
      }
   }
}
module.exports = createResult;