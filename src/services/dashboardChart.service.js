const statements = require("../db/statements");
const db = require("../db/config");
const helperUtil = require("../utils/helper.util");
const validationUtil = require("../utils/validation.util");

function __getDashboardChart(chartId) {
  const SQL = `   SELECT * FROM ${statements.DASHBOARD_CHART_TABLE_NAME}
                  WHERE chartId = ?
              `;

  const args = [chartId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((res) => {
        if (res && res[0]) {
          resolve({
            data: res[0]
          });
        } else {
          resolve({
            data: []
          });
        }
      })
      .catch((err) => {
        console.error("Unable to get dashboard chart", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to get dashboard chart"
        });
      });
  });
}

function isPrivateChart(chartId, userId) {
  const SQL = `   SELECT * FROM ${statements.DASHBOARD_CHART_TABLE_NAME}
                  WHERE chartId = ?
              `;

  const args = [chartId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((res) => {
        if (res && res[0] && res[0].length) {
          const chart = res[0][0];
          resolve({
            data: !(chart.isPublic || chart.createdBy === userId)
          });
        } else {
          resolve({
            data: false
          });
        }
      })
      .catch((err) => {
        console.error("Unable to get dashboard chart for isPrivateChart ", err);
        resolve({
          data: false
        });
      });
  });
}

function getDashboardChart(chartId, password, userId) {
  const SQL = `   SELECT * FROM ${statements.DASHBOARD_CHART_TABLE_NAME}
                  WHERE chartId = ?
              `;

  const args = [chartId];

  return new Promise((resolve, reject) => {
    db.query(SQL, args)
      .then((res) => {
        let data = [];
        if (res && res[0]) data = res[0];

        if (data.length) {
          data = data[0];

          if (
            data.isPublic ||
            data.password === password ||
            data.createdBy === userId
          ) {
            resolve({
              data: [data]
            });
          } else {
            reject({
              status: 404,
              message: "Unable to find dashboard chart"
            });
          }
        } else {
          reject({
            status: 404,
            message: "Unable to find dashboard chart"
          });
        }
      })
      .catch((err) => {
        console.error("Unable to get dashboard chart", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to get dashboard chart"
        });
      });
  });
}

