const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // openDialog: () => ipcRenderer.invoke("open-dialog"),
  toggleDarkmode: () => ipcRenderer.invoke("toggle-darkmode"),
  openDetail: (title) => ipcRenderer.invoke("open-detail", title),
});

contextBridge.exposeInMainWorld("store", {
  set: (key, value) => ipcRenderer.invoke("set-store", key, value),
  get: (key) => ipcRenderer.invoke("get-value", key),
  delete: (key) => ipcRenderer.invoke("delete-value", key),
});
