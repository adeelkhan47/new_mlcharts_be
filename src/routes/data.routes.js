const validationUtil = require("../utils/validation.util");
const dataService = require("../services/data.service");
const express = require("express");
const router = express.Router();

router.get("/:userId", (req, res) => {
  dataService
    .getAllData(req.params.userId)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      res.status(err.status);
      res.send(err.message);
    });
});

router.post("/", (req, res) => {
  const body = req.body;

  if (body && typeof body == "object" && Object.keys(body).length) {
    if (
      body instanceof Array &&
      body[0].userId &&
      body[0].label &&
      body[0].hasOwnProperty("value")
    ) {
      let promises = [];

      body.forEach((obj) => {
        promises.push(
          new Promise((resolve, rej) => {
            dataService
              .createData(obj.userId, obj.label, obj.value)
              .then((response) => {
                resolve(response);
              })
              .catch((err) => {
                console.error(err);
                rej(err);
              });
          })
        );
      });

      Promise.allSettled(promises)
        .then((response) => {
          res.send({
            message: "Successfully created data"
          });
        })
        .catch((err) => {
          console.error("err :: ", err);
          res.status(500);
          res.send("Unable to create data");
        });
    } else if (
      typeof body == "object" &&
      !(body instanceof Array) &&
      body.userId &&
      body.label &&
      body.hasOwnProperty("value")
    ) {
      dataService
        .createData(body.userId, body.label, body.value)
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

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.userId &&
    body.dataId &&
    body.label &&
    body.hasOwnProperty("value")
  ) {
    dataService
      .updateData(body.userId, body.dataId, body.label, body.value)
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

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.userId &&
    body.dataObjectList
  ) {
    const dataObjectList = body.dataObjectList.filter(
      validationUtil.isValidDataObj
    );
    let error = null;

    if (dataObjectList && dataObjectList.length) {
      dataObjectList.forEach(async (obj) => {
        try {
          await dataService.updateData(
            body.userId,
            obj.id,
            obj.label,
            obj.value
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

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.userId &&
    body.dataId
  ) {
    dataService
      .removeData(body.userId, body.dataId)
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

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.userId &&
    body.dataIds &&
    body.dataIds.length
  ) {
    const dataIds = body.dataIds;
    let error = null;

    if (dataIds && dataIds.length) {
      dataIds.forEach(async (dataId) => {
        try {
          await dataService.removeData(body.userId, dataId);
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
