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

  const store = new Store();

  // ファイルアップロード
  // ipcMain.handle("open-dialog", async (event) => {
  //   return dialog
  //     .showOpenDialog(mainWindow, {
  //       properties: ["openFile"],
  //     })
  //     .then((result) => {
  //       if (result.canceled) return "";
  //       return result.filePaths[0];
  //     });
  // });

  // テーマカラーの設定
  if (store.has("theme")) {
    nativeTheme.themeSource = store.get("theme");
  } else {
    nativeTheme.themeSource = "system";
  }
  ipcMain.handle("toggle-darkmode", (event) => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors
      ? "light"
      : "dark";
    store.set("theme", nativeTheme.themeSource);
  });

  // electron-store
  ipcMain.handle("set-store", (event, key, value) => {
    store.set(key, value);
  });
  ipcMain.handle("get-value", async (event, key) => {
    return store.get(key);
  });
  ipcMain.handle("delete-value", (event, key) => {
    store.delete(key);
  });

  // キー詳細ページへ遷移
  ipcMain.handle("open-detail", (event, title) => {
    return title;
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
