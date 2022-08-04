const http = require("http");
const app = require("./app2");
const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(port);
