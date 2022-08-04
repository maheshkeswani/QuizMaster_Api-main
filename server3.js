require("dotenv").config();
const http = require("http");
const app = require("./app3");
const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log("server is running at port 5000");
});
