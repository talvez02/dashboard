const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");
const app = express();
const serverPortNo = 80;
let moment = require("moment");

// DB
const dbConfig = require("./config/dbConfig.json");
let pool;

function handleDisconnect() {
  pool = db.createPool(dbConfig);

  pool.on("connection", (err) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    if (err) {
      console.log("Connecting... : " + now);
      setTimeout(handleDisconnect, 3000);
    }
  });

  pool.on("error", (err) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Connection Lost : " + now);
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

app.use(compression());
app.set("views", path.join(__dirname, "/views"));
app.use("/scripts", express.static(path.join(__dirname, "/node_modules")));
app.use(express.static(path.join(__dirname, "/public")));

// ejs template
// Template HTML -> app.set("view engine", "html");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  secret: "!@#nts#@!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
}));

// passport
const passportConfig = require("./config/passport")(passport, LocalStrategy);
app.use(passport.initialize());
app.use(passport.session());

// router
const maxLabel = (() => {
  let realMaxLabel = 5;

  return {
    getMaxLabel: () => realMaxLabel,
    getAbsoluteMaxLabel: () => 20,
    setMaxLabel: value => {
      realMaxLabel = value;
    },
  };
})();

app.use("/", require("./routes/route.js")(pool));
app.use("/getData", require("./routes/getData.js")(pool, maxLabel));
app.use("/access", require("./routes/accessDB.js")(pool));
app.use("/admin", require("./routes/admin.js")(passport, maxLabel));
app.get("*", (req, res, next) => {
  let err = new Error();

  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status === 500) {
    res.status(500).render("page_500");
  } else if (err.status === 404) {
    res.status(404).render("page_404");
  } else {
    res.status(400).json({
      "error": "Bad Request"
    });
  }
});

const server = app.listen(serverPortNo, () => {
  const now = moment().format("YYYY.MM.DD HH:mm:ss");

  console.log("Server Start : " + now);
});
