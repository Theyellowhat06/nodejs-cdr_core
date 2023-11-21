const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const prof = require("./routes/prof");
const teacher = require("./routes/teacher");
const student = require("./routes/student");
const schedule = require("./routes/schedule");
var cors = require("cors");

const app = express();
app.use(cors());

const hostname = "127.0.0.1";
const port = 3050;

app.use(express.json());

app.use("/user", user);
app.use("/prof", prof);
app.use("/teacher", teacher);
app.use("/student", student);
app.use("/schedule", schedule);

app.listen(port);
