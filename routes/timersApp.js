const express = require("express");
const router = express.Router();

const {getAllTimers, convertUTCDateToLocalDate, createTimer, stopTimer} = require("../controllers/timersController")

router.get("/", async (req, res) => {

  try {
    const timers = await getAllTimers(req.cookies["userId"], req.query.isActive, req.db);
    if (req.query.isActive) {
      const Atimers = timers.map(timer => {
        timer.progress = convertUTCDateToLocalDate(new Date()).getTime() - convertUTCDateToLocalDate(timer.start).getTime();
        timer._id = timer._id.toString()
        return timer
      })
      res.json(Atimers);
    } else {
      const Otimers = timers.map(timer => {
        timer.duration = convertUTCDateToLocalDate(timer.end).getTime() - convertUTCDateToLocalDate(timer.start).getTime();
        timer._id = timer._id.toString()
        return timer
      })
      res.json(Otimers);
    }
  } catch (error) {
    console.error(error)
  }


});

router.post("/", async (req, res) => {
  const newTimer = await createTimer({
    description: req.body.description,
    userID: req.cookies["userId"],
  }, req.db);

  res.status(200).json({
    id: newTimer._id.toString(),
    description: newTimer.description,
  });
});

router.post("/:id/stop", async (req, res) => {

  const stopedTimer = await stopTimer(req.params.id, req.cookies["userId"], req.db);
  res.status(200).json(req.params.id);
});
module.exports = router
