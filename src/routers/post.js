const router = require("express").Router()
const postgresClient = require("../modules/connection");
const loginCheck = require("../middleware/loginCheck")
const createResult = require("../modules/result")
//=========게시글==========

// 게시글 쓰기
router.post("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const { title, content } = req.body;
      const user_idx = user.idx;

      if (!title || title.trim() === "") {
         throw { status: 400, message: "제목은 필수 입력 항목입니다." };
      }
      if (!content || content.trim() === "") {
         throw { status: 400, message: "내용은 필수 입력 항목입니다." };
      }

      const saveSql = "INSERT INTO homework.post (title, content, user_idx) VALUES ($1, $2, $3)";

      // 게시글 작성 쿼리 실행
      await postgresClient.query(saveSql, [title, content, user_idx]);

      return res.status(200).send(result);
   } catch (error) {
      console.error("게시글 작성 중 에러 발생:", error);
      result.message = error.message || "게시글 작성 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시판 보기
router.get("/", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const getAllPostsQuery = "SELECT title, TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH:MI AM') AS created_at FROM homework.post ORDER BY idx DESC";

      const { rows: posts } = await postgresClient.query(getAllPostsQuery);

      result.posts = posts;
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 목록 조회 중 에러 발생:", error);
      result.message = error.message || "게시글 목록 조회 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시글 자세히 보기
router.get("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const getPostQuery = "SELECT title, content, TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH:MI AM') AS created_at FROM homework.post WHERE idx = $1";

      const { rows: posts } = await postgresClient.query(getPostQuery, [postIdx]);

      result.posts = posts;
      res.status(200).send(result);
   } catch (error) {
      console.error("게시글 조회 중 에러 발생:", error);
      result.message = error.message || "게시글 조회 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시글 수정하기
router.put("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const { title, content } = req.body;
      const user_idx = req.user.idx;

      if (!title || title.trim() === "") {
         throw { status: 400, message: "제목은 필수 입력 항목입니다." };
      }
      if (!content || content.trim() === "") {
         throw { status: 400, message: "내용은 필수 입력 항목입니다." };
      }

      const updatePostQuery = "UPDATE homework.post SET title = $1, content = $2 WHERE idx = $3 AND user_idx = $4 RETURNING *";
      const { rows: updateResults } = await postgresClient.query(updatePostQuery, [title, content, postIdx, user_idx]);

      if (updateResults.length > 0) {
         result.message = "게시글이 성공적으로 수정되었습니다.";
         return res.status(200).send(result);
      } else {
         // 수정된 행이 없으면 해당 게시글이 현재 사용자에게 속하지 않음 또는 게시글이 존재하지 않음
         result.message = "게시글을 수정할 수 있는 권한이 없거나 게시글이 존재하지 않습니다.";
         return res.status(403).send(result);
      }
   } catch (error) {
      console.error("게시글 수정 중 에러 발생:", error);
      result.message = error.message || "게시글 수정 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});


//게시글 삭제하기
router.delete("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const user_idx = req.user.idx;

      const deletePostQuery = "DELETE FROM homework.post WHERE idx = $1 AND user_idx = $2 RETURNING *";
      const { rows: deleteResults } = await postgresClient.query(deletePostQuery, [postIdx, user_idx]);

      if (deleteResults.length > 0) {
         result.message = "게시글이 성공적으로 삭제되었습니다.";
         return res.status(200).send(result);
      } else {
         // 삭제된 행이 없으면 해당 게시글이 현재 사용자에게 속하지 않음 또는 게시글이 존재하지 않음
         result.message = "게시글을 삭제할 수 있는 권한이 없거나 게시글이 존재하지 않습니다.";
         return res.status(403).send(result);
      }
   } catch (error) {
      console.error("게시글 삭제 중 에러 발생:", error);
      result.message = error.message || "게시글 삭제 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});


module.exports = router