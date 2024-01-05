
const loginCheck = (req, res, next) => {
   const user = req.session.user;
   if (!user) {
      const result = {
         message: "로그인이 필요합니다.",
      };
      return res.status(401).send(result);
   }
   req.user = user;
   next();
}


module.exports = loginCheck

