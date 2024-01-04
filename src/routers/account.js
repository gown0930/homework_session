const router = require("express").Router()
const { queryDatabase } = require("../modules/connection");
const validation = require("../modules/validation");
const createResult = require("../modules/result");
const loginCheck = require("../middleware/loginCheck");
const handleServerError = require('../modules/errorHandler');


//===========로그인 & 회원가입 ===============
// 로그인
router.post('/login', async (req, res) => {
   const { id, pw } = req.body;
   const result = createResult();

   try {
      validation.validateId(id);
      validation.validatePassword(pw);

      if (req.session.user) return res.status(200).send(createResult('이미 로그인되어 있습니다.'));

      // 로그인 처리
      const sql = `SELECT * FROM homework.user WHERE id = $1 AND password = $2`;
      const rows = await queryDatabase(sql, [id, pw]);

      if (!rows || rows.length === 0) {
         return res.status(401).send(createResult('아이디 또는 비밀번호가 일치하지 않습니다.'));
      }

      const login = rows[0];
      req.session.user = {
         idx: login.idx,
         id: login.id,
         name: login.name,
         phone_num: login.phone_num,
         email: login.email,
         isAdmin: login.isadmin
      };
      res.locals.response = result;
      res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "로그인 중 에러가 발생하였습니다.");
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
      handleServerError(error, res, 500, "로그아웃 중 에러가 발생하였습니다.");
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

      if (req.session.user) return res.status(200).send(createResult('이미 로그인되어 있습니다.'));

      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM homework.user WHERE id = $1";
      const idResults = await queryDatabase(checkIdSql, [id]);

      if (idResults.length > 0) return res.status(409).send(createResult('아이디가 이미 존재합니다.'));

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM homework.user WHERE phone_num = $1";
      const phoneResults = await queryDatabase(checkPhoneSql, [phone_num]);

      if (phoneResults.length > 0) return res.status(409).send(createResult('전화번호가 이미 존재합니다.'));

      // 회원가입 처리
      const insertUserSql = "INSERT INTO homework.user (id, password, name, phone_num, email) VALUES ($1, $2, $3, $4, $5)";
      await queryDatabase(insertUserSql, [id, pw, name, phone_num, email]);
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "회원가입 중 에러가 발생하였습니다.");
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
      const results = await queryDatabase(findIdSql, [name, phone_num, email]);

      if (results.length === 0) {
         return res.status(404).send(createResult('일치하는 사용자가 없습니다.'));
      }

      // 결과에서 아이디 추출
      const foundId = results[0].id;
      result.data = { foundId };
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "아이디 찾기 중 에러가 발생하였습니다.");
   }
});

// 비밀번호 찾기
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
      const results = await queryDatabase(getPasswordSql, [id, name, phone_num, email]);

      if (results.length === 0) return res.status(404).send(createResult('일치하는 사용자가 없습니다.'));

      // 결과에서 비밀번호 추출
      const foundPassword = results[0].password;
      result.data = { foundPassword };
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "비밀번호 찾기 중 에러가 발생하였습니다.");
   }
});


//============내 정보================
// 내 정보 보기
router.get("/", loginCheck, async (req, res) => {
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
      res.locals.response = result;
      res.status(200).json(result); // res.json()으로 변경
   } catch (error) {
      handleServerError(error, res, 500, "내 정보 보기 중 에러가 발생하였습니다.");
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
      const phoneResults = await queryDatabase(checkPhoneSql, [phone_num, idx]);

      if (phoneResults.rowCount > 0) return res.status(409).json(createResult('전화번호가 이미 존재합니다.'));

      // DB 통신 - 사용자 정보 수정
      const updateUserSql = "UPDATE homework.user SET password = $1, phone_num = $2, email = $3, name = $4 WHERE idx = $5";
      await queryDatabase(updateUserSql, [pw, phone_num, email, name, idx]);
      res.locals.response = result;
      return res.status(200).json(result); // res.json()으로 변경
   } catch (error) {
      handleServerError(error, res, 500, "내 정보 수정 중 에러가 발생하였습니다.");
   }
});

// 회원 탈퇴
router.delete("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const idx = user.idx;

      const deleteSql = "DELETE FROM homework.user WHERE idx = $1";
      await queryDatabase(deleteSql, [idx]);
      res.locals.response = result;
      return res.status(200).json(result); // res.json()으로 변경
   } catch (error) {
      handleServerError(error, res, 500, "회원 탈퇴 중 에러가 발생하였습니다.");
   }
});




module.exports = router