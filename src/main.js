const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeTheme,
} = require("electron");
const path = require("node:path");
const Store = require("electron-store");

require("electron-reload")(__dirname, {
  electron: require("${__dirname}/../../node_modules/electron"),
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    title: "keypick",
    webPreferences: {
      // contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // ファイルアップロード
  ipcMain.handle("open-dialog", async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
      })
      .then((result) => {
        if (result.canceled) return "";
        return result.filePaths[0];
      });
  });

  // テーマカラーの設定
  ipcMain.handle("toggle-darkmode", () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors
      ? "light"
      : "dark";
  });

  // 起動時にchromeデベロッパーツールを開く
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("src/index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
