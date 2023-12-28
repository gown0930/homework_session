const { Pool } = require("pg");

const postgresConnection = {
   user: "ubuntu",
   password: "1234",
   host: "localhost",
   database: "homework",
   port: 5432,
};

const postgresPool = new Pool(postgresConnection);

(async () => {
   try {
      const client = await postgresPool.connect();
      console.log("PostgreSQL 연결");

      // 여기에서 쿼리를 실행하거나 다른 작업을 수행할 수 있음

      // 연결 반환
      client.release();
   } catch (err) {
      console.error("PostgreSQL 연결 에러:", err);
   }
})();

module.exports = postgresPool;

