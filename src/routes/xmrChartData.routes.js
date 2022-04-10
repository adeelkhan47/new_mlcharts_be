const validationUtil = require("../utils/validation.util");
const xmrChartDataService = require("../services/xmrChartData.service");
const express = require("express");
const router = express.Router();

router.get("/:chartId", (req, res) => {
  const chartId = req.params.chartId;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isValidString(chartId)
  ) {
    xmrChartDataService
      .getAllData(chartId, password, userId)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        res.status(err.status);
        res.send(err.message);
      });
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

router.post("/", (req, res) => {
  const body = req.body;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (validationUtil.isValidString(userId) && body) {
    if (
      body instanceof Array &&
      validationUtil.isValidString(body[0].chartId) &&
      body[0].hasOwnProperty("value")
    ) {
      let promises = [];

      body.forEach((obj) => {
        promises.push(
          new Promise((resolve, rej) => {
            xmrChartDataService
              .createData(
                obj.chartId,
                password,
                obj.label || "",
                obj.value,
                obj.reference || "",
                userId
              )
              .then((response) => {
                resolve(response);
              })
              .catch((err) => {
                rej(err);
              });
          })
        );
      });

      Promise.allSettled(promises)
        .then((results) => {
          const found = results.find((obj) => obj.status === "fulfilled");
          if (found)
            res.send({
              message: "Successfully created data"
            });
          else {
            res.status(results[0].reason.status || 500);
            res.send(results[0].reason.message || "Unable to create data");
          }
        })
        .catch((err) => {
          console.error("err :: ", err);
          res.status(500);
          res.send("Unable to create data");
        });
    } else if (
      typeof body == "object" &&
      !(body instanceof Array) &&
      validationUtil.isValidString(body.chartId) &&
      body.hasOwnProperty("value")
    ) {
      xmrChartDataService
        .createData(
          body.chartId,
          password,
          body.label || "",
          body.value,
          body.reference || "",
          userId
        )
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.status(err.status);
          res.send(err.message);
        });
    } else {
      res.status(400);
      res.send("Invalid Request data");
    }
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

router.put("/", (req, res) => {
  const body = req.body;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isNonEmptyObj(body) &&
    validationUtil.isValidString(body.chartId) &&
    body.dataId &&
    body.hasOwnProperty("value")
  ) {
    xmrChartDataService
      .updateData(
        body.chartId,
        password,
        body.dataId,
        body.label,
        body.value,
        body.reference,
        userId
      )
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        res.status(err.status);
        res.send(err.message);
      });
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

router.put("/many", (req, res) => {
  const body = req.body;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isNonEmptyObj(body) &&
    validationUtil.isValidString(body.chartId) &&
    body.dataObjectList
  ) {
    const dataObjectList = body.dataObjectList.filter(
      validationUtil.isValidDataObj
    );
    let error = null;

    if (dataObjectList && dataObjectList.length) {
      dataObjectList.forEach(async (obj) => {
        try {
          await xmrChartDataService.updateData(
            body.chartId,
            password,
            obj.id,
            obj.label,
            obj.value,
            obj.reference,
            userId
          );
        } catch (err) {
          console.error(err);
          error = err;
        }
      });
    }

    if (error) {
      res.status(error.status);
      res.send(error.message);
    } else {
      res.send({
        message: "Successfully updated data"
      });
    }
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

router.delete("/", (req, res) => {
  const body = req.body;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isNonEmptyObj(body) &&
    validationUtil.isValidString(body.chartId) &&
    body.dataId
  ) {
    xmrChartDataService
      .removeData(body.chartId, password, body.dataId, userId)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        res.status(err.status);
        res.send(err.message);
      });
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

router.delete("/many", (req, res) => {
  const body = req.body;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isNonEmptyObj(body) &&
    validationUtil.isValidString(body.chartId) &&
    body.dataIds &&
    body.dataIds.length
  ) {
    const dataIds = body.dataIds;
    let error = null;

    if (dataIds && dataIds.length) {
      dataIds.forEach(async (dataId) => {
        try {
          await xmrChartDataService.removeData(
            body.chartId,
            password,
            dataId,
            userId
          );
        } catch (err) {
          error = err;
        }
      });
    }

    if (error) {
      res.status(error.status);
      res.send(error.message);
    } else {
      res.send({
        message: "Successfully removed data item"
      });
    }
  } else {
    res.status(400);
    res.send("Invalid Request data");
  }
});

module.exports = router;
