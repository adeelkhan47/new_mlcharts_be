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

        userService.login(body.email, body.password)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
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

    if (
        body &&
        typeof body == "object" &&
        Object.keys(body).length &&
        body.email &&
        body.password &&
        body.firstName &&
        body.lastName &&
        body.dob
    ) {

        userService.register(body.email, body.password, body.firstName, body.lastName, body.dob)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
                res.status(err.status);
                res.send(err.message);
            });

    } else {
        res.status(400);
        res.send("Invalid Request data");
    }
});


module.exports = router;