const {
    ObjectId
  } = require("mongodb");
  
  
  const createUser = async (uName, pass, db) => {
    try {
      const createdUser = await db.collection('users').insertOne({
        username: uName,
        password: pass
      })
      return createdUser.insertedId
    } catch (error) {
      console.error(error)
    }
  
  };
  const findUserById = async (user_id, db) => {
    try {
      const user = await db.collection('users').findOne({
        _id: user_id
      });
      return user
    } catch (error) {
      console.error(error)
    }
  }
  const findUserByUsername = async (uName, db) => {
    try {
      const user = await db.collection('users').findOne({
        username: uName
      });
      return user
    } catch (error) {
      console.error(error)
    }
  
  };
  
  const findUserBySessionId = async (sessionId, db) => {
    try {
      const user_id = (await db.collection('sessions').findOne({
        _id: ObjectId(sessionId)
      })).user_id;
      const user = await db.collection('users').findOne({
        _id: user_id
      });
      return user
    } catch (error) {
      console.error(error)
    }
  };
  
  const createSession = async (userId, db) => {
  
    try {
      const session = {
        user_id: userId
      };
  
      const sessionId = (await db.collection("sessions").insertOne(session)).insertedId;
      return sessionId
    } catch (error) {
      console.error(error)
    }
  };
  
  const deleteSession = async (sessionId, db) => {
    try {
      const result = await db.collection('sessions').deleteOne({
        _id: ObjectId(sessionId)
      });
    } catch (error) {
      console.error(error)
    }
  
  };

  module.exports = {createUser, createSession, deleteSession, findUserBySessionId, findUserByUsername, findUserById}