const router = require("express").Router();
const postgresClient = require("../modules/connection");
const loginCheck = require("../middleware/loginCheck")
const createResult = require("../modules/result")
//=========댓글=============

//postIdx body로 받아오기

//댓글 쓰기
router.post("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const { post_idx, content } = req.body;
      const user_idx = user.idx;

      if (!content || content.trim() === "") throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const addCommentQuery = "INSERT INTO homework.comment (comment, user_idx, post_idx) VALUES ($1, $2, $3) RETURNING *";

      // 댓글 작성 쿼리 실행
      const { rows: addCommentResult } = await postgresClient.query(addCommentQuery, [content, user_idx, post_idx]);

      if (addCommentResult.length > 0) {
         result.message = "댓글이 성공적으로 작성되었습니다.";
         return res.status(200).send(result);
      } else {
         result.message = "댓글 작성 중 에러가 발생하였습니다.";
         return res.status(500).send(result);
      }
   } catch (error) {
      console.error("댓글 작성 중 에러 발생:", error);
      result.message = error.message || "댓글 작성 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

//댓글 보기
router.get("/", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const { post_idx } = req.query;

      const getCommentsQuery = `
      SELECT 
        idx, 
        comment, 
        user_idx, 
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH:MI AM') AS created_at
      FROM homework.comment 
      WHERE post_idx = $1 
      ORDER BY idx DESC
    `;
    
      // 댓글 조회 쿼리 실행
      const { rows: comments } = await postgresClient.query(getCommentsQuery, [post_idx]);

      result.comments = comments;
      res.status(200).send(result);
   } catch (error) {
      console.error("댓글 조회 중 에러 발생:", error);
      result.message = error.message || "댓글 조회 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

//댓글 수정
router.put("/:commentIdx", loginCheck, async (req, res) => {
   const commentIdx = req.params.commentIdx;
   const { post_idx, content } = req.body;
   const result = createResult();

   try {
      const user = req.user;
      if (content === null || content === "" || content === undefined) throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const updateCommentQuery = "UPDATE homework.comment SET comment = $1, created_at = CURRENT_TIMESTAMP WHERE idx = $2 AND user_idx = $3 AND post_idx = $4";

      // 댓글 수정 쿼리 실행
      const { rowCount } = await postgresClient.query(updateCommentQuery, [content, commentIdx, user.idx, post_idx]);

      if (rowCount > 0) {
         result.message = "댓글이 성공적으로 수정되었습니다.";
         res.status(200).send(result);
      } else {
         // 수정된 행이 없으면 해당 댓글이 현재 사용자에게 속하지 않음 또는 댓글이 존재하지 않음
         result.message = "댓글을 수정할 수 있는 권한이 없거나 댓글이 존재하지 않습니다.";
         res.status(403).send(result);
      }
   } catch (error) {
      console.error("댓글 수정 중 에러 발생:", error);
      result.message = error.message || "댓글 수정 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

//댓글 삭제
router.delete("/:commentIdx", loginCheck, async (req, res) => {
   const commentIdx = req.params.commentIdx;
   const { post_idx } = req.query;
   const result = createResult();

   try {
      const user = req.user;
      const deleteCommentQuery = "DELETE FROM homework.comment WHERE idx = $1 AND user_idx = $2 AND post_idx = $3";

      // 댓글 삭제 쿼리 실행
      const { rowCount } = await postgresClient.query(deleteCommentQuery, [commentIdx, user.idx, post_idx]);

      if (rowCount > 0) {
         res.status(200).send(result);
      } else {
         throw { status: 500, message: "댓글 삭제에 실패하였습니다. 권한이 없거나 댓글을 찾을 수 없습니다." };
      }
   } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      result.message = error.message || "댓글 삭제 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});


module.exports = router