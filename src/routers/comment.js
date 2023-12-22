const router = require("express").Router()
const path = require("path")
const connection = require(path.join(__dirname, "../../connection.js"));
//=========댓글=============

//postIdx body로 받아오기

//댓글 쓰기
router.post("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };

      const { post_idx, content } = req.body;
      const user_idx = user.idx;

      if (content === null || content === "" || content === undefined) throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const addCommentQuery = "INSERT INTO comment (comment, user_idx, post_idx) VALUES (?, ?, ?)";

      connection.query(addCommentQuery, [content, user_idx, post_idx], (queryError, addCommentResult) => {
         if (queryError) {
            console.log(queryError);
            throw { status: 500, message: "댓글 작성 중 에러가 발생하였습니다.1" };
         }

         result.message = "댓글이 성공적으로 작성되었습니다.";
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("댓글 작성 중 에러 발생:", error);
      result.message = error.message || "댓글 작성 중 에러가 발생하였습니다.2";
      res.status(error.status || 500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 보기
router.get("/", (req, res) => {
   const user = req.session.user;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };
      const { post_idx } = req.query;
      const user_idx = user.idx;

      const getCommentsQuery = "SELECT idx, comment, user_idx, created_at FROM comment WHERE post_idx = ? ORDER BY created_at ASC";
      connection.query(getCommentsQuery, [post_idx], (queryError, comments) => {
         if (queryError) throw { status: 500, message: "댓글 조회 중 에러가 발생하였습니다." };

         result.comments = comments.map(comment => ({
            content: comment?.comment,
            created_at: comment?.created_at?.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) // 한국 시간대로 변환
         }));
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("댓글 조회 중 에러 발생:", error);
      result.message = error.message || "댓글 조회 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result); // 500 Internal Server Error: 서버 측에서 에러 발생
   }
});

//댓글 수정
router.put("/:commentIdx", (req, res) => {
   const user = req.session.user;
   const comment_idx = req.params.commentIdx;
   const { post_idx, content } = req.body;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };
      if (content === null || content === "" || content === undefined) throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const updateCommentQuery = "UPDATE comment SET comment = ? WHERE idx = ? AND user_idx = ? AND post_idx = ?";
      connection.query(updateCommentQuery, [content, comment_idx, user.idx, post_idx], (updateError, updateResults) => {
         if (updateError) throw { status: 500, message: "댓글 수정 중 에러가 발생하였습니다." };

         if (updateResults.affectedRows > 0) {
            result.message = "댓글이 성공적으로 수정되었습니다.";
            res.status(200).send(result);
         } else {
            throw { status: 500, message: "댓글 수정에 실패하였습니다. 권한이 없거나 댓글을 찾을 수 없습니다." };
         }
      });
   } catch (error) {
      console.error("댓글 수정 중 에러 발생:", error);
      result.message = error.message || "댓글 수정 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

//댓글 삭제
router.delete("/:commentIdx", async (req, res) => {
   const user = req.session.user;
   const comment_idx = req.params.commentIdx;
   const { post_idx } = req.query;
   const result = {
      message: '',
   };

   try {
      if (!user) throw { status: 401, message: "로그인이 필요합니다." };

      const deleteCommentQuery = "DELETE FROM comment WHERE idx = ? AND user_idx = ? AND post_idx = ?";
      connection.query(deleteCommentQuery, [comment_idx, user.idx, post_idx], (deleteError, deleteResults) => {
         if (deleteError) throw { status: 500, message: "댓글 삭제 중 에러가 발생하였습니다." };

         if (deleteResults.affectedRows > 0) {
            result.message = "댓글이 성공적으로 삭제되었습니다.";
            res.status(200).send(result);
         } else {
            throw { status: 500, message: "댓글 삭제에 실패하였습니다. 권한이 없거나 댓글을 찾을 수 없습니다." };
         }
      });
   } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      result.message = error.message || "댓글 삭제 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

module.exports = router