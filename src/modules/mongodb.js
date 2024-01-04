
const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb://localhost:27017";
const dbName = "homework";

async function connectMongoDB() {
   const client = new MongoClient(uri);
   try {
      await client.connect();
      console.log("MongoDB에 연결되었습니다.");
      return client.db(dbName);
   } catch (error) {
      console.error("MongoDB 연결 오류:", error.message);
      throw error;
   }
}

module.exports = connectMongoDB;

