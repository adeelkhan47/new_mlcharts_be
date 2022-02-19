function isValidDataObj(obj) {
  return !!(
    obj &&
    typeof obj == "object" &&
    !(obj instanceof Array) &&
    Object.keys(obj).length &&
    obj.id &&
    obj.hasOwnProperty("value")
  );
}

function isValidString(str) {
  return !!(str && typeof str === "string" && str.trim().length);
}

const validationUtil = {
  isValidDataObj,
  isValidString
};

module.exports = validationUtil;
