const dashboardChartService = require("../services/dashboardChart.service");
const express = require("express");
const validationUtil = require("../utils/validation.util");
const router = express.Router();

router.get("/", (req, res) => {
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (userId) {
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

router.get("/is-private/:chartId", (req, res) => {
  const chartId = req.params.chartId;
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    validationUtil.isValidString(chartId) &&
    userId
  ) {
    dashboardChartService
      .isPrivateChart(chartId, userId)
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

router.get("/:chartId", (req, res) => {
  const chartId = req.params.chartId;
  const password = req.query.password || "";
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
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
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
    validationUtil.isNonEmptyObj(body) &&
    validationUtil.isValidDashboardChartObj(body) &&
    body.hasOwnProperty("upperSpecLimit") &&
    body.hasOwnProperty("lowerSpecLimit")
  ) {
    body.subgroupSize = Number.parseInt(body.subgroupSize);
    dashboardChartService
      .createDashboardChart(
        body.name,
        body.isPublic,
        body.password,
        body.subgroupSize,
        body.chartType,
        body.upperSpecLimit,
        body.lowerSpecLimit,
        body.headings || "",
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
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
    validationUtil.isValidString(chartId) &&
    validationUtil.isNonEmptyObj(body) &&
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

router.put("/spec-limits/:chartId", (req, res) => {
  const body = req.body;
  const chartId = req.params.chartId;
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
    validationUtil.isValidString(chartId) &&
    validationUtil.isNonEmptyObj(body) &&
    body.hasOwnProperty("upperSpecLimit") &&
    body.hasOwnProperty("lowerSpecLimit")
  ) {
    dashboardChartService
      .updateDashboardSpecLimits(
        chartId,
        body.upperSpecLimit,
        body.lowerSpecLimit,
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

router.put("/headings/:chartId", (req, res) => {
  const headings = req.body.headings;
  const chartId = req.params.chartId;
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
    validationUtil.isValidString(chartId)
  ) {
    dashboardChartService
      .updateDashboardHeadings(
        headings,
        chartId,
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
  let userId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    userId &&
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
