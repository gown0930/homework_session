const router = require("express").Router()
const path = require("path")
const connection = require(path.join(__dirname, "../../connection.js"));

const idPattern = /^[a-zA-Z0-9_]{5,20}$/; // 5~20자의 영문 소문자, 대문자, 숫자, 언더스코어 허용
const pwPattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*_-]{8,}$/; // 8자 이상의 영문, 숫자, 특수문자 중 2가지 이상 조합 허용
const phonePattern = /^\d{10,11}$/; // 10자 또는 11자의 숫자 허용
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // 이메일 형식
const nameLengthRegex = /^.{3,20}$/;//이름 길이 제한

//===========로그인 & 회원가입 ===============

// 로그인
router.post("/login", async (req, res) => {
   const { id, pw } = req.body;
   const result = {
      message: '',
   };

   try {
      if (!id || id.trim() === "") throw { status: 400, message: '아이디를 입력해주세요.' };
      if (!pw || pw.trim() === "") throw { status: 400, message: '비밀번호를 입력해주세요.' };

      // 아이디 정규식
      if (!idPattern.test(id)) throw { status: 400, message: '아이디 형식이 올바르지 않습니다.' };
      // 비밀번호 정규식
      if (!pwPattern.test(pw)) throw { status: 400, message: '비밀번호 형식이 올바르지 않습니다.' };

      // 로그인 처리
      const sql = "SELECT * FROM user WHERE id = ? AND password = ?";
      const results = await connection.query(sql, [id, pw]);

      if (results.length === 0) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };

      // 로그인 성공
      result.message = "로그인 성공";
      // 세션에 사용자 정보 저장
      req.session.user = {
         idx: results[0].idx,
         id: results[0].id,
         name: results[0].name,
         phone_num: results[0].phone_num,
         email: results[0].email,
      };
      console.log("로그인 성공 - 사용자 정보:", req.session.user);
      res.status(200).send(result);
   } catch (error) {
      const status = error.status || 500;
      const message = error.message || "로그인 중 에러가 발생하였습니다.";
      console.error("로그인 중 에러 발생:", message);
      result.message = message;
      res.status(status).send(result);
   }
});


