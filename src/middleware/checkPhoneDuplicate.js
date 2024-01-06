const { queryDatabase } = require("../modules/connection");
const createResult = require("../modules/result");

const checkPhoneDuplicate = async (req, res, next) => {
   try {
      const { phone_num } = req.body;

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM homework.user WHERE phone_num = $1";
      const phoneResults = await queryDatabase(checkPhoneSql, [phone_num]);

      if (phoneResults.length > 0) return res.status(200).send(createResult('전화번호가 이미 존재합니다.'));

      next();
   } catch (error) {
      console.error("전화번호 중복 확인 미들웨어 오류:", error.message);
      return res.status(500).send(createResult('서버 오류'));
   }
};

module.exports = checkPhoneDuplicate;
