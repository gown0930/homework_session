const { Pool } = require("pg");
require('dotenv').config();

const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME", "DB_PORT"];
for (const envVar of requiredEnvVars) {
   if (!process.env[envVar]) {
      throw new Error(`오류: 필수 환경 변수 ${envVar} 가 설정되어 있지 않습니다.`);
   }
}

const postgresConnection = async () => {
   const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      max: 20,
   });

   return pool;
};

async function queryDatabase(query, values) {
   let client;
   try {
      const pool = await postgresConnection();
      client = await pool.connect();
      const result = await client.query(query, values);
      console.log("PostgreSQL 연결 성공!");
      return result.rows;
   } catch (error) {
      console.error("Error in queryDatabase:", error.message);
      throw error;
   } finally {
      if (client) {
         client.release(); // 클라이언트 해제
         console.log("PostgreSQL 클라이언트 반환!");
      }
   }
}

module.exports = { queryDatabase };


