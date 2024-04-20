const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  toggleDarkmode: () => ipcRenderer.invoke("toggle-darkmode"),
  // openDetail: (title) => ipcRenderer.invoke("open-detail", title),
  addKeygroup: () => ipcRenderer.invoke("add-keygroup"),
  setTitle: (title) => ipcRenderer.invoke("set-title", title),
  getTitle: () => ipcRenderer.invoke("get-title"),
});

// electron-store
contextBridge.exposeInMainWorld("store", {
  set: (key, value) => ipcRenderer.invoke("set-store", key, value),
  get: (key) => ipcRenderer.invoke("get-value", key),
  delete: (key) => ipcRenderer.invoke("delete-value", key),
});
