const { Client } = require("pg");

const postgresConnection = {
   user: "ubuntu",
   password: "1234",
   host: "localhost",
   database: "web",
   port: 5432,
};
const postgresClient = new Client(postgresConnection);

postgresClient.connect()
   .then(() => {
      console.log("Connected to PostgreSQL database");
   })
   .catch((err) => {
      console.error("Error connecting to PostgreSQL database:", err);
   });
module.exports = postgresClient;