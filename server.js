const db = require("./src/db/config");
const validationUtil = require("./src/utils/validation.util");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8090;

const dashboardChartRoutes = require("./src/routes/dashboardChart.routes");
const xmrChartDataRoutes = require("./src/routes/xmrChartData.routes");
const xBarRChartRoutes = require("./src/routes/xBarRChart.routes");
const userService = require("./src/services/user.service");
const userRoutes = require("./src/routes/user.routes");

db.connect();

app.use(cors());
app.use(express.json());
app.use(authChecker);

// ROUTES
app.use("/dashboard-charts", dashboardChartRoutes);
app.use("/xmr-data", xmrChartDataRoutes);
app.use("/x-bar-r", xBarRChartRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.info(`Listening on Port ${PORT}`);
});

function authChecker(req, res, next) {
  if (req.path === "/users/login" || req.path === "/users/register") {
    next();
  } else {
    let userId = req.headers["user-id"];
    if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

    if (userId) {
      userService
        .__userExists(userId)
        .then((result) => {
          if (result) {
            next();
          } else {
            res.status(403);
            res.send("Authentication is required");
          }
        })
        .catch((err) => {
          res.status(500);
          res.send("Something went wrong");
        });
    } else {
      res.status(403);
      res.send("Authentication is required");
    }
  }
}
