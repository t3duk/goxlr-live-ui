import ws from "ws";
import { app, BrowserWindow, Menu } from "electron";

var micMuteStatus: boolean;

let red: string = "#ff0000";
let white: string = "#ffffff";

function createWindow(): void {
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

  win.loadFile("dist/index.html");
  win.setMenu(null);

  const socket = new ws("ws://localhost:14564/api/websocket");

  socket.onopen = () => {
    console.log("Connected to websocket");
  };

  socket.onmessage = (message: any) => {
    const json = JSON.parse(message.data);
    var i: number;
    for (i = 0; i < json.data.Patch.length; i++) {
      if (
        json.data.Patch[i].path ==
        "/mixers/S210500771CQK/fader_status/A/mute_state"
      ) {
        win.webContents.executeJavaScript(
          'document.getElementById("notice").classList.add("hidden");'
        );
        if (json.data.Patch[i].value == "Unmuted") {
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
        } else {
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
      }
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from websocket");
  };

  socket.onerror = (error: any) => {
    console.error("Websocket error: ", error);
  };
}

app.on("ready", () => {
  Menu.setApplicationMenu(null);

  createWindow();
});
