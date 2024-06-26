import { Sequelize } from "sequelize";

const db = new Sequelize('lesson_auth_db', 'root', '', {
    host: "127.0.0.2",
    dialect: "mysql",
    port: 3307,
    // dialectOptions: { // optional if you have xampp or port borken
    //     socketPath: "/xampp/mysql/mysql.sock"
    // },
});

export default db;