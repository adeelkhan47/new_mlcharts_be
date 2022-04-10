function isNonEmptyObj(obj) {
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
  return !!(isNonEmptyObj(obj) && obj.id && obj.hasOwnProperty("value"));
}

function isValidDashboardChartObj(obj) {
  return !!(
    isNonEmptyObj(obj) &&
    isValidString(obj.name) &&
    obj.hasOwnProperty("isPublic") &&
    typeof obj.isPublic === "boolean" &&
    obj.hasOwnProperty("subgroupSize") &&
    (typeof obj.subgroupSize === "number" || !isNaN(obj.subgroupSize)) &&
    isValidString(obj.chartType) &&
    (obj.isPublic ? true : isValidString(obj.password))
  );
}

function isNonEmptyArray(arr) {
  return !!(arr instanceof Array && arr.length);
}

function isArrayOfString(arr) {
  return !!(isNonEmptyArray(arr) && isValidString(arr[0]));
}

const validationUtil = {
  isNonEmptyObj,
  isValidString,
  isValidDataObj,
  isNonEmptyArray,
  isArrayOfString,
  isValidDashboardChartObj
};

module.exports = validationUtil;
