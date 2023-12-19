const router = require("express").Router()

//=========게시글==========

// 게시글 쓰기
router.post("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
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
router.get("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
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
router.get("/:idx", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;
      // 데이터베이스에서게시글 을 가져오는 로직

      // 성공 상태 코드와 함께 게시글 내용 반환
      result = {
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
router.put("/:idx", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
      if (!user) {
         // 사용자가 로그인되어 있지 않은 경우
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx; // 파라미터 이름 수정
      const { title, content } = req.body;

      // 여기에 데이터베이스에서 특정 ID의 게시글을 수정하는 로직을 구현

      // 수정이 성공했다고 가정하고 결과를 설정
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 수정 중 에러 발생:", error);
      result.message = "게시글 수정 중 에러가 발생하였습니다.";
      res.status(500).send(result);
   }
});

//게시글 삭제하기
router.delete("/:idx", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };
   try {
      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;

      // 여기에 데이터베이스에서 Idx의 게시글을 삭제하는 로직을 구현

      // 삭제가 성공했다고 가정하고 결과를 설정
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 삭제 중 에러 발생:", error);
      result.message = "게시글 삭제 중 에러가 발생하였습니다.";
      res.status(500).send(result);
   }
});

module.exports = router