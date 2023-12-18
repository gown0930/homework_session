const router = require("express").Router()

const idPattern = /^[a-zA-Z0-9_]{5,20}$/; // 5~20자의 영문 소문자, 대문자, 숫자, 언더스코어 허용
const pwPattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*_-]{8,}$/; // 8자 이상의 영문, 숫자, 특수문자 중 2가지 이상 조합 허용
const phonePattern = /^\d{10,11}$/; // 10자 또는 11자의 숫자 허용
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // 이메일 형식
const nameLengthRegex = /^.{3,20}$/;//이름 길이 제한

//===========로그인 & 회원가입 ===============

// 로그인
router.post("/login", (req, res) => {
   try {
      const { id, pw } = req.body;
      const result = {
         //success: false,
         //상태 코드 있으면 success 필요 없음.
         //상태코드 200,400(프론트 api 못 맞춰줬을때),401(인증 오류),500(뱍엔드)
         message: '',
         // data: {
         //    isDuplicated: false
         // }
      };
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
      connection.query(sql, [id, pw], (error, results, fields) => {
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
         // 여기에서 세션 설정 등 로그인에 필요한 작업을 수행할 수 있습니다.
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      result.message = "로그인 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 회원가입
router.post("/signup", (req, res) => {
   try {
      const { id, pw, name, phone_num, email } = req.body;
      const result = {
         message: '',
      };

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

      // 사용자 정보 db에서 가져왔다 치자.
      const existingUser = "";
      const existingPhoneNum = "";

      // 아이디 중복 확인
      if (existingUser) {
         result.message = '아이디가 이미 존재합니다.';
         return res.status(409).send(result);
      }

      // 전화번호 중복 확인
      if (existingPhoneNum) {
         result.message = '전화번호가 이미 존재합니다.';
         return res.status(409).send(result);
      }

      // db에 집어넣는 과정
      res.status(201).send(result);

   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);

      result.message = "회원가입 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 아이디 찾기
router.get("/find-id", (req, res) => {
   try {
      const { name, phone_num, email } = req.query;
      const result = {
         message: '',
      };

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

      // 로그인 처리
      res.status(200).send(result);
   } catch (error) {
      console.error("아이디 찾기 중 에러 발생:", error);
      result.success = false;
      result.message = "아이디 찾기 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 비밀번호 찾기
router.get("/find-pw", (req, res) => {
   try {
      const { id, name, phone_num, email } = req.query;
      const result = {
         message: '',
      };

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

      // db로 비밀번호 가져오기

      // 로그인 처리
      result.success = true;
      result.message = '받아온 비밀번호 출력';
      res.status(200).send(result);
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
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         const result = {
            success: false,
            message: "로그인이 필요합니다.",
         };
         return res.status(401).send(result);
      }

      // 사용자 정보를 가져와서 처리
      const { id, name, phone_num, email } = user;

      result = {
         data: {
            id,
            name,
            phone_num,
            email,
         },
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
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const { idx, id, name, phone_num, email } = req.body;

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

      //전화번호 중복 확인
      if (existingPhoneNum) {
         result.message = '전화번호가 이미 존재합니다.';
         return res.status(409).send(result); // 409 Conflict: 리소스의 현재 상태와 충돌이 발생했음을 나타냄
      }

      // db통신 결과
      const updateResult = "";

      // DB 통신 결과 처리
      if (updateResult.success) {
         return res.status(201).send(result);
      } else {
         result.message = '회원 정보 수정에 실패하였습니다.';
         return res.status(500).send(result);
      }
   } catch (error) {
      console.error("내 정보 수정 중 에러 발생:", error);
      result.message = "내 정보 수정 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

//회원 탈퇴
router.delete("/", async (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const userIdx = req.params.idx; // 동적으로 전달된 idx
      const idx = user.idx//아니면 이런식으로..?

      // DB 통신
      const deleteResult = "";

      // DB 통신 결과 처리
      if (deleteResult.success) {
         return res.status(200).send(result);
      } else {
         result.message = '회원 탈퇴에 실패하였습니다.';
         return res.status(500).send(result);
      }
   } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      result.message = "회원 탈퇴 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

module.exports = router