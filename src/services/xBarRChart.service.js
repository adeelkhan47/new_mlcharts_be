const dashboardChartService = require("./dashboardChart.service");
const statements = require("../db/statements");
const db = require("../db/config");
const validationUtil = require("../utils/validation.util");

async function __getChartColumnNames(chartId) {
  const SQL = `   SELECT DISTINCT columnName FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME}
                  WHERE chartId = ?
              `;

  const args = [chartId];
  let res = await db.query(SQL, args);
  res = res[0];
  if (res.length) {
    res = res.map((obj) => obj.columnName);
  }
  return res;
}

async function __getChartDataColumns(chartId) {
  const SQL = `   SELECT * FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME}
                  WHERE chartId = ?
              `;

  const args = [chartId];
  let res = await db.query(SQL, args);
  return res[0] || [];
}

async function __dataColExists(rowId, chartId, columnName) {
  const SQL = `   SELECT * FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME}
                  WHERE rowId = ? AND chartId = ? AND columnName = ?
              `;

  const args = [rowId, chartId, columnName];
  let res = await db.query(SQL, args);
  res = res[0];

  return res.length > 0;
}

async function __saveDataColValue(rowId, chartId, columnName, value, userId) {
  const colExists = await __dataColExists(rowId, chartId, columnName);

  let SQL = "";
  let args = [];
  if (colExists) {
    // UPDATE
    SQL = ` UPDATE ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME} 
            SET value = ?, modifiedOn = now(), modifiedBy = ? 
            WHERE rowId = ? AND chartId = ? AND columnName = ? 
                `;

    args = [value, userId, rowId, chartId, columnName];
  } else {
    // CREATE
    SQL = ` INSERT INTO ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME} 
              (rowId, chartId, columnName, value, createdBy) 
            VALUES 
              (?, ?, ?, ?, ?)
          `;

    args = [rowId, chartId, columnName, value, userId];
  }

  await db.query(SQL, args);
}

async function __saveDataColValues(rowId, chartId, values, userId) {
  if (!validationUtil.isNonEmptyObj(values)) return;

  let promises = [];

  for (const columnName in values) {
    const value = values[columnName];
    promises.push(
      __saveDataColValue(rowId, chartId, columnName, value, userId)
    );
  }

  await Promise.all(promises);
}

async function __addChartData(
  chartId,
  reference1 = "",
  reference2 = "",
  note = "",
  values = {},
  userId
) {
  const SQL = ` INSERT INTO ${statements.X_BAR_R_CHART_TABLE_NAME} 
                  (chartId, reference1, reference2, note, createdBy) 
                VALUES 
                  (?, ?, ?, ?, ?)
              `;

  const args = [chartId, reference1, reference2, note, userId];
  const res = await db.query(SQL, args);
  const rowId = res[0].insertId;
  await __saveDataColValues(rowId, chartId, values, userId);
}

async function __updateChartData(
  rowId,
  chartId,
  reference1,
  reference2,
  note,
  values,
  userId
) {
  const SQL = ` UPDATE ${statements.X_BAR_R_CHART_TABLE_NAME} 
                SET reference1 = ?, reference2 = ?, note = ?, modifiedOn = now(), modifiedBy = ? 
                WHERE chartId = ? AND id = ?
              `;
  const args = [reference1, reference2, note, userId, chartId, rowId];
  await db.query(SQL, args);
  await __saveDataColValues(rowId, chartId, values, userId);
}

async function __removeChartData(chartId, rowId) {
  const SQL = `   DELETE FROM ${statements.X_BAR_R_CHART_TABLE_NAME} 
                  WHERE chartId = ? AND id = ?
              `;
  const DATA_COL_SQL = `   DELETE FROM ${statements.X_BAR_R_CHART_DATA_COLUMNS_NAME} 
                            WHERE chartId = ? AND rowId = ?
                        `;
  const args = [chartId, rowId];
  await db.query(SQL, args);
  await db.query(DATA_COL_SQL, args);
}

async function getChartDataColumnNames(chartId, password, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const cols = await __getChartColumnNames(chartId);
  Response.status = 200;
  Response.data = cols;
  return Response;
}

