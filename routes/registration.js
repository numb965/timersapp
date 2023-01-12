const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const bodyParser = require("body-parser");
const {createUser, createSession, deleteSession, findUserBySessionId, findUserByUsername, findUserById} = require('../controllers/registrationController')

const auth = () => async (req, res, next) => {

  try {
    if (!req.cookies["sessionId"]) {
      return next();
    }
    const user = await findUserBySessionId(req.cookies["sessionId"], req.db);
    req.user = user;
    req.sessionId = req.cookies["sessionId"];
    next();
  } catch (error) {
    console.error(error)
  }

};

router.get("/", auth(), (req, res) => {
  res.render("index", {
    user: req.user ? {
      username: req.user.username,
      id: req.user._id.toString()
    } : false,
    authError: req.query.authError ? "Wrong username or password" : req.query.authError,
    signupError: req.query.signupError ? "This user alreay exists" : req.query.signupError,
  });
});

router.post(
  "/login",
  bodyParser.urlencoded({
    extended: false,
  }),
  async (req, res) => {
    const {
      username,
      password
    } = req.body;
    const user = await findUserByUsername(username, req.db);
    if (!user || user.password !== hash(password)) {
      return res.redirect("/?authError=true");
    }

    const sessionId = await createSession(user._id, req.db);
    res
      .cookie("sessionId", sessionId.toString(), {
        httpOnly: true,
      })
      .cookie("userId", user._id.toString(), {
        httpOnly: true,
      })
      .redirect("/");
  }
);

router.post(
  "/signup",
  bodyParser.urlencoded({
    extended: true,
  }),
  async (req, res) => {
    try {
      const {
        username,
        password
      } = req.body;
      if (await findUserByUsername(username, req.db)) {
        return res.redirect("/?signupError=true");
      }
      const createdUserId = await createUser(username, hash(password), req.db);
      const user = await findUserById(createdUserId, req.db)
      const sessionId = await createSession(user._id, req.db);
      res
        .cookie("sessionId", sessionId.toString(), {
          httpOnly: true,
        })
        .cookie("userId", user._id.toString(), {
          httpOnly: true,
        })
        .redirect("/");
    } catch (error) {
      console.error(error)
    }

  }
);
router.get("/logout", auth(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  await deleteSession(req.cookies["sessionId"], req.db);
  res.clearCookie("sessionId").clearCookie("userId").redirect("/");
});



const hash = (password) => {
  return crypto.createHmac("sha256", password).update("Hello world").digest("hex");
};

module.exports = router
