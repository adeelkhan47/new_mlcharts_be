const DB_NAME = "mlp";
const USER_TABLE_NAME = "users";
const DATA_TABLE_NAME = "data";


const CREATE_DB = `             CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;

const CONNECT_DB = `            USE ${DB_NAME}`;

const CREATE_USER_TABLE = `     
                                CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME} 
                                (
                                    email VARCHAR(255) PRIMARY KEY, 
                                    password VARCHAR(255),
                                    firstName VARCHAR(255),
                                    lastName VARCHAR(255),
                                    dob VARCHAR(255),
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    modifiedOn DATETIME NULL
                                )
                        `;

const CREATE_DATA_TABLE = `     
                                CREATE TABLE IF NOT EXISTS ${DATA_TABLE_NAME} 
                                (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    userId VARCHAR(255),
                                    label VARCHAR(255),
                                    value DOUBLE,
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    modifiedOn DATETIME NULL 
                                )
                        `;



const statements = Object.freeze({
    DB_NAME,
    USER_TABLE_NAME,
    DATA_TABLE_NAME,
    CREATE_DB,
    CONNECT_DB,
    CREATE_USER_TABLE,
    CREATE_DATA_TABLE
});

module.exports = statements;