async function getChartData(chartId, password, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const SQL = `   SELECT * FROM ${statements.X_BAR_R_CHART_TABLE_NAME}
                  WHERE chartId = ?
              `;
  const args = [chartId];

  const res = await db.query(SQL, args);
  let chartDataList = [];
  if (res && res[0]) chartDataList = res[0];

  let dataCols = await __getChartDataColumns(chartId);
  const values = dataCols.reduce((valuesObj, colObj) => {
    const values = valuesObj[colObj.rowId] || {};
    values[colObj.columnName] = colObj.value;
    valuesObj[colObj.rowId] = values;
    return valuesObj;
  }, {});

  chartDataList = chartDataList.map((dataRow) => {
    dataRow.values = values[dataRow.id] || {};
    return dataRow;
  });

  Response.status = 200;
  Response.data = chartDataList;
  return Response;
}

async function addChartData(
  chartId,
  password,
  reference1 = "",
  reference2 = "",
  note = "",
  values = {},
  userId
) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const canAddData = await dashboardChartService.__canCreate(
    chartId,
    password,
    userId
  );

  if (!canAddData) {
    Response.status = 403;
    Response.message = "You are not allowed to perform this operation";
    return Response;
  }

  await __addChartData(chartId, reference1, reference2, note, values, userId);

  Response.status = 200;
  Response.message = "Successfully added chart data";
  return Response;
}

async function updateChartData(
  rowId,
  chartId,
  password = "",
  reference1 = "",
  reference2 = "",
  note = "",
  values,
  userId
) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const canUpdateData = await dashboardChartService.__canUpdate(
    chartId,
    password,
    userId
  );

  if (!canUpdateData) {
    Response.status = 403;
    Response.message = "You are not allowed to perform this operation";
    return Response;
  }

  await __updateChartData(
    rowId,
    chartId,
    reference1,
    reference2,
    note,
    values,
    userId
  );

  Response.status = 200;
  Response.message = "Successfully updated chart data";
  return Response;
}

async function removeChartData(chartId, password, rowId, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const canDeleteChartData = await dashboardChartService.__canDelete(
    chartId,
    password,
    userId
  );

  if (!canDeleteChartData) {
    Response.status = 403;
    Response.message = "You are not allowed to perform this operation";
    return Response;
  }

  await __removeChartData(chartId, rowId);

  Response.status = 200;
  Response.message = "Successfully removed chart data item";
  return Response;
}

// Update multiple

async function addMultiChartData(chartId, password, records, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const canAddData = await dashboardChartService.__canCreate(
    chartId,
    password,
    userId
  );

  if (!canAddData) {
    Response.status = 403;
    Response.message = "You are not allowed to perform this operation";
    return Response;
  }

  let promises = [];
  records.forEach((record) => {
    promises.push(
      __addChartData(
        chartId,
        record.reference1,
        record.reference2,
        record.note,
        record.values,
        userId
      )
    );
  });
  await Promise.all(promises);

  Response.status = 200;
  Response.message = "Successfully added chart data";
  return Response;
}

async function updateMultiChartData(chartId, password = "", records, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };
  const chartExists = await dashboardChartService.chartExists(
    chartId,
    password,
    userId
  );

  if (!chartExists) {
    Response.status = 404;
    Response.message = "Unable to find dashboard chart";
    return Response;
  }

  const canUpdateData = await dashboardChartService.__canUpdate(
    chartId,
    password,
    userId
  );

  if (!canUpdateData) {
    Response.status = 403;
    Response.message = "You are not allowed to perform this operation";
    return Response;
  }

  let promises = [];
  records.forEach((record) => {
    promises.push(
      __updateChartData(
        record.id,
        chartId,
        record.reference1,
        record.reference2,
        record.note,
        record.values,
        userId
      )
    );
  });
  await Promise.all(promises);

  Response.status = 200;
  Response.message = "Successfully updated chart data";
  return Response;
}

async function removeMultiChartData(chartId, password, rowIds, userId) {
  const Response = {
    status: 000,
    message: "",
    data: null
  };

  let promises = [];
  rowIds.forEach((rowId) => {
    promises.push(__removeChartData(chartId, rowId));
  });
  await Promise.all(promises);

  Response.status = 200;
  Response.message = "Successfully removed chart data";
  return Response;
}

module.exports = Object.freeze({
  getChartDataColumnNames,
  getChartData,
  addChartData,
  updateChartData,
  removeChartData,
  // Update multiple
  addMultiChartData,
  updateMultiChartData,
  removeMultiChartData
});