function getDashboardCharts(userId) {
  const SQL = `   SELECT * FROM ${statements.DASHBOARD_CHART_TABLE_NAME}
                  WHERE createdBy = ?
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
          resolve({
            data: []
          });
        }
      })
      .catch((err) => {
        console.error("Unable to get dashboard charts for user=" + userId, err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to get dashboard charts"
        });
      });
  });
}

function createDashboardChart(
  name,
  isPublic = true,
  password = "",
  subgroupSize,
  chartType,
  upperSpecLimit,
  lowerSpecLimit,
  headings,
  userId
) {
  const chartId = helperUtil.generateId(name);
  return new Promise((resolve, reject) => {
    if (!validationUtil.isValidString(chartId)) {
      reject({
        status: 400,
        message: "Invalid chart Name, unable to generate chart ID"
      });
    }

    __getDashboardChart(chartId)
      .then((result) => {
        if (result && result.data && result.data.length) {
          reject({
            status: 400,
            message: "Chart Name already exists"
          });
        } else {
          const SQL = `   INSERT INTO ${statements.DASHBOARD_CHART_TABLE_NAME} 
                            (chartId, name, isPublic, password, subgroupSize, chartType, upperSpecLimit, lowerSpecLimit, headings, createdBy)
                          VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      `;

          const args = [
            chartId,
            name,
            isPublic,
            password,
            subgroupSize,
            chartType,
            upperSpecLimit,
            lowerSpecLimit,
            headings,
            userId
          ];

          db.query(SQL, args)
            .then(() => {
              __getDashboardChart(chartId)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            })
            .catch((err) => {
              console.error("Unable to create new chart", err);
              reject({
                status: 500,
                message: err.sqlMessage || "Unable to create new chart"
              });
            });
        }
      })
      .catch((error) => {
        console.error(
          "Unable to create new chart, Exception occurred :: ",
          error
        );
        if (error && error.status && error.message) reject(error);
        else
          reject({
            status: 500,
            message: "Something went wrong"
          });
      });
  });
}

function updateDashboardChart(
  chartId,
  isPublic,
  password,
  subgroupSize,
  userId
) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((result) => {
        if (!(result && result.data && result.data.length)) {
          reject({
            status: 404,
            message: "Chart does not exists"
          });
        } else {
          result = result.data[0];

          if (result.createdBy !== userId) {
            reject({
              status: 403,
              message: "You are not allowed to perform this operation"
            });
          } else {
            const SQL = `   UPDATE ${statements.DASHBOARD_CHART_TABLE_NAME} 
                          SET isPublic = ?, password = ?, subgroupSize = ?, modifiedOn = now(), modifiedBy = ?
                          WHERE chartId = ? 
                      `;

            const args = [isPublic, password, subgroupSize, userId, chartId];

            db.query(SQL, args)
              .then(() => {
                __getDashboardChart(chartId)
                  .then((res) => resolve(res))
                  .catch((err) => reject(err));
              })
              .catch((err) => {
                console.error("Unable to update dashboard chart", err);
                reject({
                  status: 500,
                  message: err.sqlMessage || "Unable to update dashboard chart"
                });
              });
          }
        }
      })
      .catch((error) => {
        console.error(
          "Unable to Update dashboard chart, Exception occurred :: ",
          error
        );

        if (error && error.status && error.message) reject(error);
        else
          reject({
            status: 500,
            message: "Something went wrong"
          });
      });
  });
}

function updateDashboardSpecLimits(
  chartId,
  upperSpecLimit,
  lowerSpecLimit,
  userId
) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((result) => {
        if (!(result && result.data && result.data.length)) {
          reject({
            status: 404,
            message: "Chart does not exists"
          });
        } else {
          result = result.data[0];

          if (result.createdBy !== userId) {
            reject({
              status: 403,
              message: "You are not allowed to perform this operation"
            });
          } else {
            const SQL = `   UPDATE ${statements.DASHBOARD_CHART_TABLE_NAME} 
                          SET upperSpecLimit = ?, lowerSpecLimit = ?, modifiedOn = now(), modifiedBy = ?
                          WHERE chartId = ? 
                      `;

            const args = [upperSpecLimit, lowerSpecLimit, userId, chartId];

            db.query(SQL, args)
              .then(() => {
                __getDashboardChart(chartId)
                  .then((res) => resolve(res))
                  .catch((err) => reject(err));
              })
              .catch((err) => {
                console.error("Unable to update dashboard chart", err);
                reject({
                  status: 500,
                  message: err.sqlMessage || "Unable to update dashboard chart"
                });
              });
          }
        }
      })
      .catch((error) => {
        console.error(
          "Unable to Update dashboard chart, Exception occurred :: ",
          error
        );

        if (error && error.status && error.message) reject(error);
        else
          reject({
            status: 500,
            message: "Something went wrong"
          });
      });
  });
}

function updateDashboardHeadings(
  headings,
  chartId,
  userId
) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((result) => {
        if (!(result && result.data && result.data.length)) {
          reject({
            status: 404,
            message: "Chart does not exists"
          });
        } else {
          result = result.data[0];

          if (result.createdBy !== userId) {
            reject({
              status: 403,
              message: "You are not allowed to perform this operation"
            });
          } else {
            const SQL = ` UPDATE ${statements.DASHBOARD_CHART_TABLE_NAME} 
                          SET headings = ?, modifiedOn = now(), modifiedBy = ?
                          WHERE chartId = ? 
                      `;

            const args = [headings, userId, chartId];

            db.query(SQL, args)
              .then(() => {
                __getDashboardChart(chartId)
                  .then((res) => resolve(res))
                  .catch((err) => reject(err));
              })
              .catch((err) => {
                console.error("Unable to update headings", err);
                reject({
                  status: 500,
                  message: err.sqlMessage || "Unable to update headings"
                });
              });
          }
        }
      })
      .catch((error) => {
        console.error(
          "Unable to Update dashboard chart Headings, Exception occurred :: ",
          error
        );

        if (error && error.status && error.message) reject(error);
        else
          reject({
            status: 500,
            message: "Something went wrong"
          });
      });
  });
}

function deleteDashboardChart(chartId, userId) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((result) => {
        if (!(result && result.data && result.data.length)) {
          reject({
            status: 404,
            message: "Chart does not exists"
          });
        } else {
          result = result.data[0];

          if (result.createdBy !== userId) {
            reject({
              status: 403,
              message: "You are not allowed to perform this operation"
            });
          } else {
            const SQL = `   DELETE FROM ${statements.DASHBOARD_CHART_TABLE_NAME} 
                          WHERE chartId = ?
                      `;

            const args = [chartId];

            db.query(SQL, args)
              .then(() => {
                if (result.chartType === "x-mr") {
                  removeIndividualsChartData(chartId, userId)
                    .then(() => {
                      resolve({
                        message: "Successfully deleted dashboard chart"
                      });
                    })
                    .catch((err) => {
                      console.error("Unable to delete dashboard chart data", err);
                      reject({
                        status: 500,
                        message: "Unable to delete dashboard chart data"
                      });
                    });
                }
                else {
                  removeSubGroupedChartData(chartId, userId)
                    .then(() => {
                      resolve({
                        message: "Successfully deleted dashboard chart"
                      });
                    })
                    .catch((err) => {
                      console.error("Unable to delete dashboard chart data", err);
                      reject({
                        status: 500,
                        message: "Unable to delete dashboard chart data"
                      });
                    });
                }

              })
              .catch((err) => {
                console.error("Unable to delete dashboard chart", err);
                reject({
                  status: 500,
                  message: err.sqlMessage || "Unable to delete dashboard chart"
                });
              });
          }
        }
      })
      .catch((error) => {
        console.error(
          "Unable to delete dashboard chart, Exception occurred :: ",
          error
        );
        if (error && error.status && error.message) reject(error);
        else
          reject({
            status: 500,
            message: "Something went wrong"
          });
      });
  });
}

function __canCreate(chartId, password, userId) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((dashboardChart) => {
        dashboardChart = dashboardChart.data[0];
        resolve(dashboardChart ? dashboardChart.createdBy === userId : false);
      })
      .catch((err) => {
        resolve(false);
      });
  });
}

function __canUpdate(chartId, password, userId) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((dashboardChart) => {
        dashboardChart = dashboardChart.data[0];
        resolve(dashboardChart ? dashboardChart.createdBy === userId : false);
      })
      .catch((err) => {
        resolve(false);
      });
  });
}

function __canDelete(chartId, password, userId) {
  return new Promise((resolve, reject) => {
    __getDashboardChart(chartId)
      .then((dashboardChart) => {
        dashboardChart = dashboardChart.data[0];
        resolve(dashboardChart ? dashboardChart.createdBy === userId : false);
      })
      .catch((err) => {
        resolve(false);
      });
  });
}

function removeIndividualsChartData(chartId, userId) {
  return new Promise((resolve, reject) => {
    const SQL = `   DELETE FROM ${statements.XMR_CHART_DATA_TABLE_NAME} 
                    WHERE id IN ( 
                      SELECT * FROM (
                        SELECT DISTINCT id FROM ${statements.XMR_CHART_DATA_TABLE_NAME} 
                        WHERE chartId = ? AND createdBy = ?
                      ) AS X
                    )
                  `;

    const args = [chartId, userId];

    db.query(SQL, args)
      .then(() => {
        resolve({
          message: "Successfully removed chart data"
        });
      })
      .catch((err) => {
        console.error("Unable to delete chart data", err);
        reject({
          status: 500,
          message: err.sqlMessage || "Unable to delete chart data"
        });
      });
  });
}

function removeSubGroupedChartData(chartId, userId) {
  return new Promise((resolve, reject) => {
    const SQL = `   DELETE FROM ${statements.X_BAR_R_CHART_TABLE_NAME} 
                    WHERE id IN ( 
                      SELECT * FROM (
                        SELECT DISTINCT id FROM ${statements.X_BAR_R_CHART_TABLE_NAME} 
                        WHERE chartId = ? AND createdBy = ?
                      ) AS X
                    )
                `;
    const args = [chartId, userId];

    const SQL2 = `   DELETE FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME} 
                WHERE rowId IN ( 
                  SELECT * FROM (
                    SELECT DISTINCT rowId FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME} 
                    WHERE chartId = ? AND createdBy = ?
                  ) AS X
                )
            `;
    const args2 = [chartId, userId];

    Promise.all([db.query(SQL, args), db.query(SQL2, args2)])
      .then(() => {
        resolve({
          message: "Successfully removed chart data"
        });
      })
      .catch(() => {
        reject({
          status: 500,
          message: "Unable to delete chart data"
        });
      });
  });
}

async function chartExists(chartId, password, userId) {
  const SQL = `   SELECT * FROM ${statements.DASHBOARD_CHART_TABLE_NAME}
                  WHERE chartId = ?
              `;
  const args = [chartId];
  const res = await db.query(SQL, args);

  let data = [];
  if (res && res[0]) data = res[0];

  if (data.length) {
    data = data[0];

    if (
      data.isPublic ||
      data.password === password ||
      data.createdBy === userId
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

module.exports = Object.freeze({
  isPrivateChart,
  getDashboardChart,
  getDashboardCharts,
  createDashboardChart,
  updateDashboardChart,
  updateDashboardSpecLimits,
  updateDashboardHeadings,
  deleteDashboardChart,
  __canCreate,
  __canUpdate,
  __canDelete,
  chartExists
});
