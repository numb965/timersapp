require("dotenv").config();
const {
    WebSocketServer
} = require('ws')
const {
    getAllTimers,
    getAllActiveTimers,
    getAllInActiveTimers
} = require('./controllers/timersController')
class TimerWss extends WebSocketServer {
     constructor(wssProps, dbClient) {
        super(wssProps)
        this.tickID = undefined
        this.clientsTimers = new Map()
        this.dbClient = dbClient

        this.on('init', () => {
            this.tickID = setInterval(() => {
                
                Promise.all(Array.from(this.clientsTimers).map(([uid, client]) =>{
                    
                    return new Promise(async (res)=>{
                        getAllActiveTimers(uid, (await this.dbClient).db(process.env.MONGODB), res)
                    })
                })).then((data)=>{
                    data.map(({timers, uid})=>{
                        const client = this.clientsTimers.get(uid)
                        client ? client.send(JSON.stringify({message: "active_timers", timers: timers})) : null
                    })
                })
            }, 1000)
        })
        this.on('stop', () => {
            clearInterval(this.tickID)
            this.tickID = undefined
        })
        this.on('connect', async (ws, req) => {
            const {
                userId
            } = req
            this.clientsTimers.set(userId, ws)

            ws.on('message', (data) => {
                const {message} = JSON.parse(data)
                switch(message){
                    case "update" : ws.emit('giveTimers', ws, userId);
                }
            })
            ws.on('close', () => {
                this.clientsTimers.delete(userId)
                if (!this.clientsTimers.size) {
                    this.emit('stop')
                }
            })
            ws.on('giveTimers', async (ws, uid) => {
                    Promise.all([
                        new Promise(async (res)=>{
                            getAllActiveTimers(uid, (await this.dbClient).db(process.env.MONGODB), res)
                        }),
                        new Promise(async (res)=>{
                            getAllInActiveTimers(uid,(await this.dbClient).db(process.env.MONGODB), res)
                        })
                    ]).then(data=>{
                        const timers = []
                        data.forEach(el=>timers.push(...el.timers))
                        ws.timers = timers
                        console.log("from giveTimers: ", timers);
                        ws.send(JSON.stringify({message: "all_timers", timers: timers}))
                    })
            
            })
            ws.on('close', () => {
                this.clientsTimers.delete(userId)
            }) 
            !ws.timers ? ws.emit('giveTimers', ws, userId) : null;
            !this.tickID && this.clientsTimers.size ? this.emit('init') : null;

        })
    }
}

module.exports = {
    TimerWss
}

