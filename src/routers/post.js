const router = require("express").Router()
const path = require("path")
const connection = require(path.join(__dirname, "../../connection.js"));

//=========게시글==========

// 게시글 쓰기
router.post("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) {
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const { title, content } = req.body;
      const user_idx = user.idx; // 사용자 인덱스

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

      // 게시글을 데이터베이스에 저장하는 SQL 쿼리
      const saveSql = "INSERT INTO post (title, content, user_idx) VALUES (?, ?, ?)";

      // 데이터베이스 저장
      connection.query(saveSql, [title, content, user_idx], (saveError, saveResult) => {
         if (saveError) {
            console.error("게시글 작성 중 에러 발생:", saveError);
            result.message = "게시글 작성 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         // 데이터베이스 저장 결과에 따른 처리
         if (saveResult.affectedRows > 0) {
            result.message = "게시글이 성공적으로 작성되었습니다.";
            return res.status(201).send(result);
         } else {
            result.message = "게시글 작성에 실패하였습니다.";
            return res.status(500).send(result);
         }
      });
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

      // 데이터베이스에서 모든 게시글을 최신순으로 가져오는 로직
      const getAllPostsQuery = "SELECT title, created_at FROM post ORDER BY created_at DESC";
      connection.query(getAllPostsQuery, (queryError, posts) => {
         if (queryError) {
            console.error("게시글 목록 조회 중 에러 발생:", queryError);
            result.message = "게시글 목록 조회 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         // 성공 상태 코드와 함께 게시글 목록 반환
         result.posts = posts.map(post => ({
            title: post.title,
            created_at: post.created_at.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) // 한국 시간대로 변환
         }));

         res.status(200).send(result);
      });
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
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;
      // 데이터베이스에서 특정 게시글을 가져오는 로직
      const getPostQuery = "SELECT title, content, created_at FROM post WHERE idx = ?";
      connection.query(getPostQuery, [postIdx], (queryError, posts) => {
         if (queryError) {
            console.error("게시글 조회 중 에러 발생:", queryError);
            result.message = "게시글 조회 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         // 성공 상태 코드와 함께 게시글 내용 반환
         result.posts = posts.map(post => ({
            title: post.title,
            content: post.content,
            created_at: post.created_at.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) // 한국 시간대로 변환
         }));

         res.status(200).send(result);
      });
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
         result.message = "로그인이 필요합니다.";
         return res.status(401).send(result);
      }

      const postIdx = req.params.idx;
      const { title, content } = req.body;
      const user_idx = user.idx;

      const updatePostQuery = "UPDATE post SET title = ?, content = ? WHERE idx = ? AND user_idx = ?";
      connection.query(updatePostQuery, [title, content, postIdx, user_idx], (queryError, updateResults) => {
         if (queryError) {
            console.error("게시글 수정 중 에러 발생:", queryError);
            result.message = "게시글 수정 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }

         if (updateResults.affectedRows > 0) {
            // 수정이 성공한 경우
            result.message = "게시글이 성공적으로 수정되었습니다.";
            return res.status(200).send(result);
         } else {
            // 수정된 행이 없으면 해당 게시글이 현재 사용자에게 속하지 않음 또는 게시글이 존재하지 않음
            result.message = "게시글을 수정할 수 있는 권한이 없거나 게시글이 존재하지 않습니다.";
            return res.status(403).send(result);
         }
      });
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

      const deletePostQuery = "DELETE FROM post WHERE idx = ? AND user_idx = ?";

      connection.query(deletePostQuery, [postIdx, user.idx], (queryError, deleteResults) => {
         if (queryError) {
            console.error("게시글 삭제 중 에러 발생:", queryError);
            result.message = "게시글 삭제 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         if (deleteResults.affectedRows > 0) {
            // 삭제가 성공한 경우
            result.message = "게시글이 성공적으로 삭제되었습니다.";
            return res.status(200).send(result);
         } else {
            // 삭제된 행이 없으면 해당 게시글이 현재 사용자에게 속하지 않음 또는 게시글이 존재하지 않음
            result.message = "게시글을 삭제할 수 있는 권한이 없거나 게시글이 존재하지 않습니다.";
            return res.status(403).send(result);
         }
      });
   } catch (error) {
      console.error("게시글 삭제 중 에러 발생:", error);
      result.message = "게시글 삭제 중 에러가 발생하였습니다.";
      res.status(500).send(result);
   }
});

module.exports = router