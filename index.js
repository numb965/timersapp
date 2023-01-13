require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const { TimerWss } = require('./TimerWss');
const http = require('http');
const {getAllTimers} = require('./controllers/timersController')
var url = process.env.MONGODB_URI;
var MongoClient = require('mongodb').MongoClient;
const parseCookies = require('./utill')
const clientPromise = MongoClient.connect(url, {
  useUnifiedTopology: true,
  maxPoolSize: 5,
});

const cookieParser = require("cookie-parser");
const boolParser = require("express-query-boolean");
const registration = require("./routes/registration");
const timerApp = require("./routes/timersApp");

const app = express();
const server = http.createServer(app);
const wss = new TimerWss({ clientTracking: false, noServer: true }, clientPromise);

const clients = new Map()

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(boolParser());
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    const client = await clientPromise;
    req.db = client.db(process.env.MONGODB);
    next()
  } catch (error) {
    next(error)
  }
});

app.use("/", registration);
app.use("/api/timers/", timerApp);

const port = process.env.PORT || 3000;


server.on('upgrade', (request, socket, head)=>{
  const {sessionId, userId} = parseCookies(request);
  console.log("Client trying switch protocol");
  wss.handleUpgrade(request, socket, head, (ws)=>{
    if(sessionId){
      console.log("I have session so I can pass");
      request.userId = userId
      wss.emit('connect', ws, request);
    }
    else{
      socket.write(`
        HTTP/1.1 401 NOT FOUND
      `)
      socket.destroy();
      return
    }
  })
})

server.listen(80, 'study.buddy.internal',() => {
  console.log(`  Listening on http://localhost:${port}`);
});



