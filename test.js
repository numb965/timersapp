const { ObjectId } = require('mongodb');

var url = "mongodb+srv://numb965:utJHa9jFHpnthkz7@cluster0.38dcnxq.mongodb.net/https://data.mongodb-api.com/app/data-wbjko/endpoint/data/v1/timerusers";
var MongoClient = require('mongodb').MongoClient;

const clientPromise = MongoClient.connect(url, {
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function start(){
    db = await clientPromise;
    // const id = (await db.db('timerusers').collection('timers').insertOne({date: new Date(), isActive: false, description: "world"})).insertedId;
  //   const cursor = await db.db('timerusers').collection('timers').deleteMany()
  //   t1 = await db.db('timerusers').collection('users').deleteMany()
  //   t2 = await db.db('timerusers').collection('sessions').deleteMany()
  //  console.log(cursor, t1, t2)
  const res = await db.db('timerusers').collection('timers').deleteMany()
  // const res = await db.db('timerusers').collection('timers').find({userId: ObjectId('63a959204dd639de163c11d0')}).toArray()
  // const res = await db.db('timerusers').collection('timers').find({isActive: true, user_id: ObjectId('63a959204dd639de163c11d0')}).toArray()
  // console.log(res);
  // const res = await db.db('timerusers').collection('users').find({}).toArray()
  console.log(res);
  
}
start() 
