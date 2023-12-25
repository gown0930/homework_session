const express = require("express");
const session = require("express-session");
const postgresClient = require("./src/modules/connection");
const accountApi = require("./src/routers/account");
const postApi = require("./src/routers/post");
const commentApi = require("./src/routers/comment");

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

// APIs

app.use("/account", accountApi);
app.use("/post", postApi);
app.use("/comment", commentApi);

// 웹 서버 실행
app.listen(port, () => {
   console.log(`${port}번에서 HTTP 웹 서버 실행`);
});