// 로그아웃
router.post("/logout", (req, res) => {
   const result = {
      message: '',
   };
   try {
      // 세션에서 사용자 정보 삭제
      delete req.session.user;
      result.message = "로그아웃 성공";
      res.status(200).send(result);
   } catch (error) {
      console.error("로그아웃 중 에러 발생:", error);
      result.message = "로그아웃 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 회원가입
app.post("/signup", async (req, res, next) => {
   const { id, pw, name, phone_num, email } = req.body;
   const result = {
      message: "",
   };

   try {
      if (!id || id.trim() === "") throw { status: 400, message: "아이디를 입력해주세요." };
      if (!pw || pw.trim() === "") throw { status: 400, message: "비밀번호를 입력해주세요." };
      if (!name || name.trim() === "") throw { status: 400, message: "이름을 입력해주세요." };
      if (!phone_num || phone_num.trim() === "") throw { status: 400, message: "핸드폰 번호를 입력해주세요." };
      if (!email || email.trim() === "") throw { status: 400, message: "이메일을 입력해주세요." };

      // 아이디 정규식
      if (!idPattern.test(id)) throw { status: 400, message: "아이디 형식이 올바르지 않습니다." };
      // 비밀번호 정규식
      if (!pwPattern.test(pw)) throw { status: 400, message: "비밀번호 형식이 올바르지 않습니다." };
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) throw { status: 400, message: "전화번호 형식이 올바르지 않습니다." };
      // 이메일 정규식
      if (!emailPattern.test(email)) throw { status: 400, message: "이메일 형식이 올바르지 않습니다." };
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) throw { status: 400, message: "이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다." };

      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM user WHERE id = ?";
      const idResults = await connection.query(checkIdSql, [id]);
      if (idResults.length > 0) throw { status: 409, message: "아이디가 이미 존재합니다." };

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM user WHERE phone_num = ?";
      const phoneResults = await connection.query(checkPhoneSql, [phone_num]);
      if (phoneResults.length > 0) throw { status: 409, message: "전화번호가 이미 존재합니다." };

      // 회원가입 처리
      const insertUserSql = "INSERT INTO user (id, password, name, phone_num, email) VALUES (?, ?, ?, ?, ?)";
      const insertResults = await connection.query(insertUserSql, [id, pw, name, phone_num, email]);
      if (insertResults.affectedRows !== 1) throw { status: 500, message: "회원가입 중 에러가 발생하였습니다." };

      result.message = "회원가입 성공";
      res.status(201).send(result);
   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);
      result.message = "회원가입 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

// 아이디 찾기
router.get("/find-id", async (req, res) => {
   const { name, phone_num, email } = req.query;
   const result = { message: '' };

   try {
      console.log("Received values:", { name, phone_num, email });
      console.log(`phonePattern: ${phonePattern.test(phone_num)}`);
      console.log(`emailPattern: ${emailPattern.test(email)}`);
      console.log(`nameLengthRegex: ${nameLengthRegex.test(name)}`);

      if (name === null || name === "" || name === undefined) throw { status: 400, message: '이름을 입력해주세요.' };
      if (phone_num === null || phone_num === "" || phone_num === undefined) throw { status: 400, message: '핸드폰 번호를 입력해주세요.' };
      if (email === null || email === "" || email === undefined) throw { status: 400, message: '이메일을 입력해주세요.' };
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) throw { status: 400, message: '전화번호 형식이 올바르지 않습니다.' };
      // 이메일 정규식
      if (!emailPattern.test(email)) throw { status: 400, message: '이메일 형식이 올바르지 않습니다.' };
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) throw { status: 400, message: '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.' };

      // db 처리로 id 가져오기
      const findIdSql = "SELECT id FROM user WHERE name = ? AND phone_num = ? AND email = ?";
      const results = await connection.query(findIdSql, [name, phone_num, email]);

      if (!Array.isArray(results) || results.length === 0) throw { status: 404, message: '일치하는 사용자가 없습니다.' };

      // 결과에서 아이디 추출
      const foundId = results[0].id;
      result.message = '아이디 찾기 성공';
      result.data = { foundId };
      res.status(200).send(result);
   } catch (error) {
      const status = error.status || 500;
      const message = error.message || "아이디 찾기 중 에러가 발생하였습니다.";
      console.error("아이디 찾기 중 에러 발생:", message);
      result.message = message;
      res.status(status).send(result);
   }
});


//비밀번호 찾기
router.get("/find-pw", async (req, res) => {
   const { id, name, phone_num, email } = req.query;
   const result = { message: '' };

   try {
      if (id === null || id === "" || id === undefined) throw { status: 400, message: '아이디를 입력해주세요.' };
      if (name === null || name === "" || name === undefined) throw { status: 400, message: '이름을 입력해주세요.' };
      if (phone_num === null || phone_num === "" || phone_num === undefined) throw { status: 400, message: '핸드폰 번호를 입력해주세요.' };
      if (email === null || email === "" || email === undefined) throw { status: 400, message: '이메일을 입력해주세요.' };
      // 아이디 정규식
      if (!idPattern.test(id)) throw { status: 400, message: '아이디 형식이 올바르지 않습니다.' };
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) throw { status: 400, message: '전화번호 형식이 올바르지 않습니다.' };
      // 이메일 정규식
      if (!emailPattern.test(email)) throw { status: 400, message: '이메일 형식이 올바르지 않습니다.' };
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) throw { status: 400, message: '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.' };

      // 비밀번호를 가져오기 위한 쿼리
      const getPasswordSql = "SELECT password FROM user WHERE id = ? AND name = ? AND phone_num = ? AND email = ?";
      const results = await connection.query(getPasswordSql, [id, name, phone_num, email]);

      if (!Array.isArray(results) || results.length === 0)
         throw { status: 404, message: '일치하는 사용자가 없습니다.' };

      // 결과에서 비밀번호 추출
      const foundPassword = results[0].password;

      // 로그인 처리
      result.message = '받아온 비밀번호 출력: ' + foundPassword;
      res.status(200).send(result);
   } catch (error) {
      const status = error.status || 500;
      const message = error.message || "비밀번호 찾기 중 에러가 발생하였습니다.";
      console.error("비밀번호 찾기 중 에러 발생:", message);
      result.message = message;
      res.status(status).send(result);
   }
});



