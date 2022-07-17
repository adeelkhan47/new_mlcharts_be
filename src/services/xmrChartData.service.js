const dashboardChartService = require("./dashboardChart.service");
const statements = require("../db/statements");
const db = require("../db/config");

function getAllData(chartId, password, userId) {
  return new Promise((resolve, reject) => {
    dashboardChartService
      .getDashboardChart(chartId, password, userId)
      .then(() => {
        const SQL = `   SELECT * FROM ${statements.XMR_CHART_DATA_TABLE_NAME}
                      WHERE chartId = ?
                  `;

        const args = [chartId];

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
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function createData(chartId, password, label, value, reference, note, userId) {
  return new Promise((resolve, reject) => {
    dashboardChartService
      .__canCreate(chartId, password, userId)
      .then((canCreate) => {
        if (canCreate) {
          const SQL = `   INSERT INTO ${statements.XMR_CHART_DATA_TABLE_NAME} 
                            (chartId, label, value, reference, note, createdBy) 
                          VALUES 
                            (?, ?, ?, ?, ?, ?)
                      `;

          const args = [chartId, label, value, reference, note, userId];

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
        } else {
          reject({
            status: 403,
            message: "You are not allowed to perform this operation"
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({
          status: 500,
          message: "Something went wrong"
        });
      });
  });
}

function updateData(
  chartId,
  password,
  dataId,
  label,
  value,
  reference,
  note,
  userId
) {
  return new Promise((resolve, reject) => {
    dashboardChartService
      .__canUpdate(chartId, password, userId)
      .then((canUpdate) => {
        if (canUpdate) {
          const SQL = `   UPDATE ${statements.XMR_CHART_DATA_TABLE_NAME} 
                          SET label = ?, value = ?, reference = ?, note = ?, modifiedOn = now(), modifiedBy = ? 
                          WHERE chartId = ? AND id = ?
                      `;

          const args = [label, value, reference, note, userId, chartId, dataId];

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
        } else {
          reject({
            status: 403,
            message: "You are not allowed to perform this operation"
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({
          status: 500,
          message: "Something went wrong"
        });
      });
  });
}

function removeData(chartId, password, dataId, userId) {
  return new Promise((resolve, reject) => {
    dashboardChartService
      .__canDelete(chartId, password, userId)
      .then((canDelete) => {
        if (canDelete) {
          const SQL = `   DELETE FROM ${statements.XMR_CHART_DATA_TABLE_NAME} 
                          WHERE chartId = ? AND id = ?
                      `;

          const args = [chartId, dataId];

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
        } else {
          reject({
            status: 403,
            message: "You are not allowed to perform this operation"
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({
          status: 500,
          message: "Something went wrong"
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
