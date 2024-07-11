import ws from "ws";
import { app, BrowserWindow, Menu } from "electron";

let red: string = "#ff0000";
let white: string = "#ffffff";
let micMuteStatusA: boolean = false;
let micMuteStatusB: boolean = false;
let randId = Math.floor(Math.random() * 4294967295);

let serialNumber: string;

let config: boolean = false;

async function createWindow(): Promise<void> {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  async function unmuted(channel: string) {
    if (channel == "A") {
      micMuteStatusA = true;
      win.webContents.executeJavaScript(
        `
            document.getElementById("titleA").textContent = "LIVE";
            document.getElementById("noticeA").textContent = "MIC";
            document.getElementById("titleA").classList.add("text-white");
            document.getElementById("noticeA").classList.add("text-white");
            document.getElementById("titleA").classList.add("text-8xl");
            document.getElementById("titleA").classList.remove("text-4xl");
            document.getElementById("cA").classList.remove("bg-white");
            document.getElementById("cA").classList.add("bg-red-500");
            `
      );
    } else {
      micMuteStatusB = true;
      win.webContents.executeJavaScript(
        `
            document.getElementById("titleB").textContent = "LIVE";
            document.getElementById("noticeB").textContent = "DISCORD VC";
            document.getElementById("titleB").classList.add("text-white");
            document.getElementById("noticeB").classList.add("text-white");
            document.getElementById("titleB").classList.add("text-8xl");
            document.getElementById("titleB").classList.remove("text-4xl");
            document.getElementById("cB").classList.remove("bg-white");
            document.getElementById("cB").classList.add("bg-red-500");
            `
      );
    }
  }

  async function disconnected() {
    win.setBackgroundColor(white);
    win.webContents.executeJavaScript(
      `
            document.getElementById("titleA").textContent = "No GoXLR connected";
            document.getElementById("noticeA").classList.remove("hidden");
            document.getElementById("noticeA").textContent = "No GoXLR detected... try plugging it in";
            document.getElementById("titleA").classList.remove("text-white");
            document.getElementById("titleA").classList.add("text-4xl");
            document.getElementById("titleA").classList.remove("text-8xl");
            document.getElementById("titleB").textContent = "No GoXLR connected";
            document.getElementById("noticeB").classList.remove("hidden");
            document.getElementById("noticeB").textContent = "No GoXLR detected... try plugging it in";
            document.getElementById("titleB").classList.remove("text-white");
            document.getElementById("titleB").classList.add("text-4xl");
            document.getElementById("titleB").classList.remove("text-8xl");
            document.getElementById("cA").classList.remove("bg-red-500");
            document.getElementById("cA").classList.add("bg-white");
            document.getElementById("cB").classList.remove("bg-red-500");
            document.getElementById("cB").classList.add("bg-white");
            `
    );
  }

  async function muted(channel: string) {
    if (channel == "A") {
      micMuteStatusA = false;
      win.webContents.executeJavaScript(
        `
            document.getElementById("noticeA").textContent = "MIC";
            document.getElementById("titleA").textContent = "Muted";
            document.getElementById("noticeA").classList.remove("text-white");
            document.getElementById("titleA").classList.remove("text-white");
            document.getElementById("titleA").classList.add("text-4xl");
            document.getElementById("titleA").classList.remove("text-8xl");
            document.getElementById("cA").classList.add("bg-white");
            document.getElementById("cA").classList.remove("bg-red-500");
            `
      );
    } else if (channel == "B") {
      micMuteStatusB = false;
      win.webContents.executeJavaScript(
        `
            document.getElementById("noticeB").textContent = "DISCORD VC";
            document.getElementById("titleB").textContent = "Muted";
            document.getElementById("noticeB").classList.remove("text-white");
            document.getElementById("titleB").classList.remove("text-white");
            document.getElementById("titleB").classList.add("text-4xl");
            document.getElementById("titleB").classList.remove("text-8xl");
            document.getElementById("cB").classList.remove("bg-red-500");
            document.getElementById("cB").classList.add("bg-white");
            `
      );
    }
  }

  win.loadFile("dist/index.html");
  win.setMenu(null);

  const socket = await new ws("ws://localhost:14564/api/websocket");

  socket.onopen = () => {
    console.log("Connected to websocket");

    socket.send(
      JSON.stringify({
        id: randId,
        data: "GetStatus",
      })
    );
  };

  socket.onmessage = (message: any) => {
    const json = JSON.parse(message.data);

    console.log(json.data);

    if (json.id == randId) {
      const keys = Object.keys(json.data.Status.mixers);

      if (keys.length == 0) {
        disconnected();
        return "No GoXLR detected... try plugging it in";
      } else {
        serialNumber = keys[0];
        config = true;
      }

      if (
        json.data.Status.mixers[serialNumber].fader_status.A.mute_state ==
        "Unmuted"
      ) {
        console.log("A unmuted");
        unmuted("A");
      } else {
        console.log("A muted");
        muted("A");
      }
      if (
        json.data.Status.mixers[serialNumber].fader_status.B.mute_state ==
        "Unmuted"
      ) {
        console.log("B unmuted");
        unmuted("B");
      } else {
        console.log("B muted");
        muted("B");
      }

      return;
    }

    if (
      json.data.Patch[0].op == "add" &&
      json.data.Patch[0].path.includes("mixers")
    ) {
      console.log("New GoXLR detected");
      config = false;
      serialNumber = "";
      socket.send(
        JSON.stringify({
          id: randId,
          data: "GetStatus",
        })
      );
      return;
    }

    if (
      json.data.Patch[0].op == "remove" &&
      json.data.Patch[0].path.includes("mixers")
    ) {
      console.log("GoXLR disconnected");
      disconnected();
      return;
    }

    if (json.data.Patch == undefined) {
      return;
    }

    if (config == false) {
      return;
    }

    var i: number;
    for (i = 0; i < json.data.Patch.length; i++) {
      if (
        json.data.Patch[i].path ==
        `/mixers/${serialNumber}/fader_status/B/mute_state`
      ) {
        if (json.data.Patch[i].value == "Unmuted") {
          console.log("B unmuted");
          unmuted("B");
        } else {
          console.log("B muted");
          muted("B");
        }
      }
      if (
        json.data.Patch[i].path ==
        `/mixers/${serialNumber}/fader_status/A/mute_state`
      ) {
        if (json.data.Patch[i].value == "Unmuted") {
          console.log("A unmuted");
          unmuted("A");
        } else {
          console.log("A muted");
          muted("A");
        }
      }
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from websocket");
    process.exit(1);
  };

  socket.onerror = (error: any) => {
    console.error(`WebSocket error, disconnected`);
    console.error(error);
    process.exit(1);
  };
}

app.on("ready", async () => {
  await createWindow();
});
