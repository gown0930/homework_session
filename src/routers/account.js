const router = require("express").Router()
const postgresClient = require("../modules/connection.js");
const validation = require("../modules/validation")
const createResult = require("../modules/result")
const loginCheck = require("../middleware/loginCheck")

//===========로그인 & 회원가입 ===============
// 로그인
router.post('/login', async (req, res) => {
   const { id, pw } = req.body;
   const result = createResult();

   try {
      validation.validateId(id);
      validation.validatePassword(pw);

      if (req.session.user) {
         result.message = '이미 로그인되어 있습니다.';
         return res.status(200).send(result);
      }

      // 로그인 처리
      const sql = `SELECT * FROM homework.user WHERE id = $1 AND password = $2`;
      const { rows } = await postgresClient.query(sql, [id, pw]);

      if (rows.length === 0) {
         result.message = '아이디 또는 비밀번호가 일치하지 않습니다.';
         return res.status(401).send(result);
      }

      // 세션에 사용자 정보 저장
      req.session.user = {
         idx: rows[0].idx,
         id: rows[0].id,
         name: rows[0].name,
         phone_num: rows[0].phone_num,
         email: rows[0].email,
      };
      console.log(rows[0].idx);
      res.status(200).send(result);
   } catch (error) {
      console.error('로그인 중 에러 발생:', error);
      result.message = error.message || '로그인 중 에러가 발생하였습니다.';
      return res.status(error.status || 500).send(result);
   }
});
// 로그아웃
router.post("/logout", (req, res) => {
   const result = createResult();
   try {
      // 세션에서 사용자 정보 삭제
      delete req.session.user;
      res.status(200).send(result);
   } catch (error) {
      console.error("로그아웃 중 에러 발생:", error);
      result.message = "로그아웃 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});
// 회원가입
router.post("/signup", async (req, res) => {
   const { id, pw, name, phone_num, email } = req.body;
   const result = createResult();

   try {
      validation.validateId(id);
      validation.validatePassword(pw);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);

      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM homework.user WHERE id = $1";
      const idResults = await postgresClient.query(checkIdSql, [id]);

      if (idResults.rowCount > 0) {
         result.message = '아이디가 이미 존재합니다.';
         return res.status(409).send(result);
      }

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM homework.user WHERE phone_num = $1";
      const phoneResults = await postgresClient.query(checkPhoneSql, [phone_num]);

      if (phoneResults.rowCount > 0) {
         result.message = '전화번호가 이미 존재합니다.';
         return res.status(409).send(result);
      }

      // 회원가입 처리
      const insertUserSql = "INSERT INTO homework.user (id, password, name, phone_num, email) VALUES ($1, $2, $3, $4, $5)";
      await postgresClient.query(insertUserSql, [id, pw, name, phone_num, email]);

      result.message = "회원가입 성공";
      return res.status(201).send(result);
   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);
      result.message = error.message || '회원가입 중 에러가 발생하였습니다.';
      res.status(error.status || 500).send(result);
   }
});
// 아이디 찾기
router.get("/find-id", async (req, res) => {
   const { name, phone_num, email } = req.query;
   const result = createResult();

   try {
      validation.validateName(name);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);

      // db 처리로 id 가져오기
      const findIdSql = "SELECT id FROM homework.user WHERE name = $1 AND phone_num = $2 AND email = $3";
      const results = await postgresClient.query(findIdSql, [name, phone_num, email]);

      if (results.rowCount === 0) {
         result.message = '일치하는 사용자가 없습니다.';
         return res.status(404).send(result);
      }

      // 결과에서 아이디 추출
      const foundId = results.rows[0].id;
      result.message = '아이디 찾기 성공';
      result.data = { foundId };
      return res.status(200).send(result);
   } catch (error) {
      console.error("아이디 찾기 중 에러 발생:", error);
      result.message = error.message || '아이디 찾기 중 에러가 발생하였습니다.';
      return res.status(error.status || 500).send(result);
   }
});
//비밀번호 찾기
router.get("/find-pw", async (req, res) => {
   const { id, name, phone_num, email } = req.query;
   const result = createResult();

   try {
      validation.validateId(id);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);

      // 비밀번호를 가져오기 위한 쿼리
      const getPasswordSql = "SELECT password FROM homework.user WHERE id = $1 AND name = $2 AND phone_num = $3 AND email = $4";
      const results = await postgresClient.query(getPasswordSql, [id, name, phone_num, email]);

      if (results.rowCount === 0) {
         result.message = '일치하는 사용자가 없습니다.';
         return res.status(404).send(result);
      }

      // 결과에서 비밀번호 추출
      const foundPassword = results.rows[0].password;

      // 비밀번호 찾기 성공
      result.message = '받아온 비밀번호 출력: ' + foundPassword;
      return res.status(200).send(result);
   } catch (error) {
      console.error("비밀번호 찾기 중 에러 발생:", error);
      result.message = error.message || "비밀번호 찾기 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//============내 정보================
// 내 정보 보기
router.get("/", loginCheck, (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      // 사용자 정보를 가져와서 처리
      const { id, name, phone_num, email } = user;
      result.data = {
         id,
         name,
         phone_num,
         email,
      };
      res.status(200).send(result);
   } catch (error) {
      console.error("내 정보 보기 중 에러 발생:", error);
      result.message = "내 정보 보기 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});
// 내 정보 수정
router.put("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const { idx } = user;
      const { name, phone_num, email, pw } = req.body;

      validation.validatePassword(pw);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM homework.user WHERE phone_num = $1 AND idx <> $2";
      const phoneResults = await postgresClient.query(checkPhoneSql, [phone_num, idx]);

      if (phoneResults.rowCount > 0) {
         result.message = '전화번호가 이미 존재합니다.';
         return res.status(409).send(result);
      }

      // DB 통신 - 사용자 정보 수정
      const updateUserSql = "UPDATE homework.user SET password = $1, phone_num = $2, email = $3, name = $4 WHERE idx = $5";
      await postgresClient.query(updateUserSql, [pw, phone_num, email, name, idx]);

      result.message = "회원 정보가 성공적으로 수정되었습니다.";
      return res.status(200).send(result);
   } catch (error) {
      console.error("내 정보 수정 중 에러 발생:", error);
      result.message = error.message || "내 정보 수정 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   } finally {
      // PostgreSQL 클라이언트 연결 종료
      await postgresClient.end();
   }
});
// 회원 탈퇴
router.delete("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const idx = user.idx;

      const deleteSql = "DELETE FROM homework.user WHERE idx = $1";
      await postgresClient.query(deleteSql, [idx]);

      result.message = "회원 정보가 성공적으로 삭제되었습니다.";
      return res.status(200).send(result);
   } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      result.message = error.message || "회원 탈퇴 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   } finally {
      if (postgresClient) {
         postgresClient.end()
      }
   }
});

module.exports = router