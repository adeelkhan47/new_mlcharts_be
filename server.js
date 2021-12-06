const db = require("./src/db/config");
const express = require("express");
const cors = require('cors');
const app = express();
const PORT = 8090;

const dataRoutes = require("./src/routes/data.routes");
const userRoutes = require("./src/routes/user.routes");


db.connect();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/data", dataRoutes);
app.use("/users", userRoutes);



app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});