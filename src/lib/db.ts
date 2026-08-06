import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER || "app",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  waitForConnections: true,
  connectionLimit: 10,
});
