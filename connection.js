const mysql = require('mysql');

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'haeju',
   password: '0930',
   database: 'week6',
});

// MariaDB 연결
connection.connect((err) => {
   if (err) {
      console.error('MariaDB 연결 에러: ', err);
      return;
   }
   console.log('MariaDB 연결');
});

module.exports = connection;