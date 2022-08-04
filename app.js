const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const categoryRoute = require("./api/routes/category");
const qustionRoute = require("./api/routes/question");

mongoose
  .connect(
    "mongodb+srv://admin-aishwary:" +
      process.env.MONGO_ATLAS_PW +
      "@cluster0.j80mt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDb Conected"))
  .catch((err) => console.log(err)); // connect database with mongoose.

app.use(morgan("dev")); //for log the methods
//body-parser come default in express so there is no need to install body-parser
app.use(bodyparser.urlencoded({ extended: false })); // to make a urlencoded file in redable form so that we read it easily
app.use(bodyparser.json()); //to make a json file in redable form so that we read it easily
app.use(helmet());
app.use(cookieParser());

//for CORS error
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Autorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }

  next();
});

app.use("/quizMaster/category", categoryRoute);
app.use("/quizMaster/question", qustionRoute);

//if the request are not go in any route
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// for above error or any error while getting data from database or anything happen.
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message,
  });
});

module.exports = app;
