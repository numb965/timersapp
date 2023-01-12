module.exports = {
  async up(db, client) {
    await db.collection('timers').aggregate([
      {$match: {isActive: false}},
      {$group: {_id: "$user_id", averageDuration: {$avg: {$subtract:["$end", "$start"]}}}},
      { $merge : { into: { db: "timerusers", coll: "users" }, on: "_id"}}
    ]).toArray()
  },

  async down(db, client) {
    await db.collection('users').updateMany({},{
      $unset: {averageDuration: ""}
    })
  }
};
