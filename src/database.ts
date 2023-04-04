import dotenv from "dotenv";
// import mysql from "mysql2";

dotenv.config();

// const dbconfig = {
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_DATABASE,
// };

// const pool = mysql.createPool(dbconfig); // 여러 개의 쿼리를 병렬적으로 수행

// export default pool.promise();

// // 사용하고자 하는 곳에서
// import db from "./database";

// const sql = `SELECT * FROM categories`;
// db.execute(sql) // 이후 await로 비동기 작업할 듯
//     .then(([row]) => {
//         console.log(row);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DATABASE_DATABASE as string,
    process.env.DATABASE_USER as string,
    process.env.DATABASE_PASSWORD as string,
    { dialect: "mysql", host: process.env.DATABASE_HOST as string }
);

export default sequelize;
