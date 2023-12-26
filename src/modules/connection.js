const { Client } = require("pg");

const postgresConnection = {
   user: "ubuntu",
   password: "1234",
   host: "localhost",
   database: "web",
   port: 5432,
};

const postgresClient = new Client(postgresConnection);

(async () => {
   try {
      await postgresClient.connect();
      console.log("PostgreSQL 연결");
   } catch (err) {
      console.error("PostgreSQL 연결 에러:", err);
   }
})();

module.exports = postgresClient;
