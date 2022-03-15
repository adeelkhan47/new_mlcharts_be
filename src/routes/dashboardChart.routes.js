const dashboardChartService = require("../services/dashboardChart.service");
const express = require("express");
const validationUtil = require("../utils/validation.util");
const router = express.Router();

router.get("/", (req, res) => {
  const userId = req.headers["user-id"];

  if (validationUtil.isValidString(userId)) {
    dashboardChartService
      .getDashboardCharts(userId)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        res.status(err.status);
        res.send(err.message);
      });
  } else {
    res.status(401);
    res.send("Authentication is required");
  }
});

router.get("/:chartId", (req, res) => {
  const chartId = req.params.chartId;
  const password = req.query.password || "";
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isValidString(chartId)
  ) {
    dashboardChartService
      .getDashboardChart(chartId, password, userId)
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
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isValidObj(body) &&
    validationUtil.isValidDashboardChartObj(body)
  ) {
    body.subgroupSize = Number.parseInt(body.subgroupSize);
    dashboardChartService
      .createDashboardChart(
        body.name,
        body.isPublic,
        body.password,
        body.subgroupSize,
        body.chartType,
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

router.put("/:chartId", (req, res) => {
  const body = {
    ...(req.body || {}),
    name: "not-needed",
    chartType: "not-needed"
  };
  const chartId = req.params.chartId;
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isValidString(chartId) &&
    validationUtil.isValidObj(body) &&
    validationUtil.isValidDashboardChartObj(body)
  ) {
    body.subgroupSize = Number.parseInt(body.subgroupSize);
    dashboardChartService
      .updateDashboardChart(
        chartId,
        body.isPublic,
        body.password,
        body.subgroupSize,
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

router.delete("/:chartId", (req, res) => {
  const chartId = req.params.chartId;
  const userId = req.headers["user-id"];

  if (
    validationUtil.isValidString(userId) &&
    validationUtil.isValidString(chartId)
  ) {
    dashboardChartService
      .deleteDashboardChart(chartId, userId)
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

module.exports = router;
