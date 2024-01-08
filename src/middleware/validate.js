const validationPatterns = {
   id: /^[a-zA-Z0-9_]{5,20}$/,
   pw: /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*_-]{8,}$/,
   phone_num: /^\d{10,11}$/,
   email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
   name: /^.{3,20}$/,
   title: /.*/,
   content: /.*/,
};

const createValidationMiddleware = (fields) => {
   return (req, res, next) => {
      const errors = [];

      fields.forEach((field) => {
         const pattern = validationPatterns[field];
         //API에 종속되어있지 않게끔.. 독립적이게 바꿔보기
         //ex ) key가 바뀌면 여기 내용도 바꿔줘야함 pw->password
         const bodyValue = req.body && req.body[field];
         const queryValue = req.query && req.query[field];
         const paramsValue = req.params && req.params[field];

         // Check for empty, null, or undefined values
         if (!bodyValue && !queryValue && !paramsValue) {
            errors.push(`${field} 값이 비어있습니다`);
         } else if (pattern && !pattern.test(bodyValue || queryValue || paramsValue)) {
            errors.push(`${field} 형식이 올바르지 않습니다`);
         }
      });

      if (errors.length > 0) {
         return res.status(400).json({ errors });
      }

      // 유효한 경우 다음 미들웨어로 이동
      next();
   };
};

module.exports = createValidationMiddleware;