//rest에서 get이랑 delete는 body를 못 보내서, querySting이랑 passparameter 있음.

//============내 정보================

// 내 정보 보기
router.get("/", (req, res) => {
   const user = req.session.user;
   let result = {
      message: '',
   };
   try {
      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

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
// 회원 정보 수정
router.put("/", async (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };

      const { idx, id, oldName, oldPhone_num, oldEmail, oldPw } = user;
      const { name, phone_num, email, pw } = req.body;

      if (!pw || pw.trim() === "") throw { status: 400, message: '비밀번호를 입력해주세요.' };
      if (!name || name.trim() === "") throw { status: 400, message: '이름을 입력해주세요.' };
      if (!phone_num || phone_num.trim() === "") throw { status: 400, message: '핸드폰 번호를 입력해주세요.' };
      if (!email || email.trim() === "") throw { status: 400, message: '이메일을 입력해주세요.' };

      // 비밀번호 정규식
      if (!pwPattern.test(pw)) throw { status: 400, message: '비밀번호 형식이 올바르지 않습니다.' };
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) throw { status: 400, message: '전화번호 형식이 올바르지 않습니다.' };
      // 이메일 정규식
      if (!emailPattern.test(email)) throw { status: 400, message: '이메일 형식이 올바르지 않습니다.' };
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) throw { status: 400, message: '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.' };

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM user WHERE phone_num = ? AND idx <> ?";
      const phoneResults = await queryAsync(checkPhoneSql, [phone_num, idx]);
      if (phoneResults.length > 0) throw { status: 409, message: '전화번호가 이미 존재합니다.' };

      // DB 통신
      const updateSql = "UPDATE user SET password = ?, phone_num = ?, email = ?, name = ? WHERE idx = ?";
      const updateResults = await queryAsync(updateSql, [pw, phone_num, email, name, idx]);

      if (updateResults.affectedRows > 0) {
         result.message = "회원 정보가 성공적으로 수정되었습니다.";
         res.status(200).send(result);
      } else {
         console.error("영향 받은 행이 없음");
         throw { status: 500, message: "회원 정보 수정에 실패하였습니다." };
      }
   } catch (error) {
      const status = error.status || 500;
      const message = error.message || "내 정보 수정 중 에러가 발생하였습니다.";
      console.error("내 정보 수정 중 에러 발생:", message);
      result.message = message;
      res.status(status).send(result);
   }
});

//회원 탈퇴
router.delete("/", async (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) {
         throw { status: 401, message: "로그인이 필요합니다." };
      }

      const idx = user.idx;

      // DB 통신
      const deleteSql = "DELETE FROM user WHERE idx = ?";
      // DB 통신
      const deleteResult = await connection.query(deleteSql, [idx]);

      // DB 통신 결과 처리
      if (deleteResult.affectedRows > 0) {
         result.message = "회원 정보가 성공적으로 삭제되었습니다.";
         res.status(200).send(result);
      } else {
         throw { status: 500, message: '회원 정보 삭제에 실패하였습니다. 유효한 사용자 인덱스인지 확인해주세요.' };
      }
   } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      result.message = error.message || "회원 탈퇴 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});


module.exports = router