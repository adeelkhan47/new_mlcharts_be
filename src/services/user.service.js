const bcrypt = require('bcrypt');
const statements = require("../db/statements");
const db = require("../db/config");

function login(email, password) {
  const SQL = ` SELECT * FROM ${statements.USER_TABLE_NAME} WHERE email = ? `;
  const args = [email];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((res) => {
        if (res && res[0] && res[0].length) {
          let userObj = res[0][0];

          bcrypt.compare(password, userObj.password).then((matched) => {
            if (matched) {
              // removing password key
              delete userObj.password;
              resolve({
                data: userObj
              });
            }
            else {
              reject({
                status: 403,
                message: "Invalid email or password"
              });
            }
          });

        } else {
          reject({
            status: 404,
            message: "Unable to find user"
          });
        }
      })
      .catch((err) => {
        console.error("Unable to create user ", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to login"
        });
      });
  });
}

function register(email, password, firstName, lastName, company, userId) {
  const SQL = `   INSERT INTO ${statements.USER_TABLE_NAME} 
                        (email, password, firstName, lastName, company, role, createdBy) 
                    VALUES 
                        (?, ?, ?, ?, ?, ?, ?)
                `;

  return new Promise((resolve, reject) => {

    let role = "user";

    __getUsersCount().then(usersCount => {
      if (usersCount === 0) role = "admin";
      bcrypt.hash(password, 12).then(passwordHash => {
        const args = [email, passwordHash, firstName, lastName, company, role, userId];
        db.query(SQL, args)
          .then((res) => {
            resolve({
              message: "Successfully created User"
            });
          })
          .catch((err) => {
            console.error("Unable to create user ", err);
            reject({
              status: 500,
              message: err.sqlMessage || "Unable to create user"
            });
          });
      });
    });
  });
}

function changePassword(userId, oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    __getUser(userId)
      .then(userObj => {

        bcrypt.compare(oldPassword, userObj.password).then((matched) => {
          if (matched) {
            bcrypt.hash(newPassword, 12).then(passwordHash => {
              const SQL = ` UPDATE ${statements.USER_TABLE_NAME} 
                            SET password = ?, modifiedOn = now(), modifiedBy = ?
                            WHERE id = ? 
                      `;
              const args = [passwordHash, userId, userId];

              db.query(SQL, args)
                .then(() => {
                  resolve({
                    message: "Successfully changed password"
                  });
                })
                .catch((err) => {
                  console.error("Unable to change password ", err);
                  reject({
                    status: 500,
                    message: err.sqlMessage || "Unable to change password"
                  });
                });
            });
          }
          else {
            reject({
              status: 400,
              message: "Invalid password"
            });
          }
        });

      })
      .catch(error => {
        console.error(error);
        reject({
          status: 404,
          message: "Unable to find user"
        });
      });
  });
}

function updateUser(userId, updatedUserObj) {
  const SQL = `   UPDATE ${statements.USER_TABLE_NAME} 
                          SET 
                          email = ?, firstName = ?, lastName = ?, company = ?, modifiedOn = now(), modifiedBy = ?
                          WHERE id = ? 
                      `;

  return new Promise((resolve, reject) => {
    __getUser(userId)
      .then(userObj => {
        const updatedUser = {
          ...userObj,
          ...updatedUserObj
        };

        const args = [updatedUser.email, updatedUser.firstName, updatedUser.lastName, updatedUser.company, userId, userId];

        db.query(SQL, args)
          .then(() => {
            __getUser(userId)
              .then((finalUser) => {
                delete finalUser.password;
                resolve(finalUser);
              })
              .catch((err) => reject(err));
          })
          .catch((error) => {
            console.error(error);
            reject({
              status: 500,
              message: "Something wend wrong"
            });
          });

      })
      .catch(error => {
        console.error(error);
        reject({
          status: 404,
          message: "Unable to find user"
        });
      });
  });
}

function deleteUser(userId, password) {
  return new Promise((resolve, reject) => {

    __getUser(userId)
      .then(userObj => {

        bcrypt.compare(password, userObj.password).then((matched) => {
          if (matched) {
            const SQL = ` DELETE FROM ${statements.USER_TABLE_NAME} WHERE id = ? `;
            const args = [userId];
            db.query(SQL, args)
              .then(() => {
                resolve({
                  status: 200,
                  message: "Successfully deleted user"
                });
              })
              .catch((err) => {
                console.error("Unable to delete user", err);
                reject({
                  status: 500,
                  message: err.sqlMessage || "Unable to delete user"
                });
              });
          }
          else {
            reject({
              status: 403,
              message: "Password is invalid"
            });
          }
        });

      })
      .catch(error => {
        console.error(error);
        reject({
          status: 404,
          message: "Unable to find user"
        });
      });
  });
}

function getAllUsers(userId) {
  return new Promise((resolve, reject) => {
    __getUser(userId)
      .then(userObj => {

        if (userObj && userObj.role === "admin") {

          const SQL = `   SELECT id, email, firstName, lastName, company, role, createdOn, createdBy, modifiedOn, modifiedBy 
                          FROM ${statements.USER_TABLE_NAME} 
                          WHERE id != ? 
                      `;
          const args = [userId];

          db.query(SQL, args)
            .then((result) => {
              if (result && result[0]) {
                resolve(result[0]);
              }
              else {
                resolve([]);
              }
            })
            .catch((error) => {
              console.error(error);
              reject({
                status: 500,
                message: "Something wend wrong"
              });
            });
        }
        else {
          reject({
            status: 400,
            message: "Invalid request"
          });
        }

      })
      .catch(error => {
        console.error(error);
        reject({
          status: 400,
          message: "Invalid request"
        });
      });
  });
}

function __getUser(userId) {
  const SQL = `   SELECT * FROM ${statements.USER_TABLE_NAME} 
                  WHERE id = ?
              `;
  const args = [userId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((result) => {
        if (result && result[0] && result[0].length) {
          const userObj = result[0][0];
          resolve(userObj);
        }
        else reject();
      })
      .catch((error) => {
        console.error(error);
        reject();
      });
  });
}

function __userExists(userId) {
  const SQL = `   SELECT count(*) AS count FROM ${statements.USER_TABLE_NAME} 
                  WHERE id = ?
              `;

  const args = [userId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((result) => {
        if (result && result[0] && result[0].length) {
          result = result[0][0].count;
          resolve(result > 0);
        }
        resolve(false);
      })
      .catch((error) => {
        console.error(error);
        resolve(false);
      });
  });
}

function __getUsersCount() {
  const SQL = `SELECT count(*) AS count FROM ${statements.USER_TABLE_NAME}`;

  return new Promise((resolve, reject) => {
    db.query(SQL, [])
      .then((result) => {
        if (result && result[0] && result[0].length) {
          result = result[0][0].count;
          resolve(result);
        }
        else resolve("UNKNOWN");
      })
      .catch((error) => {
        console.error(error);
        resolve("UNKNOWN");
      });
  });
}

module.exports = Object.freeze({
  login,
  register,
  changePassword,
  updateUser,
  deleteUser,
  getAllUsers,
  __getUser,
  __userExists
});
