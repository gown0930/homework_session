const router = require("express").Router()
const path = require("path")
const connection = require(path.join(__dirname, "../../connection.js"));
const validation = require("../modules/validation")


//===========로그인 & 회원가입 ===============
// 로그인
router.post("/login", (req, res) => {
   const { id, pw } = req.body;
   const result = {
      message: '',
   };
   try {
      validation.validateId(id);
      validation.validatePassword(pw);

      if (req.session.user) {
         result.message = '이미 로그인되어 있습니다.';
         return res.status(200).send(result);
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
         // 세션에 사용자 정보 저장
         req.session.user = {
            idx: results[0].idx,
            id: results[0].id,
            name: results[0].name,
            phone_num: results[0].phone_num,
            email: results[0].email,
         };
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      result.message = error.message || "로그인 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
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
      validation.validateId(id);
      validation.validatePassword(pw);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);
      // 아이디 중복 확인
      const checkIdSql = "SELECT * FROM user WHERE id = ?";
      connection.query(checkIdSql, [id], (idError, idResults) => {
         if (idError) {
            result.message = '아이디 중복 확인 중 에러가 발생하였습니다.';
            return res.status(500).send(result);
         }
         if (idResults.length > 0) {
            result.message = '아이디가 이미 존재합니다.';
            return res.status(409).send(result);
         }
         // 전화번호 중복 확인
         const checkPhoneSql = "SELECT * FROM user WHERE phone_num = ?";
         connection.query(checkPhoneSql, [phone_num], (phoneError, phoneResults) => {
            if (phoneError) {
               result.message = '전화번호 중복 확인 중 에러가 발생하였습니다.';
               console.log(phoneError)
               return res.status(500).send(result);
            }
            if (phoneResults.length > 0) {
               result.message = '전화번호가 이미 존재합니다.';
               return res.status(409).send(result);
            }
            // 회원가입 처리
            const insertUserSql = "INSERT INTO user (id, password, name, phone_num, email) VALUES (?, ?, ?, ?, ?)";
            connection.query(insertUserSql, [id, pw, name, phone_num, email], (error, results) => {
               if (error) {
                  result.message = '회원가입 중 에러가 발생하였습니다.';
                  return res.status(500).send(result);
               }
               result.message = "회원가입 성공";
               return res.status(201).send(result);
            });
         });
      });
   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);
      result.message = error.message || '회원가입 중 에러가 발생하였습니다.';
      res.status(error.status || 500).send(result);
   }
});
// 아이디 찾기
router.get("/find-id", (req, res) => {
   const { name, phone_num, email } = req.query;
   const result = {
      message: '',
   };
   try {
      validation.validateName(name);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      // db 처리로 id 가져오기
      const findIdSql = "SELECT id FROM user WHERE name = ? AND phone_num = ? AND email = ?";
      connection.query(findIdSql, [name, phone_num, email], (error, results) => {
         if (error) {
            result.message = '아이디 찾기 중 에러가 발생하였습니다.';
            res.status(500).send(result);
         }
         if (!Array.isArray(results) || results.length === 0) {
            result.message = '일치하는 사용자가 없습니다.';
            res.status(404).send(result);
         }
         // 결과에서 아이디 추출
         const foundId = results[0].id;
         result.message = '아이디 찾기 성공';
         result.data = { foundId };
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("아이디 찾기 중 에러 발생:", error);
      result.message = error.message || '아이디 찾기 중 에러가 발생하였습니다.';
      return res.status(error.status || 500).send(result);
   }
});
//비밀번호 찾기
router.get("/find-pw", (req, res) => {
   const { id, name, phone_num, email } = req.query;
   const result = {
      message: '',
   };
   try {
      validation.validateId(id);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);
      // 비밀번호를 가져오기 위한 쿼리
      const getPasswordSql = "SELECT password FROM user WHERE id = ? AND name = ? AND phone_num = ? AND email = ?";
      connection.query(getPasswordSql, [id, name, phone_num, email], (error, results) => {
         if (error) {
            result.message = ' 찾기 중 에러가 발생하였습니다.';
            res.status(500).send(result);
         }
         if (!Array.isArray(results) || results.length === 0) {
            result.message = '일치하는 사용자가 없습니다.';
            res.status(404).send(result);
         }
         // 결과에서 비밀번호 추출
         const foundPassword = results[0].password;
         // 로그인 처리
         result.message = '받아온 비밀번호 출력: ' + foundPassword;
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("비밀번호 찾기 중 에러 발생:", error);
      result.message = error.message || "비밀번호 찾기 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
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
router.put("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };

      const { idx } = user;
      const { name, phone_num, email, pw } = req.body;

      validation.validatePassword(pw);
      validation.validatePhoneNumber(phone_num);
      validation.validateEmail(email);
      validation.validateName(name);

      // 전화번호 중복 확인
      connection.query("SELECT * FROM user WHERE phone_num = ? AND idx <> ?", [phone_num, idx], (phoneError, phoneResults) => {
         if (phoneError) {
            result.message = '전화번호 중복 확인 중 에러가 발생하였습니다.';
            return res.status(500).send(result);
         }
         if (phoneResults.length > 0) {
            result.message = '전화번호가 이미 존재합니다.';
            return res.status(409).send(result);
         }
         // DB 통신
         connection.query("UPDATE user SET password = ?, phone_num = ?, email = ?, name = ? WHERE idx = ?", [pw, phone_num, email, name, idx], (updateError, updateResults) => {
            if (updateError) {
               result.message = '내 정보 수정 중 에러가 발생하였습니다.';
               return res.status(500).send(result);
            }
            result.message = "회원 정보가 성공적으로 수정되었습니다.";
            res.status(200).send(result);
         });
      });
   } catch (error) {
      console.error("내 정보 수정 중 에러 발생:", error);
      result.message = error.message || "내 정보 수정 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});
// 회원 탈퇴
router.delete("/", async (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };
      const idx = user.idx;

      const deleteSql = "DELETE FROM user WHERE idx = ?";
      connection.query(deleteSql, [idx], (deleteError, deleteResult) => {
         if (deleteError) {
            result.message = "회원 삭제 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         result.message = "회원 정보가 성공적으로 삭제되었습니다.";
         return res.status(200).send(result);
      });
   } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      result.message = "회원 탈퇴 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

module.exports = router