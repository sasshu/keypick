const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openDialog: () => ipcRenderer.invoke("open-dialog"),
  toggleDarkmode: () => ipcRenderer.invoke("toggle-darkmode"),
});
