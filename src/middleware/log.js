const connectMongoDB = require("../modules/mongodb")

const logger = () => async (req, res, next) => {
   req.on('finish', async () => {
      // 클라이언트의 IP 주소
      const clientIP = req.ip || req.connection.remoteAddress;
      // 클라이언트가 요청한 호스트
      const host = req.get('host');
      // 프로토콜 (HTTP 또는 HTTPS)
      const protocol = req.protocol;
      // 요청된 경로
      const path = req.path;
      // Query parameters
      const query = req.query;
      // 요청 바디
      const requestBody = req.body;
      // User Agent 정보
      const userAgent = req.get('user-agent');
      // 프로토콜 버전
      const protocolVersion = req.protocolVersion;
      // 정보를 객체로 담기
      const requestInfo = {
         clientIP,
         host,
         protocol,
         path,
         query,
         requestBody,
         userAgent,
         protocolVersion,
      };
      const db = await connectMongoDB();
      const logCollection = db.collection("logs");
      await logCollection.insertOne(requestInfo);
   });
   next();
};

module.exports = logger;