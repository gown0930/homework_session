//js에서 다른 js import
const express = require("express");
const session = require("express-session");
//쿠키를 만들어줌

//Init
const app = express()
const port = 8000

//session
app.use(
   session({
      secret: "haeju0930",
      //세션을 서명하기 위한 키???
      resave: false,
      saveUninitialized: true,
      //쿠키 추가해줘봐
   })
);

//Apis

const idPattern = /^[a-zA-Z0-9_]{5,20}$/; // 5~20자의 영문 소문자, 대문자, 숫자, 언더스코어 허용
const pwPattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*_-]{8,}$/; // 8자 이상의 영문, 숫자, 특수문자 중 2가지 이상 조합 허용
const phonePattern = /^\d{10,11}$/; // 10자 또는 11자의 숫자 허용
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // 이메일 형식
const nameLengthRegex = /^.{3,20}$/;//이름 길이 제한

//===========로그인 & 회원가입 ===============

// 로그인
app.post("/login", (req, res) => {
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
      result.message = '로그인이 성공적으로 완료되었습니다.';
      res.status(200).send(result);

   } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      result.message = "로그인 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 회원가입
app.post("/account", (req, res) => {
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

      result.message = '회원가입이 성공적으로 완료되었습니다.';
      res.status(201).send(result);

   } catch (error) {
      console.error("회원가입 중 에러 발생:", error);

      result.message = "회원가입 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 아이디 찾기
app.get("/account/find-id", (req, res) => {
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
      result.success = true;
      result.message = '받아온 id 출력';
      res.status(200).send(result);
   } catch (error) {
      console.error("아이디 찾기 중 에러 발생:", error);
      result.success = false;
      result.message = "아이디 찾기 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

// 비밀번호 찾기
app.get("/account/find-pw", (req, res) => {
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
app.get("/account", (req, res) => {
   try {
      const user = req.session.user;

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

      const result = {
         success: true,
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
      const result = {
         success: false,
         message: "내 정보 보기 중 에러가 발생하였습니다.",
      };
      return res.status(500).send(result);
   }
});

// 내 정보 수정
app.put("/account", (req, res) => {
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
         result.message = '회원 정보 수정이 성공적으로 완료되었습니다.';
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
app.delete("/account", async (req, res) => {
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
         result.message = '회원 탈퇴가 성공적으로 완료되었습니다.';
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


//=========게시글==========

// 게시글 쓰기
app.post("/post", (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const { title, content } = req.body;

      // 제목이 비어있는지 확인
      if (!title) {
         result.message = "제목은 필수 입력 항목입니다.";
         return res.status(400).send(result);
      }

      // 내용이 비어있는지 확인
      if (!content) {
         result.message = "내용은 필수 입력 항목입니다.";
         return res.status(400).send(result);
      }

      // 게시글을 데이터베이스에 저장
      const saveResult = "";

      // 데이터베이스 저장 결과에 따른 처리
      if (saveResult.success) {
         result.message = "게시글이 성공적으로 작성되었습니다.";
         return res.status(201).send(result);
      } else {
         result.message = "게시글 작성에 실패하였습니다.";
         return res.status(500).send(result);
      }
   } catch (error) {
      console.error("게시글 작성 중 에러 발생:", error);
      result.message = "게시글 작성 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

//게시판 보기
app.get("/post", (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      // 데이터베이스에서 모든 게시글을 가져오는 로직
      const posts = [
         { idx: 1, title: "첫 번째 게시글", time: "2023-12-05 11:45:50" },
         { idx: 2, title: "두 번째 게시글", time: "2023-12-05 11:45:50" },
         // ... 더 많은 게시글
      ];

      // 성공 상태 코드와 함께 게시글 목록 반환
      result = {
         success: true,
         posts,
      };
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 목록 조회 중 에러 발생:", error);
      result.message = "게시글 목록 조회 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

//게시글 자세히 보기
app.get("/post/:idx", (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;
      // 데이터베이스에서게시글 을 가져오는 로직

      // 성공 상태 코드와 함께 게시글 내용 반환
      result = {
         success: true,
         posts,
      };
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 조회 중 에러 발생:", error);
      result.message = "게시글 조회 중 에러가 발생하였습니다.";
      return res.status(500).send(result);
   }
});

//게시글 수정하기
app.put("/post/:idx", (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx; // 파라미터 이름 수정
      const { title, content } = req.body;

      // 여기에 데이터베이스에서 특정 ID의 게시글을 수정하는 로직을 구현

      // 수정이 성공했다고 가정하고 결과를 설정
      result.message = "게시글이 성공적으로 수정되었습니다.";
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 수정 중 에러 발생:", error);
      result.message = "게시글 수정 중 에러가 발생하였습니다.";
      res.status(500).send(result);
   }
});

//게시글 삭제하기
app.delete("/post/:idx", (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;

      // 여기에 데이터베이스에서 Idx의 게시글을 삭제하는 로직을 구현

      // 삭제가 성공했다고 가정하고 결과를 설정
      result.message = "게시글이 성공적으로 삭제되었습니다.";
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 삭제 중 에러 발생:", error);
      result.message = "게시글 삭제 중 에러가 발생하였습니다.";
      res.status(500).send(result);
   }
});


//=========댓글=============

//댓글 쓰기
app.post("/post/:postIdx/comment", async (req, res) => {
   try {
      const user = req.session.user;
      const result = {
         message: '',
      };

      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.postIdx;
      const { content } = req.body;

      // 유효성 검사: 댓글 내용이 비어 있는지 확인
      if (!content) {
         result.message = "댓글 내용은 필수 입력 항목입니다.";
         return res.status(400).send(result);
      }

      // 데이터베이스에 댓글을 저장하는 로직 쓰기
      result.message = "댓글이 성공적으로 작성되었습니다.";
      res.status(201).send(result); // 201 Created: 새로운 자원이 성공적으로 생성됨
   } catch (error) {
      console.error("댓글 작성 중 에러 발생:", error);
      result.message = "댓글 작성 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 보기
app.get("/post/:postidx/comment", async (req, res) => {
   try {
      const postIdx = req.params.postidx;
      const result = {
         message: '',
      };

      // 데이터베이스에서 특정 게시글에 대한 모든 댓글을 가져오는 로직을 구현

      const comments = [
         { idx: 1, content: "첫 번째 댓글" user_idx: 1 },
         { idx: 2, content: "두 번째 댓글" user_idx: 2 },
         // ... 더 많은 댓글
      ];

      result = {
         message: "댓글을 성공적으로 가져왔습니다.",
         comments: comments,
      };
      res.status(200).send(result); // 200 OK: 성공적인 요청

   } catch (error) {
      console.error("댓글 조회 중 에러 발생:", error);
      result.message = "댓글 조회 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 수정
app.put("/post/:postidx/comment/:commentIdx", async (req, res) => {
   try {
      const user = req.session.user;
      const postIdx = req.params.postidx;
      const commentIdx = req.params.commentIdx;
      const { content } = req.body;
      const result = {
         message: '',
      };

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      // 유효성 검사: 댓글 내용이 비어 있는지 확인
      if (!content) {
         result.message = "댓글 내용은 필수 입력 항목입니다.";
         return res.status(400).send(result); // 400 Bad Request: 잘못된 요청
      }

      // 데이터베이스에서 댓글을 조회
      const comment = "";

      // 댓글 작성자의 idx와 세션의 idx가 다를 경우
      if (comment.userIdx !== user.idx) {
         result.message = "권한이 없습니다.";
         return res.status(403).send(result); // 403 Forbidden: 권한이 없음
      }

      // 댓글이 존재하지 않을 경우
      if (!comment) {
         result.message = "댓글을 찾을 수 없습니다.";
         return res.status(404).send(result); // 404 Not Found: 댓글을 찾을 수 없음
      }

      // 데이터베이스에서 댓글을 수정하는 로직 구현하기

      result.message = "댓글이 성공적으로 수정되었습니다.";
      res.status(200).send(result); // 200 OK: 성공적인 요청
   } catch (error) {
      console.error("댓글 수정 중 에러 발생:", error);
      result.message = "댓글 수정 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 삭제
app.delete("/post/:postidx/comment/:commentIdx", async (req, res) => {
   try {
      const user = req.session.user;
      const postIdx = req.params.postidx;
      const commentIdx = req.params.commentIdx;
      const result = {
         message: '',
      }

      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      // 데이터베이스에서 댓글 정보 가져오기
      const comment = "";

      // 댓글이 존재하지 않을 경우
      if (!comment) {
         result.message = "댓글을 찾을 수 없습니다.";
         return res.status(404).send(result); // 404 Not Found: 댓글을 찾을 수 없음
      }

      // 댓글 작성자의 idx와 세션의 idx가 다를 경우
      if (comment.userIdx !== user.idx) {
         result.message = "권한이 없습니다.";
         return res.status(403).send(result); // 403 Forbidden: 권한이 없음
      }

      // 데이터베이스에서 특정 댓글을 삭제하는 로직을 구현하기

      result.message = "댓글이 성공적으로 삭제되었습니다.";

      res.status(200).send(result); // 200 OK: 성공적인 요청
   } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      result.message = "댓글 삭제 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});


//web server
app.listen(port, () => {
   //웹 서버 실행시 초기 설정
   console.log(`${port}번에서 HTTP 웹 서버 실행`)
})