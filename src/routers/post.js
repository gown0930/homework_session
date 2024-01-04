const express = require("express");
const router = express.Router();
const { queryDatabase } = require("../modules/connection");
const loginCheck = require("../middleware/loginCheck")
const createResult = require("../modules/result")
const validation = require("../modules/validation")
const handleServerError = require('../modules/errorHandler');
//=========게시글==========

// 게시글 쓰기
router.post("/", loginCheck, async (req, res) => {
   const result = createResult();

   try {
      const user = req.user;
      const { title, content } = req.body;
      const user_idx = user.idx;

      validation.validateContent(title);
      validation.validateContent(content);

      const saveSql = "INSERT INTO homework.post (title, content, user_idx) VALUES ($1, $2, $3)";

      // 게시글 작성 쿼리 실행
      await queryDatabase(saveSql, [title, content, user_idx]);
      res.locals.response = result;
      return res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "게시글 작성 중 에러가 발생하였습니다.");
   }
});

// 게시판 보기
router.get("/", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const getAllPostsQuery = `
         SELECT 
            idx, 
            title, 
            TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH:MI AM') AS created_at 
         FROM homework.post 
         ORDER BY idx DESC
      `;
      const posts = await queryDatabase(getAllPostsQuery);
      result.posts = posts;
      console.log(posts);
      res.locals.response = result;
      res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "게시글 목록 조회 중 에러가 발생하였습니다.");
   }
});
//전체 게시물 읽기
router.get("/", async (req, res, next) => {
   const result = {
      "message": "",
      "data": null
   }
   try {
      const sql = `SELECT posting.*, account.id AS postingUser 
        FROM posting 
        JOIN account ON posting.account_key = account.account_key 
        ORDER BY posting.create_at DESC`
      const queryData = await queryModule(sql)
      result.data = queryData;
      res.locals.response = result;
      res.status(200).send(result)
   } catch (error) {
      next(error)
   }
})

// 게시글 자세히 보기
router.get("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const getPostQuery = "SELECT title, content, TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH:MI AM') AS created_at FROM homework.post WHERE idx = $1";

      const posts = await queryDatabase(getPostQuery, [postIdx]);

      result.posts = posts;
      res.locals.response = result;
      res.status(200).send(result);
   } catch (error) {
      handleServerError(error, res, 500, "게시글 조회 중 에러가 발생하였습니다.");
   }
});

// 게시글 수정하기
router.put("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const { title, content } = req.body;
      const user_idx = req.user.idx;

      validation.validateContent(title);
      validation.validateContent(content);

      const updatePostQuery = "UPDATE homework.post SET title = $1, content = $2 WHERE idx = $3 AND user_idx = $4 RETURNING *";
      const updateResults = await queryDatabase(updatePostQuery, [title, content, postIdx, user_idx]);

      if (updateResults.length === 0) {
         return res.status(403).send(createResult("게시글을 수정할 수 있는 권한이 없거나 게시글이 존재하지 않습니다."));
      }
      res.locals.response = result;
      return res.status(200).send(result);

   } catch (error) {
      handleServerError(error, res, 500, "게시글 수정 중 에러가 발생하였습니다.");
   }
});

// 게시글 삭제하기
router.delete("/:idx", loginCheck, async (req, res) => {
   const result = createResult();
   try {
      const user = req.user;
      const postIdx = req.params.idx;
      const user_idx = req.user.idx;

      const deletePostQuery = "DELETE FROM homework.post WHERE idx = $1 AND user_idx = $2 RETURNING *";
      const deleteResults = await queryDatabase(deletePostQuery, [postIdx, user_idx]);

      if (deleteResults.length === 0) return res.status(403).send(createResult("게시글을 삭제할 수 있는 권한이 없거나 게시글이 존재하지 않습니다."));
      res.locals.response = result;
      return res.status(200).send(result);

   } catch (error) {
      handleServerError(error, res, 500, "게시글 삭제 중 에러가 발생하였습니다.");
   }
});


module.exports = router