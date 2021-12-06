const statements = require("../db/statements");
const db = require("../db/config");

function login(email, password) {
    const SQL = `   SELECT email, firstName, lastName, dob, createdOn, modifiedOn FROM ${statements.USER_TABLE_NAME} 
                    WHERE email = ?
                `;

    const args = [email];

    return new Promise((resolve, reject) => {
        db.query(SQL, args)
            .then(res => {
                if (res && res[0] && res[0].length) {
                    resolve({
                        data: res[0][0]
                    });
                }
                else {
                    reject({
                        status: 404,
                        message: "Unable to find user"
                    });
                }
            })
            .catch(err => {
                console.error("Unable to create user ", err);
                reject({
                    status: 500,
                    message: err.sqlMessage || "Unable to login"
                });
            });
    });
}

function register(email, password, firstName, lastName, dob) {
    const SQL = `   INSERT INTO ${statements.USER_TABLE_NAME} 
                        (email, password, firstName, lastName, dob) 
                    VALUES 
                        (?, ?, ?, ?, ?)
                `;

    const args = [email, password, firstName, lastName, dob];

    return new Promise((resolve, reject) => {
        db.query(SQL, args)
            .then((res) => {
                resolve({
                    message: "Successfully created User"
                });
            })
            .catch(err => {
                console.error("Unable to create user ", err);
                reject({
                    status: 500,
                    message: err.sqlMessage || "Unable to create user"
                });
            });
    });
}

module.exports = Object.freeze({
    login,
    register
});