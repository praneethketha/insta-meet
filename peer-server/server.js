// initialize express
var express = require("express");
var app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

// create express peer server
var ExpressPeerServer = require("peer").ExpressPeerServer;

var options = {
  debug: true,
};

// create a http server instance to listen to request
var server = require("http").createServer(app);

app.use("/peerjs", ExpressPeerServer(server, options));
server.listen(process.env.PORT || 8878);
