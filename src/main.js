const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("node:path");
const Store = require("electron-store");

// require("electron-reload")(__dirname, {
//   electron: require(path.resolve("${__dirname}/../node_modules/electron")),
// });

const store = new Store({
  defaults: {
    window: {
      x: undefined,
      y: undefined,
      width: 750,
      height: 500,
    },
  },
});

let keyGroupIndex;

// テーマカラーの設定
if (store.has("theme")) {
  nativeTheme.themeSource = store.get("theme");
} else {
  nativeTheme.themeSource = "system";
}
ipcMain.handle("toggle-darkmode", (event) => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? "light" : "dark";
  store.set("theme", nativeTheme.themeSource);
});

// electron-store
ipcMain.handle("set-store", (event, key, value) => {
  store.set(key, value);
});
ipcMain.handle("get-value", (event, key) => {
  return store.get(key);
});
ipcMain.handle("delete-value", (event, key) => {
  store.delete(key);
});

// キーグループ
ipcMain.handle("pass-keyGroupIndex", (event, index) => {
  keyGroupIndex = index;
});
ipcMain.handle("recieve-keyGroupIndex", (event) => {
  return keyGroupIndex;
});

ipcMain.handle("generate-id", (event, type) => {
  const dt = new Date();
  const year = dt.getFullYear();
  const month = ("0" + (dt.getMonth() + 1)).slice(-2);
  const date = ("0" + dt.getDate()).slice(-2);
  const hour = ("0" + dt.getHours()).slice(-2);
  const minute = ("0" + dt.getMinutes()).slice(-2);
  const second = ("0" + dt.getSeconds()).slice(-2);
  const millisecond = ("000" + dt.getMilliseconds()).slice(-4);

  return `${type}${year}${month}${date}${hour}${minute}${second}${millisecond}`;
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: store.get("window.x"),
    y: store.get("window.y"),
    width: store.get("window.width"),
    height: store.get("window.height"),
    title: "keypick",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 起動時にchromeデベロッパーツールを開く
  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile("src/window/list/list.html");

  mainWindow.once("close", () => {
    const { x, y, width, height } = mainWindow.getBounds();
    store.set("window", { x, y, width, height });
  });
};

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion:
    process.platform === "darwin"
      ? app.getVersion()
      : `v${app.getVersion()} (electron@${process.versions["electron"]})`,
  copyright: "Copyright 2024 sasshu",
  version: `electron@${process.versions["electron"]}`,
  iconPath: path.join(__dirname, "/../asset/icon/app.png"),
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
