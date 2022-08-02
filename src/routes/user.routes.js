const userService = require("../services/user.service");
const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const body = req.body;

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.hasOwnProperty("email") &&
    body.hasOwnProperty("password") &&
    body.email &&
    body.password
  ) {
    userService
      .login(body.email, body.password)
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

router.post("/register", (req, res) => {
  const body = req.body;
  let userId = req.headers["user-id"] || null;
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    body.email &&
    body.password &&
    body.firstName &&
    body.lastName
  ) {
    userService
      .register(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
        body.company || "",
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

router.put("/:userId", (req, res) => {
  const body = req.body;
  let userId = req.params.userId;
  let currentUserId = req.headers["user-id"];
  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);
  if (currentUserId && typeof currentUserId !== 'number' && !isNaN(currentUserId)) currentUserId = Number.parseInt(currentUserId);

  if (
    body &&
    typeof body == "object" &&
    Object.keys(body).length &&
    userId &&
    currentUserId === userId
  ) {
    userService
      .updateUser(
        userId,
        body
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

router.post("/delete/:userId", (req, res) => {
  const body = req.body;
  let userId = req.params.userId;
  let currentUserId = req.headers["user-id"];

  if (userId && typeof userId !== 'number' && !isNaN(userId)) userId = Number.parseInt(userId);
  if (currentUserId && typeof currentUserId !== 'number' && !isNaN(currentUserId)) currentUserId = Number.parseInt(currentUserId);

  if (
    body &&
    typeof body == "object" &&
    body.password &&
    userId &&
    currentUserId === userId
  ) {
    userService
      .deleteUser(userId, body.password)
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
