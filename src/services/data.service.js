const statements = require("../db/statements");
const db = require("../db/config");

function getAllData(userId) {
  const SQL = `   SELECT * FROM ${statements.DATA_TABLE_NAME}
                    WHERE userId = ?
                `;

  const args = [userId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((res) => {
        if (res && res[0]) {
          resolve({
            data: res[0]
          });
        } else {
          reject({
            status: 404,
            message: "No data found"
          });
        }
      })
      .catch((err) => {
        console.error("Unable to get data", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to get data"
        });
      });
  });
}

function createData(userId, label, value, reference) {
  const SQL = `   INSERT INTO ${statements.DATA_TABLE_NAME} 
                        (userId, label, value, reference) 
                    VALUES 
                        (?, ?, ?, ?)
                `;

  const args = [userId, label, value, reference];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then(() => {
        resolve({
          message: "Successfully created data"
        });
      })
      .catch((err) => {
        console.error("Unable to create data", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to create data"
        });
      });
  });
}

function updateData(userId, dataId, label, value, reference) {
  const SQL = `   UPDATE ${statements.DATA_TABLE_NAME} 
                    SET label = ?, value = ?, reference = ?, modifiedOn = now() 
                    WHERE userId = ? AND id = ?
                `;

  const args = [label, value, reference, userId, dataId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then(() => {
        resolve({
          message: "Successfully updated data"
        });
      })
      .catch((err) => {
        console.error("Unable to update data", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to update data"
        });
      });
  });
}

function removeData(userId, dataId) {
  const SQL = `   DELETE FROM ${statements.DATA_TABLE_NAME} 
                    WHERE userId = ? AND id = ?
                `;

  const args = [userId, dataId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then(() => {
        resolve({
          message: "Successfully removed data item"
        });
      })
      .catch((err) => {
        console.error("Unable to delete data item", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to delete data item"
        });
      });
  });
}

module.exports = Object.freeze({
  getAllData,
  createData,
  updateData,
  removeData
});
