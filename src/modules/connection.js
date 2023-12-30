require('dotenv').config();
const { Pool } = require("pg");

// 필수 환경 변수 체크 및 PostgreSQL 연결 정보 설정
const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME", "DB_PORT"];
for (const envVar of requiredEnvVars) {
   if (!process.env[envVar]) {
      throw new Error(`오류: 필수 환경 변수 ${envVar} 가 설정되어 있지 않습니다.`);
   }
}

const postgresConnection = {
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   port: process.env.DB_PORT,
};

const postgresPool = new Pool(postgresConnection);

(async () => {
   try {
      const client = await postgresPool.connect();
      console.log("PostgreSQL 연결");
      client.release();
   } catch (err) {
      console.error("PostgreSQL 연결 에러:", err);
   }
})();

module.exports = postgresPool;

