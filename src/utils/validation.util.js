function isValidObj(obj) {
  return !!(
    obj &&
    typeof obj == "object" &&
    !(obj instanceof Array) &&
    Object.keys(obj).length
  );
}

function isValidString(str) {
  return !!(str && typeof str === "string" && str.trim().length);
}

function isValidDataObj(obj) {
  return !!(isValidObj(obj) && obj.id && obj.hasOwnProperty("value"));
}

function isValidDashboardChartObj(obj) {
  return !!(
    isValidObj(obj) &&
    isValidString(obj.name) &&
    obj.hasOwnProperty("isPublic") &&
    typeof obj.isPublic === "boolean" &&
    obj.hasOwnProperty("subgroupSize") &&
    (typeof obj.subgroupSize === "number" || !isNaN(obj.subgroupSize)) &&
    isValidString(obj.chartType) &&
    (obj.isPublic ? true : isValidString(obj.password))
  );
}

const validationUtil = {
  isValidObj,
  isValidString,
  isValidDataObj,
  isValidDashboardChartObj
};

module.exports = validationUtil;
