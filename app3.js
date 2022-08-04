const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const userRoute = require("./api/routes/user");
const getTokenRoute = require("./api/routes/getToken");
const categoryRoute = require("./api/routes/category");
const qustionRoute = require("./api/routes/question");
const cookieRoute = require("./api/routes/cookie");
// var cors = require("cors");

const password = process.env.MONGO_ATLAS_PW;
const MONGOB_URI = `mongodb+srv://admin-aishwary:${password}@cluster0.j80mt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(MONGOB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected");
});

// const username = "aishwary";
// const password = "Test123";
// const cluster = "cluster0.zka6j";
// const dbname = "myFirstDatabase";

// mongoose.connect(
//   `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error: "));
// db.once("open", function () {
//   console.log("Connected successfully");
// });

// mongoose
//   .connect(
//     "mongodb+srv://admin-aishwary:" +
//       process.env.MONGO_ATLAS_PW +
//       "@cluster0.j80mt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => console.log("MongoDb Conected"))
//   .catch((err) => console.log("mongoose error is: ", err)); // connect database with mongoose.

//cors error
// var corsOptions = {
//   origin: "*",
//   credentials: true,
// };

// app.use(allowCrossDomain);

app.use(morgan("dev")); //for log the methods
//body-parser come default in express so there is no need to install body-parser
app.use(bodyparser.urlencoded({ extended: false })); // to make a urlencoded file in redable form so that we read it easily
app.use(bodyparser.json()); //to make a json file in redable form so that we read it easily
// app.use(cors(corsOptions));

// for CORS error
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Autorization"
  );

  if (req.method === "OPTIONS") {
    // res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");

    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Credentials", true);

    return res.status(200).json({});
  }

  next();
});

app.use("/quizMaster/category", categoryRoute);
app.use("/quizMaster/question", qustionRoute);
app.use("/quizMaster/user", userRoute);
app.use("/quizMaster/token", getTokenRoute);

app.use("/", cookieRoute);

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
