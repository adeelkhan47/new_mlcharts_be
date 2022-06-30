const DB_NAME = "mlp";
const USER_TABLE_NAME = "users";
const DASHBOARD_CHART_TABLE_NAME = "dashboard_charts";
const XMR_CHART_DATA_TABLE_NAME = "xmr_chart_data";
const X_BAR_R_CHART_TABLE_NAME = "x_bar_r_chart_data";
const X_BAR_R_CHART_DATA_COLUMNS_NAME = "x_bar_r_data_columns";

const CREATE_DB = `             CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;

const CONNECT_DB = `            USE ${DB_NAME}`;

const CREATE_USER_TABLE = `     
                                CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME} 
                                (
                                    email VARCHAR(255) PRIMARY KEY, 
                                    password VARCHAR(255),
                                    firstName VARCHAR(255),
                                    lastName VARCHAR(255),
                                    company VARCHAR(255) NULL,
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    modifiedOn DATETIME NULL
                                )
                        `;

const CREATE_DASHBOARD_CHART_TABLE = `     
                                CREATE TABLE IF NOT EXISTS ${DASHBOARD_CHART_TABLE_NAME} 
                                (
                                    chartId VARCHAR(255) PRIMARY KEY,
                                    name VARCHAR(255),
                                    isPublic BOOLEAN,
                                    password VARCHAR(255),
                                    subgroupSize INT,
                                    chartType VARCHAR(255),
                                    upperSpecLimit VARCHAR(255),
                                    lowerSpecLimit VARCHAR(255),
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    createdBy VARCHAR(255),
                                    modifiedOn DATETIME NULL,
                                    modifiedBy VARCHAR(255) NULL
                                )
                        `;

const CREATE_XMR_CHART_DATA_TABLE = `     
                                CREATE TABLE IF NOT EXISTS ${XMR_CHART_DATA_TABLE_NAME} 
                                (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    chartId VARCHAR(255),
                                    label VARCHAR(255),
                                    value DOUBLE,
                                    reference VARCHAR(255),
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    createdBy VARCHAR(255),
                                    modifiedOn DATETIME NULL, 
                                    modifiedBy VARCHAR(255) NULL
                                )
                        `;

const CREATE_X_BAR_R_CHART_TABLE = `
                                CREATE TABLE IF NOT EXISTS ${X_BAR_R_CHART_TABLE_NAME}
                                (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    chartId VARCHAR(255),
                                    reference1 VARCHAR(255),
                                    reference2 VARCHAR(255),
                                    createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    createdBy VARCHAR(255),
                                    modifiedOn DATETIME NULL,
                                    modifiedBy VARCHAR(255) NULL
                                )
                        `;

const CREATE_X_BAR_R_CHART_DATA_COLUMNS = `
                        CREATE TABLE IF NOT EXISTS ${X_BAR_R_CHART_DATA_COLUMNS_NAME}
                        (
                            rowId INT,
                            chartId VARCHAR(255),
                            columnName VARCHAR(255),
                            value DOUBLE,
                            createdOn DATETIME DEFAULT CURRENT_TIMESTAMP,
                            createdBy VARCHAR(255),
                            modifiedOn DATETIME NULL,
                            modifiedBy VARCHAR(255) NULL,
                            PRIMARY KEY (rowId, chartId, columnName)
                        )
                `;

const statements = Object.freeze({
    DB_NAME,
    USER_TABLE_NAME,
    DASHBOARD_CHART_TABLE_NAME,
    XMR_CHART_DATA_TABLE_NAME,
    CREATE_DB,
    CONNECT_DB,
    CREATE_USER_TABLE,
    CREATE_DASHBOARD_CHART_TABLE,
    CREATE_XMR_CHART_DATA_TABLE,

    X_BAR_R_CHART_TABLE_NAME,
    X_BAR_R_CHART_DATA_COLUMNS_NAME,
    CREATE_X_BAR_R_CHART_TABLE,
    CREATE_X_BAR_R_CHART_DATA_COLUMNS
});

module.exports = statements;
