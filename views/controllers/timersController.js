const {
    ObjectId
  } = require("mongodb");
const createTimer = async (fields, db) => {

    const newTimerId = (await db.collection('timers').insertOne({
        start: new Date(),
        end: 0,
        user_id: ObjectId(fields.userID),
        description: fields.description,
        isActive: true
    })).insertedId;

    const newTimer = await db.collection('timers').findOne({
        _id: newTimerId
    }, {
        description: 1,
    });
    console.log(newTimer)
    return newTimer

};
const stopTimer = async (tId, uid, db) => {
    const id = await db.collection('timers').updateOne({
        _id: ObjectId(tId),
        user_id: ObjectId(uid)
    }, {
        $set: {
            isActive: false,
            end: new Date()
        }
    });
};

const getAllTimers = async (uid, isActive, db) => {
    //if IsActive '' or null return all timers, else return active | old
    const options = typeof isActive == 'boolean' ? {user_id: ObjectId(uid), isActive: isActive} : {user_id: ObjectId(uid)} 
    try {
        const result = await db.collection('timers').
        find(options).project({
            isActive: 1,
            description: 1,
            start: 1,
            end: 1
        }).toArray();
        return result
    } catch (error) {
        console.error(error);
    }
}
const getAllActiveTimers = async (uid, db, done)=>{
    const timers = await getAllTimers(uid, true, db);
    if(!timers.length){
        done ? done({timers: [], uid: uid}) : null
    }
    const Atimers = timers.map(timer => {
        timer.progress = convertUTCDateToLocalDate(new Date()).getTime() - convertUTCDateToLocalDate(timer.start).getTime();
        timer._id = timer._id.toString()
        return timer
      })
    done ? done({timers: Atimers, uid: uid}) : null
}
const getAllInActiveTimers = async(uid, db, done)=>{
    const timers = await getAllTimers(uid, false, db)
    if(!timers.length){
        done ? done({timers: [], uid: uid}) : null
    }
    const Otimers = timers.map(timer => {
        timer.duration = convertUTCDateToLocalDate(timer.end).getTime() - convertUTCDateToLocalDate(timer.start).getTime();
        timer._id = timer._id.toString()
        return timer
      })
      done ? done({timers: Otimers, uid: uid}) : null
}
function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
}

module.exports = {createTimer, convertUTCDateToLocalDate, 
    getAllTimers, getAllActiveTimers, getAllInActiveTimers,stopTimer}