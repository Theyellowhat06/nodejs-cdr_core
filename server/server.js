const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const prof = require("./routes/prof");
const teacher = require("./routes/teacher");
const student = require("./routes/student");
const schedule = require("./routes/schedule");
const contacts = require("./routes/contacts");
const dotenv = require('dotenv');
dotenv.config();
var cors = require("cors");

// console.log(process.env)
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const hostname = "127.0.0.1";
const port = 3050;

app.use(express.json());

app.use("/user", user);
app.use("/prof", prof);
app.use("/teacher", teacher);
app.use("/student", student);
app.use("/schedule", schedule);
app.use("/contacts", contacts);

app.listen(port);
