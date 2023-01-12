/*global UIkit, Vue */

(() => {
  const notification = (config) =>
    UIkit.notification({
      pos: "top-right",
      timeout: 5000,
      ...config,
    });

  const alert = (message) =>
    notification({
      message,
      status: "danger",
    });

  const info = (message) =>
    notification({
      message,
      status: "success",
    });

  const fetchJson = (...args) =>
    fetch(...args)
    .then((res) =>
      res.ok ?
      res.status !== 204 ?
      res.json() :
      null :
      res.text().then((text) => {
        throw new Error(text);
      })
    )
    .catch((err) => {
      alert(err.message);
    });

  new Vue({
    el: "#app",
    data: {
      desc: "",
      activeTimers: [],
      oldTimers: [],
      connection: null
    },
    methods: {
      createTimer() {
        const description = this.desc;
        this.desc = "";
        fetchJson("/api/timers", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
          }),
        }).then((timer) => {
          info(`Created new timer "${timer.description}" [${timer.id}]`);
          this.connection.send(JSON.stringify({message: 'update'}))
        });
      },
      openConnection(){
        try {
          this.connection = new WebSocket(`ws://${location.host}`)
          this.connection.onopen = function (event) {
            console.log('Connection started');

          }
          this.connection.onmessage = (data)=>{
            const {
              message,
              timers
            } = JSON.parse(data.data)
            if(message == "all_timers"){
              this.activeTimers = timers.filter(timer=>timer.isActive)
              this.oldTimers = timers.filter(timer=>!timer.isActive)
              return
            }
            else if(message == "active_timers"){
              this.activeTimers = timers
              return
            }
            
            
          }
          this.connection.onerror = function (err) {
            console.log(err);
          }
          this.connection.onclose = function (event) {
            console.log("Connection closed");
          }
        } catch (error) {
          console.log(error);
        }

      },
      stopTimer(id) {
        fetchJson(`/api/timers/${id}/stop`, {
          method: "post",
        }).then((stoped) => {
          info(`Stopped the timer [${stoped}]`);
          this.connection.send(JSON.stringify({message: 'update'}))
        });
      },
      formatTime(ts) {
        return new Date(ts).toTimeString().split(" ")[0];
      },
      formatDuration(d) {
        d = Math.floor(d / 1000);
        const s = d % 60;
        d = Math.floor(d / 60);
        const m = d % 60;
        const h = Math.floor(d / 60);
        return [h > 0 ? h : null, m, s]
          .filter((x) => x !== null)
          .map((x) => (x < 10 ? "0" : "") + x)
          .join(":");
      },
    },
    created() {
      this.openConnection()
    },
  });
})();