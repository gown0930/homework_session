const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");

const app = express();
const port = 8000;

app.use(
   session({
      secret: "haeju0930",
      resave: false,
      saveUninitialized: true,
   })
);

app.use(express.json());

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'haeju',
   password: '0930',
   database: 'week6',
});

// MariaDB 연결
connection.connect((err) => {
   if (err) {
      console.error('Error connecting to MariaDB:', err);
      return;
   }
   console.log('Connected to MariaDB');
});

// APIs
const accountApi = require("./src/routers/account");
app.use("/account", accountApi);

const postApi = require("./src/routers/post");
app.use("/post", postApi);

const commentApi = require("./src/routers/comment");
app.use("/comment", commentApi);

// 웹 서버 실행
app.listen(port, () => {
   console.log(`${port}번에서 HTTP 웹 서버 실행`);
});

// 서버 종료 시 MariaDB 연결 종료
process.on('beforeExit', () => {
   connection.end((err) => {
      if (err) {
         console.error('Error closing MariaDB connection:', err);
      } else {
         console.log('MariaDB connection closed');
      }
   });
});

// SIGINT 시그널(웹 서버 종료) 처리
process.on('SIGINT', () => {
   console.log('Received SIGINT signal. Closing MariaDB connection...');
   connection.end((err) => {
      if (err) {
         console.error('Error closing MariaDB connection:', err);
      } else {
         console.log('MariaDB connection closed');
         process.exit(0); // 정상 종료
      }
   });
});

// 예외 발생 시 MariaDB 연결 종료 후 프로세스 종료
process.on('uncaughtException', (err) => {
   console.error('Uncaught Exception:', err);
   connection.end((endErr) => {
      if (endErr) {
         console.error('Error closing MariaDB connection:', endErr);
      }
      process.exit(1);
   });
});

// 프로세스 종료 시 MariaDB 연결 종료
process.on('exit', (code) => {
   console.log(`Process exit with code: ${code}`);
});

