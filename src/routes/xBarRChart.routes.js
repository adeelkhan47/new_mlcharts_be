const validationUtil = require("../utils/validation.util");
const xBarRChartService = require("../services/xBarRChart.service");
const express = require("express");
const router = express.Router();

router.get("/column/:chartId", async (req, res) => {
  try {
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId)
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.getChartDataColumnNames(
      chartId,
      password,
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.get("/:chartId", async (req, res) => {
  try {
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId)
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.getChartData(
      chartId,
      password,
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.post("/:chartId", async (req, res) => {
  try {
    const body = req.body;
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId) &&
        validationUtil.isNonEmptyObj(body)
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.addChartData(
      chartId,
      password,
      body.reference1 || "",
      body.reference2 || "",
      body.note || "",
      body.values || {},
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.put("/:chartId/:rowId", async (req, res) => {
  try {
    const body = req.body;
    const chartId = req.params.chartId;
    const rowId = req.params.rowId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isNonEmptyObj(body) &&
        validationUtil.isValidString(chartId) &&
        rowId
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.updateChartData(
      rowId,
      chartId,
      password,
      body.reference1 || "",
      body.reference2 || "",
      body.note || "",
      body.values || {},
      userId
    );

    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.delete("/:chartId/:rowId", async (req, res) => {
  try {
    const chartId = req.params.chartId;
    const rowId = req.params.rowId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId) &&
        rowId
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.removeChartData(
      chartId,
      password,
      rowId,
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

// UPDATE MULTIPLE

router.post("/data/multi/:chartId", async (req, res) => {
  try {
    const body = req.body;
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId) &&
        validationUtil.isNonEmptyArray(body)
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.addMultiChartData(
      chartId,
      password,
      body,
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.put("/data/multi/:chartId", async (req, res) => {
  try {
    const body = req.body;
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId) &&
        validationUtil.isNonEmptyArray(body) &&
        body[0].id
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.updateMultiChartData(
      chartId,
      password,
      body,
      userId
    );

    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

router.delete("/data/multi/:chartId", async (req, res) => {
  try {
    const body = req.body;
    const chartId = req.params.chartId;
    const password = req.query.password || "";
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (
      !(
        userId &&
        validationUtil.isValidString(chartId) &&
        validationUtil.isNonEmptyArray(body)
      )
    ) {
      res.status(400);
      res.send({
        status: 400,
        message: "Invalid Request data"
      });
      return;
    }

    const response = await xBarRChartService.removeMultiChartData(
      chartId,
      password,
      body,
      userId
    );
    res.status(response.status);
    res.send(response);
  } catch (error) {
    res.status(500);
    res.send({
      status: 500,
      message: error.message || "Something went wrong"
    });
  }
});

module.exports = router;
