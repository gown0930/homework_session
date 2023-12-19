const router = require("express").Router()

//=========댓글=============

//postIdx body로 받아오기

//댓글 쓰기
router.post("/", async (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
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
      res.status(201).send(result); // 201 Created: 새로운 자원이 성공적으로 생성됨
   } catch (error) {
      console.error("댓글 작성 중 에러 발생:", error);
      result.message = "댓글 작성 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 보기
router.get("/", async (req, res) => {
   const postIdx = req.params.postidx;
   const result = {
      message: '',
   }
   try {
      // 데이터베이스에서 특정 게시글에 대한 모든 댓글을 가져오는 로직을 구현

      const comments = [
         // { idx: 1, content: "첫 번째 댓글" user_idx: 1 },
         // { idx: 2, content: "두 번째 댓글" user_idx: 2 },
         // ... 더 많은 댓글
      ];
      result = {
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
router.put("/:commentIdx", async (req, res) => {
   const user = req.session.user;
   const postIdx = req.params.postidx;
   const commentIdx = req.params.commentIdx;
   const { content } = req.body;
   const result = {
      message: '',
   };
   try {
      if (!user) {
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
      res.status(200).send(result); // 200 OK: 성공적인 요청
   } catch (error) {
      console.error("댓글 수정 중 에러 발생:", error);
      result.message = "댓글 수정 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 삭제
router.delete("/:commentIdx", async (req, res) => {
   const user = req.session.user;
   const postIdx = req.params.postidx;
   const commentIdx = req.params.commentIdx;
   const result = {
      message: '',
   }
   try {
      if (!user) {
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
      res.status(200).send(result); // 200 OK: 성공적인 요청
   } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      result.message = "댓글 삭제 중 에러가 발생하였습니다.";
      res.status(500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

module.exports = router