const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: process.env.DB_NAME || "db_qlcc"
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối DB:", err);
    return;
  }
  console.log("Kết nối MySQL thành công");
});

module.exports = db;