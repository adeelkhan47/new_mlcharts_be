const mysql = require('mysql2/promise');
const statements = require("../db/statements");
let connection = null;

function connect() {

    try {

        mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "password"
        })
            .then((con) => {

                console.info("Successfully connected to MySQL");

                con.query(statements.CREATE_DB)
                    .then(() => {
                        console.info("Successfully created MySQL DB " + statements.DB_NAME);

                        con.close();

                        mysql.createConnection({
                            host: "localhost",
                            port: 3306,
                            user: "root",
                            password: "password",
                            database: statements.DB_NAME
                        })
                            .then((conn) => {
                                connection = conn;

                                console.info("Successfully connected to MySQL DB " + statements.DB_NAME);

                                conn.query(statements.CREATE_USER_TABLE)
                                    .catch(err =>
                                        console.error("Unable to create table " + statements.USER_TABLE_NAME, err)
                                    );

                                conn.query(statements.CREATE_DATA_TABLE)
                                    .catch(err =>
                                        console.error("Unable to create table " + statements.DATA_TABLE_NAME, err)
                                    );

                                setInterval(function () {
                                    conn.query('SELECT 1');
                                }, 5000);
                            })
                            .catch(err => {
                                console.error("Unable to connect to MySQL");
                                console.error(err);
                            });
                    })
                    .catch(err => console.error("Unable to create Database", err));
            })
            .catch(err => {
                console.error("Unable to connect to MySQL");
                console.error(err);
            });

    } catch (error) {
        console.error(error);
    }
}

function disconnect() {
    connection.close();
}

function query(statement, args = []) {
    if (connection)
        return connection.query(statement, args);
    else
        return new Promise.reject({
            status: 500,
            message: "DB connection is missing"
        });
}

module.exports = Object.freeze({
    query,
    connect,
    disconnect
});