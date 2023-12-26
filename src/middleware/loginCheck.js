
const loginCheck = (req, res, next) => {
   const user = req.session.user;
   if (!user) {
      const result = {
         message: "로그인이 필요합니다.",
      };
      return res.status(401).send(result);
   }
   req.user = user; // req 객체에 user를 추가하여 라우터에서 사용할 수 있도록 함
   next();
}

const logoutCheck = (req, res, next) => {
   const user = req.session.user;
   if (user) {
      result.message = '이미 로그인되어 있습니다.';
      return res.status(401).send(result);
   }
   req.user = user;
   next();
}

module.exports = loginCheck

