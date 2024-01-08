const router = require("express").Router()
const { queryDatabase } = require("../modules/connection");
const createResult = require("../modules/result");
const loginCheck = require("../middleware/loginCheck");
const logoutCheck = require("../middleware/logoutcheck");
const createValidationMiddleware = require('../middleware/validate');
const checkIdDuplicate = require('../middleware/checkIdDuplicate');
const checkPhoneDuplicate = require('../middleware/checkPhoneDuplicate');
const checkPasswordMatch = require('../middleware/checkPasswordMatch');

const checkLogin = require("../middleware/checkLogin")
const jwt = require("jsonwebtoken")

//===========로그인 & 회원가입 ===============
// 로그인
router.post('/login', logoutCheck, createValidationMiddleware(['id', 'pw']), async (req, res, next) => {
   const { id, pw } = req.body;
   const result = createResult();

   try {
      // 로그인 처리
      const sql = `SELECT * FROM homework.user WHERE id = $1 AND password = $2`;
      const rows = await queryDatabase(sql, [id, pw]);


      if (!rows || rows.length === 0) {
         return res.status(401).send(createResult('아이디 또는 비밀번호가 일치하지 않습니다.'));
         //401 : 클라이언트가 인증되지 않았거나, 인증 정보가 부족하거나 잘못되었을 때 
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

      const token = jwt.sign({
         idx: login.idx,
         id: login.id,
         name: login.name,
         phone_num: login.phone_num,
         email: login.email,
         isAdmin: login.isadmin

      }, process.env.SECRET_KEY, {
         issuer: "haeju",
         expiresIn: "30m"
      })
      result.data.token = token

      res.locals.response = result;
      res.status(200).send(result);
   } catch (error) {
      next(error);
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
      next(error);
   }
});
// 회원가입
router.post("/signup",
   logoutCheck,
   createValidationMiddleware(['id', 'pw', 'name', 'phone_num', 'email']),
   checkIdDuplicate,
   checkPhoneDuplicate,
   checkPasswordMatch,
   async (req, res) => {
      const { id, pw, name, phone_num, email, isadmin } = req.body;
      const result = createResult();

      try {
         // 회원가입 처리
         const insertUserSql = "INSERT INTO homework.user (id, password, name, phone_num, email, isadmin) VALUES ($1, $2, $3, $4, $5, $6)";
         await queryDatabase(insertUserSql, [id, pw, name, phone_num, email, isadmin]);
         res.locals.response = result;
         return res.status(200).send(result);
      } catch (error) {
         next(error);
      }
   });

// 아이디 찾기
router.get("/find-id", logoutCheck, createValidationMiddleware(['name', 'phone_num', 'email']), async (req, res) => {
   const { name, phone_num, email } = req.query;
   const result = createResult();

   try {

      // db 처리로 id 가져오기
      const findIdSql = "SELECT id FROM homework.user WHERE name = $1 AND phone_num = $2 AND email = $3";
      const results = await queryDatabase(findIdSql, [name, phone_num, email]);

      if (results.length === 0) {
         return res.status(200).send(createResult('일치하는 사용자가 없습니다.'));
      }

      // 결과에서 아이디 추출
      const foundId = results[0].id;
      result.data = { foundId };
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      next(error);
   }
});

// 비밀번호 찾기
router.get("/find-pw", logoutCheck, createValidationMiddleware(['id', 'name', 'phone_num', 'email']), async (req, res) => {
   const { id, name, phone_num, email } = req.query;
   const result = createResult();

   try {

      // 비밀번호를 가져오기 위한 쿼리
      const getPasswordSql = "SELECT password FROM homework.user WHERE id = $1 AND name = $2 AND phone_num = $3 AND email = $4";
      const results = await queryDatabase(getPasswordSql, [id, name, phone_num, email]);

      if (results.length === 0) return res.status(200).send(createResult('일치하는 사용자가 없습니다.'));

      // 결과에서 비밀번호 추출
      const foundPassword = results[0].password;
      result.data = { foundPassword };
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      next(error);
   }
});


//============내 정보================
// 내 정보 보기
router.get("/", loginCheck, checkLogin, async (req, res) => {
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
      res.status(200).send(result);
   } catch (error) {
      next(error);
   }
});

// 내 정보 수정
router.put("/", loginCheck, checkPhoneDuplicate, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const { idx } = user;
      const { name, phone_num, email, pw } = req.body;

      validation.validatePassword(pw);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);

      // DB 통신 - 사용자 정보 수정
      const updateUserSql = "UPDATE homework.user SET password = $1, phone_num = $2, email = $3, name = $4 WHERE idx = $5";
      await queryDatabase(updateUserSql, [pw, phone_num, email, name, idx]);
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      next(error);
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
      return res.status(200).send(result);
   } catch (error) {
      next(error);
   }
});




module.exports = router