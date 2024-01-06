const { queryDatabase } = require("../modules/connection");
const createResult = require("../modules/result");

const checkIdDuplicate = async (req, res, next) => {
   try {
      const { id } = req.body;

      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM homework.user WHERE id = $1";
      const idResults = await queryDatabase(checkIdSql, [id]);

      if (idResults.length > 0) return res.status(200).send(createResult('아이디가 이미 존재합니다.'));

      next();
   } catch (error) {
      console.error("아이디 중복 확인 미들웨어 오류:", error.message);
      return res.status(500).send(createResult('서버 오류'));
   }
};

module.exports = checkIdDuplicate;
