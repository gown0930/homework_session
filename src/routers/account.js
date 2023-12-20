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
router.post("/login", (req, res) => {
   const { id, pw } = req.body;
   const result = {
      message: '',
   };
   try {
      if (id === null || id === "" || id === undefined) {
         result.message = '아이디를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (pw === null || pw === "" || pw === undefined) {
         result.message = '비밀번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      // 아이디 정규식
      if (!idPattern.test(id)) {
         result.message = '아이디 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 비밀번호 정규식
      if (!pwPattern.test(pw)) {
         result.message = '비밀번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 로그인 처리
      const sql = "SELECT * FROM user WHERE id = ? AND password = ?";
      connection.query(sql, [id, pw], (error, results) => {
         if (error) {
            console.error("로그인 쿼리 중 에러 발생:", error);
            result.message = "로그인 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         if (results.length === 0) {
            result.message = '아이디 또는 비밀번호가 일치하지 않습니다.';
            return res.status(401).send(result);
         }
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
      });
   } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      result.message = "로그인 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
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
router.post("/signup", (req, res) => {
   const { id, pw, name, phone_num, email } = req.body;
   const result = {
      message: '',
   };

   try {
      if (id === null || id === "" || id === undefined) {
         result.message = '아이디를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (pw === null || pw === "" || pw === undefined) {
         result.message = '비밀번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (name === null || name === "" || name === undefined) {
         result.message = '이름을 입력해주세요.';
         return res.status(400).send(result)
      }
      if (phone_num === null || phone_num === "" || phone_num === undefined) {
         result.message = '핸드폰 번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (email === null || email === "" || email === undefined) {
         result.message = '이메일을 입력해주세요.';
         return res.status(400).send(result)
      }
      // 아이디 정규식
      if (!idPattern.test(id)) {
         result.message = '아이디 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 비밀번호 정규식
      if (!pwPattern.test(pw)) {
         result.message = '비밀번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) {
         result.message = '전화번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이메일 정규식
      if (!emailPattern.test(email)) {
         result.message = '이메일 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) {
         result.message = '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.';
         return res.status(400).send(result);
      }
      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM user WHERE id = ?";
      connection.query(checkIdSql, [id], (idError, idResults) => {
         if (idError) {
            console.error("아이디 중복 확인 쿼리 중 에러 발생:", idError);
            result.message = "회원가입 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (idResults.length > 0) {
            result.message = '아이디가 이미 존재합니다.';
            return res.status(409).send(result);
         }
      });

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM user WHERE phone_num = ?";
      connection.query(checkPhoneSql, [phone_num], (phoneError, phoneResults) => {
         if (phoneError) {
            console.error("전화번호 중복 확인 쿼리 중 에러 발생:", phoneError);
            result.message = "회원가입 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (phoneResults.length > 0) {
            result.message = '전화번호가 이미 존재합니다.';
            return res.status(409).send(result);
         }
      });

      // 회원가입 처리
      const insertUserSql = "INSERT INTO user (id, password, name, phone_num, email) VALUES (?, ?, ?, ?, ?)";
      connection.query(insertUserSql, [id, pw, name, phone_num, email], (error, results) => {
         if (error) {
            console.error("회원가입 쿼리 중 에러 발생:", error);
            result.message = "회원가입 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         result.message = "회원가입 성공";
         res.status(201).send(result);
      });

   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);
      result.message = "회원가입 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});


// 아이디 찾기
router.get("/find-id", (req, res) => {
   const { name, phone_num, email } = req.query;
   const result = {
      message: '',
   };
   try {
      console.log("Received values:", { name, phone_num, email });
      console.log(`phonePattern: ${phonePattern.test(phone_num)}`);
      console.log(`emailPattern: ${emailPattern.test(email)}`);
      console.log(`nameLengthRegex: ${nameLengthRegex.test(name)}`);

      if (name === null || name === "" || name === undefined) {
         result.message = '이름을 입력해주세요.';
         return res.status(400).send(result)
      }
      if (phone_num === null || phone_num === "" || phone_num === undefined) {
         result.message = '핸드폰 번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (email === null || email === "" || email === undefined) {
         result.message = '이메일을 입력해주세요.';
         return res.status(400).send(result)
      }
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) {
         result.message = '전화번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이메일 정규식
      if (!emailPattern.test(email)) {
         result.message = '이메일 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) {
         result.message = '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.';
         return res.status(400).send(result);
      }

      // db 처리로 id 가져오기
      const findIdSql = "SELECT id FROM user WHERE name = ? AND phone_num = ? AND email = ?";
      connection.query(findIdSql, [name, phone_num, email], (error, results) => {
         if (error) {
            console.error("아이디 찾기 쿼리 중 에러 발생:", error);
            result.message = "아이디 찾기 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (!Array.isArray(results) || results.length === 0) {
            result.message = '일치하는 사용자가 없습니다.';
            return res.status(404).send(result);
         }

         // 결과에서 아이디 추출
         const foundId = results[0].id;
         result.message = '아이디 찾기 성공';
         result.data = { foundId };
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("아이디 찾기 중 에러 발생:", error);
      result.message = "아이디 찾기 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

//비밀번호 찾기
router.get("/find-pw", (req, res) => {
   const { id, name, phone_num, email } = req.query;
   const result = {
      message: '',
   };
   try {
      if (id === null || id === "" || id === undefined) {
         result.message = '아이디를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (name === null || name === "" || name === undefined) {
         result.message = '이름을 입력해주세요.';
         return res.status(400).send(result)
      }
      if (phone_num === null || phone_num === "" || phone_num === undefined) {
         result.message = '핸드폰 번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (email === null || email === "" || email === undefined) {
         result.message = '이메일을 입력해주세요.';
         return res.status(400).send(result)
      }
      // 아이디 정규식
      if (!idPattern.test(id)) {
         result.message = '아이디 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) {
         result.message = '전화번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이메일 정규식
      if (!emailPattern.test(email)) {
         result.message = '이메일 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) {
         result.message = '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.';
         return res.status(400).send(result);
      }

      // 비밀번호를 가져오기 위한 쿼리
      const getPasswordSql = "SELECT password FROM user WHERE id = ? AND name = ? AND phone_num = ? AND email = ?";
      connection.query(getPasswordSql, [id, name, phone_num, email], (error, results) => {
         if (error) {
            console.error("비밀번호 찾기 쿼리 중 에러 발생:", error);
            result.message = "비밀번호 찾기 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (results.length === 0) {
            result.message = '일치하는 사용자가 없습니다.';
            return res.status(404).send(result);
         }

         // 결과에서 비밀번호 추출
         const foundPassword = results[0].password;

         // 로그인 처리
         result.message = '받아온 비밀번호 출력: ' + foundPassword;
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("비밀번호 찾기 중 에러 발생:", error);
      result.message = "비밀번호 찾기 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
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
router.put("/", async (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }
      const { idx, id, oldName, oldPhone_num, oldEmail, odlPw } = user;
      const { name, phone_num, email, pw } = req.body;

      if (pw === null || pw === "" || pw === undefined) {
         result.message = '비밀번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (name === null || name === "" || name === undefined) {
         result.message = '이름을 입력해주세요.';
         return res.status(400).send(result)
      }
      if (phone_num === null || phone_num === "" || phone_num === undefined) {
         result.message = '핸드폰 번호를 입력해주세요.';
         return res.status(400).send(result)
      }
      if (email === null || email === "" || email === undefined) {
         result.message = '이메일을 입력해주세요.';
         return res.status(400).send(result)
      }

      // 비밀번호 정규식
      if (!pwPattern.test(pw)) {
         result.message = '비밀번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 전화번호 정규식
      if (!phonePattern.test(phone_num)) {
         result.message = '전화번호 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이메일 정규식
      if (!emailPattern.test(email)) {
         result.message = '이메일 형식이 올바르지 않습니다.';
         return res.status(400).send(result);
      }
      // 이름 정규식 
      if (!nameLengthRegex.test(name)) {
         result.message = '이름은 최소 3자 이상, 최대 20자까지 입력 가능합니다.';
         return res.status(400).send(result);
      }

      // 전화번호 중복 확인
      const checkPhoneSql = "SELECT * FROM user WHERE phone_num = ?";
      connection.query(checkPhoneSql, [phone_num], (phoneError, phoneResults) => {
         if (phoneError) {
            console.error("전화번호 중복 확인 쿼리 중 에러 발생:", phoneError);
            result.message = "회원가입 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (phoneResults.length > 0) {
            result.message = '전화번호가 이미 존재합니다.';
            return res.status(409).send(result);
         }

         // DB 통신
         const updateSql = "UPDATE user SET password = ?, phone_num = ?, email = ?, name = ? WHERE idx = ?";

         connection.query(updateSql, [pw, phone_num, email, name, idx], (updateError, updateResults) => {
            if (updateError) {
               console.error("내 정보 수정 중 에러 발생:", updateError.message);
               console.error("SQL 문장:", updateSql);
               console.error("바인딩 값:", [pw, phone_num, email, name, idx]);
               result.message = "내 정보 수정 중 에러가 발생하였습니다.";
               return res.status(500).send(result);
            }

            if (updateResults.affectedRows > 0) {
               result.message = "회원 정보가 성공적으로 수정되었습니다.";
               res.status(200).send(result);
            } else {
               console.error("영향 받은 행이 없음");
               result.message = "회원 정보 수정에 실패하였습니다.";
               res.status(500).send(result);
            }
         });
      });
   } catch (error) {
      console.error("내 정보 수정 중 에러 발생:", error);
      result.message = "내 정보 수정 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
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
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      // const userIdx = req.params.idx; // 동적으로 전달된 idx
      const idx = user.idx;//아니면 이런식으로..?

      // DB 통신
      const deleteSql = "DELETE FROM user WHERE idx = ?";
      // DB 통신
      connection.query(deleteSql, [idx], (deleteError, deleteResult) => {
         if (deleteError) {
            console.error("회원 삭제 중 에러 발생:", deleteError);
            result.message = "회원 삭제 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         // DB 통신 결과 처리
         if (deleteResult.affectedRows > 0) {
            result.message = "회원 정보가 성공적으로 삭제되었습니다.";
            return res.status(200).send(result);
         } else {
            result.message = '회원 정보 삭제에 실패하였습니다. 유효한 사용자 인덱스인지 확인해주세요.';
            return res.status(500).send(result);
         }
      });

   } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      result.message = "회원 탈퇴 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

module.exports = router