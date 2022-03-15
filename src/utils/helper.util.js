const validationUtil = require("./validation.util");

function generateId(str) {
  if (validationUtil.isValidString(str))
    return str.trim().replaceAll(" ", "_").toLowerCase();
  else return "";
}

const helperUtil = {
  generateId
};

module.exports = helperUtil;
