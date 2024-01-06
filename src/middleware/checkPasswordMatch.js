const createResult = require("../modules/result");

const checkPasswordMatch = (req, res, next) => {
   const { pw, pw_same } = req.body;

   if (pw !== pw_same) {
      const result = createResult('비밀번호와 확인이 일치하지 않습니다.');
      return res.status(409).send(result);
      // 409 서버가 요청을 수행할 수 없는 상태에 있음을 나타냅니다. 주로 리소스가 이미 존재하고 중복으로 생성하려는 경우에 사용됩니다.
   }

   next();
};

module.exports = checkPasswordMatch;
