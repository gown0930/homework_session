const express = require("express");
const session = require("express-session");
//const connectMongoDB = require("./src/modules/mongodb");
const MongoClient = require("mongodb").MongoClient;

const accountApi = require("./src/routers/account");
const postApi = require("./src/routers/post");
const commentApi = require("./src/routers/comment");
const logListApi = require("./src/routers/logList");

const app = express();
const port = 8000;

app.use(session({
   secret: "haeju0930",
   resave: false,
   saveUninitialized: true,
}));

app.use(express.json());

app.use(async (req, res, next) => {
   res.on('finish', async () => {
      try {
         // 클라이언트의 IP 주소
         const clientIP = req.ip || req.connection.remoteAddress;
         //userId
         const userId = req.session.user ? req.session.user.id : null;
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
            userId,
            host,
            protocol,
            path,
            query,
            requestBody,
            userAgent,
            protocolVersion,
            response: res.locals.response,
            timestamp: new Date().toISOString(),
         };
         console.log(requestInfo)

         // MongoDB 연결 및 로그 삽입
         try {
            const conn = await MongoClient.connect("mongodb://localhost:27017");
            await conn.db("homework").collection("log").insertOne(requestInfo);
            console.log("업로드 성공");
            conn.close();
         } catch (e) {
            console.error("MongoDB 연결 오류:", e.message);
         }
      } catch (error) {
         console.error("오류 발생:", error.message);
      }
   });
   next();
});

app.use("/account", accountApi);
app.use("/post", postApi);
app.use("/comment", commentApi);
app.use("/logList", logListApi);

// 웹 서버 실행
app.listen(port, () => {
   console.log(`${port}번에서 HTTP 웹 서버 실행`);
});



