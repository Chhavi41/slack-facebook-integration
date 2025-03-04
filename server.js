require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dogRoutes = require("./src/routes.js");
const { connectDB } = require("./src/config/db");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/dogs", dogRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;