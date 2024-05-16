const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const user = require("./server/routes/user");
const prof = require("./server/routes/prof");
const teacher = require("./server/routes/teacher");
const student = require("./server/routes/student");
const schedule = require("./server/routes/schedule");
const contacts = require("./server/routes/contacts");
const people = require("./server/routes/people");
const bank = require("./server/routes/bank");
const dotenv = require("dotenv");
const connectDB = require("./server/db/mongodb");
dotenv.config();
var cors = require("cors");

// console.log(process.env)
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const hostname = "127.0.0.1";
const port = 3050;

connectDB();

app.use(express.json());

app.use("/user", user);
app.use("/bank", bank);
app.use("/prof", prof);
app.use("/teacher", teacher);
app.use("/student", student);
app.use("/schedule", schedule);
app.use("/contacts", contacts);
app.use("/people", people);

app.listen(port);
