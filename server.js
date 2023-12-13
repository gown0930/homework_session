//js에서 다른 js import
const express = require("express")

//Init
const app = express()
const port = 8000

//Apis

//로그인
app.post("/login",(req,res)=>{
   const{id,pw,name,phone_num}=req.body

   const result ={
      "success":false,
      "message":""
   }

   //db통신

   //db통신 결과 처리
   result.success=true

   //값 반환
   res.send(result)

})

//회원가입
app.post("/signup",(req,res)=>{
   const{id,pw,name,phone_num}=req.body

   const result ={
      "success":false,
      "message":""
   }

   //db통신

   //db통신 결과 처리
   result.success=true

   //값 반환
   res.send(result)
})

//아이디 찾기
app.get("/findId",(req,res)=>{
   const { id, name, phone_num } = req.query;

   const result ={
      "success":false,
      "message":""
   }

   //db통신

   //db통신 결과 처리
   result.success=true

   //값 반환
   res.send(result)
})

//비밀번호 찾기
app.get("/findPw",(req,res)=>{
   const { id, name, phone_num } = req.query;

   const result ={
      "success":false,
      "message":""
   }

   //db통신

   //db통신 결과 처리
   result.success=true

   //값 반환
   res.send(result)
})


// 내 정보 보기
app.get("/account", (req, res) => {
   const { id, name, phone_num } = req.query;
 
   const result = {
     success: false,
     message: "",
   };
 
   // DB 통신
 
   // DB 통신 결과 처리
   result.success = true;
 
   // 값 반환
   res.send(result);
 });
 
 // 내 정보 수정
 app.put("/account/update", (req, res) => {
   const { id, name, phone_num } = req.body;
 
   const result = {
     success: false,
     message: "",
   };
 
   // DB 통신
 
   // DB 통신 결과 처리
   result.success = true;
 
   // 값 반환
   res.send(result);
 });
 
 // 회원 탈퇴
 app.delete("/account/:idx", (req, res) => {
   const userIdx = req.params.idx; // 동적으로 전달된 idx
 
   const result = {
     success: false,
     message: "",
   };
 
   // DB 통신
 
   // DB 통신 결과 처리
   result.success = true;
 
   // 값 반환
   res.send(result);
 });
 


//


//web server
app.listen(port,()=>{
   //웹 서버 실행시 초기 설정
   console.log(`${port}번에서 HTTP 웹 서버 실행`)
})