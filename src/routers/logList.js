const router = require('express').Router();
const mongodb = require('mongodb').MongoClient;
const checkPermission = require("../middleware/checkPermission");

router.get("/", checkPermission, async (req, res, next) => {
   const { userId, api, sortOrder, startTime, endTime } = req.query;
   const result = {
      success: false,
      message: null,
      data: null
   }
   let DB = null;
   try {
      DB = await mongodb.connect("mongodb://localhost:27017");

      // 제공된 매개변수를 기반으로 쿼리를 작성합니다.
      const query = {};
      if (userId) {
         query.userId = userId;
      }
      if (api) {
         query.api = api;
      }
      // startTime과 endTime에 대한 조건을 추가합니다.
      if (startTime || endTime) {
         query.timestamp = {};
         if (startTime) {
            query.timestamp.$gte = new Date(startTime).toISOString();
         }
         if (endTime) {
            query.timestamp.$lt = new Date(endTime).toISOString();
         }
      }

      // 쿼리를 적용하여 필터링된 데이터를 가져옵니다.
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      const data = await DB.db('homework').collection("log").find(query).sort({ timestamp: sortDirection }).toArray();
      result.data = data;
      result.success = true;

   } catch (err) {
      console.log(err);
      result.success = false;
      result.errorMessage = "DB에러가 발생했습니다.";

   } finally {
      if (DB) DB.close()
      res.send(result);
   }
});

module.exports = router;
