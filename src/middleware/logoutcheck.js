const logoutCheck = (req, res, next) => {
   const user = req.session.user;
   if (user) {
      const result = {
         message: "이미 로그인이 되어있습니다.",
      };
      return res.status(401).send(result);
   }
   req.user = user;
   next();
}

module.exports = logoutCheck