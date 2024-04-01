import ws from "ws";
import { app, BrowserWindow, Menu } from "electron";

let red: string = "#ff0000";
let white: string = "#ffffff";
let micMuteStatus: boolean = false;
let randId = Math.floor(Math.random() * 4294967295);

let serialNumber: string;

let config: boolean = false;

async function createWindow(): Promise<void> {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  async function unmuted() {
    micMuteStatus = true;
    win.setBackgroundColor(red);
    win.webContents.executeJavaScript(
      `
            document.getElementById("title").textContent = "LIVE";
            document.getElementById("title").classList.add("text-white");
            document.getElementById("title").classList.add("text-8xl");
            document.getElementById("title").classList.remove("text-4xl");
            `
    );
  }

  async function muted() {
    micMuteStatus = false;
    win.setBackgroundColor(white);
    win.webContents.executeJavaScript(
      `
            document.getElementById("title").textContent = "Muted";
            document.getElementById("title").classList.remove("text-white");
            document.getElementById("title").classList.add("text-4xl");
            document.getElementById("title").classList.remove("text-8xl");
            `
    );
  }

  async function hideText() {
    win.webContents.executeJavaScript(
      'document.getElementById("notice").classList.add("hidden");'
    );
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

    if (json.id == randId) {
      const keys = Object.keys(json.data.Status.mixers);

      if (keys.length == 0) {
        return;
      } else {
        serialNumber = keys[0];
        config = true;
      }

      if (
        json.data.Status.mixers[serialNumber].fader_status.A.mute_state ==
        "Unmuted"
      ) {
        hideText();
        unmuted();
      } else {
        hideText();
        muted();
      }

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
        `/mixers/${serialNumber}/fader_status/A/mute_state`
      ) {
        hideText();
        if (json.data.Patch[i].value == "Unmuted") {
          unmuted();
        } else {
          muted();
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
    process.exit(1);
  };
}

app.on("ready", async () => {
  await createWindow();
});
