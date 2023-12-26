const router = require("express").Router()
const postgresClient = require("../modules/connection");
const path = require("path")
const connection = require(path.join(__dirname, "../../connection.js"));
const loginCheck = require("../middleware/loginCheck")
//=========게시글==========

// 게시글 쓰기
router.post("/", loginCheck, (req, res) => {
   const result = {
      message: '',
   };

   try {
      req.user = user;
      const { title, content } = req.body;
      const user_idx = user.idx;

      if (title === null || title === "" || title === undefined) throw { status: 400, message: "제목은 필수 입력 항목입니다." };
      if (content === null || content === "" || content === undefined) throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const saveSql = "INSERT INTO post (title, content, user_idx) VALUES (?, ?, ?)";

      connection.query(saveSql, [title, content, user_idx], (saveError) => {
         if (saveError) {
            result.message = "게시글 작성 중 에러가 발생하였습니다.";
            return res.status(500).send(result);
         }
         return res.status(200).send(result);
      });
   } catch (error) {
      console.error("게시글 작성 중 에러 발생:", error);
      result.message = error.message || "게시글 작성 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시판 보기
router.get("/", loginCheck, (req, res) => {
   const result = {
      message: '',
   };
   try {
      req.user = user;
      const getAllPostsQuery = "SELECT title, DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+09:00'), '%Y-%m-%d %h:%i %p') AS created_at FROM post ORDER BY idx DESC";
      connection.query(getAllPostsQuery, (queryError, posts) => {
         if (queryError) {
            result.message = "게시글 목록 조회 중 에러가 발생하였습니다.";
            res.status(500).send(result);
         }
         // result.posts = posts.map(post => ({
         //    title: post?.title,
         //    created_at: post?.created_at
         // }));
         result.posts = posts;
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("게시글 목록 조회 중 에러 발생:", error);
      result.message = error.message || "게시글 목록 조회 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시글 자세히 보기
router.get("/:idx", loginCheck, (req, res) => {
   const result = {
      message: '',
   };
   try {
      req.user = user;
      const postIdx = req.params.idx;
      const getPostQuery = "SELECT title, content, DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+09:00'), '%Y-%m-%d %h:%i %p') AS created_at FROM post WHERE idx = ?";
      connection.query(getPostQuery, [postIdx], (queryError, posts) => {
         if (queryError) {
            result.message = "게시글 조회 중 에러가 발생하였습니다.";
            res.status(500).send(result);
         }
         result.posts = posts;
         res.status(200).send(result);
      });
   } catch (error) {
      console.error("게시글 조회 중 에러 발생:", error);
      result.message = error.message || "게시글 조회 중 에러가 발생하였습니다.";
      return res.status(error.status || 500).send(result);
   }
});

//게시글 수정하기
router.put("/:idx", loginCheck, (req, res) => {
   const result = {
      message: '',
   };
   try {
      req.user = user;
      const postIdx = req.params.idx;
      const { title, content } = req.body;
      const user_idx = user.idx;

      if (title === null || title === "" || title === undefined) throw { status: 400, message: "제목은 필수 입력 항목입니다." };
      if (content === null || content === "" || content === undefined) throw { status: 400, message: "내용은 필수 입력 항목입니다." };

      const updatePostQuery = "UPDATE post SET title = ?, content = ? WHERE idx = ? AND user_idx = ?";
      connection.query(updatePostQuery, [title, content, postIdx, user_idx], (queryError, updateResults) => {
         if (queryError) throw { status: 500, message: "게시글 수정 중 에러가 발생하였습니다." };

         if (updateResults.affectedRows > 0) {
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
      result.message = error.message || "게시글 수정 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

//게시글 삭제하기
router.delete("/:idx", loginCheck, (req, res) => {
   const result = {
      message: '',
   };

   try {
      req.user = user;
      const postIdx = req.params.idx;
      const deletePostQuery = "DELETE FROM post WHERE idx = ? AND user_idx = ?";
      connection.query(deletePostQuery, [postIdx, user.idx], (queryError, deleteResults) => {
         if (queryError) throw { status: 500, message: "게시글 삭제 중 에러가 발생하였습니다." };

         if (deleteResults.affectedRows > 0) {
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
      result.message = error.message || "게시글 삭제 중 에러가 발생하였습니다.";
      res.status(error.status || 500).send(result);
   }
});

module.exports = router