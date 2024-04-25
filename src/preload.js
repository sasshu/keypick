const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  toggleDarkmode: () => ipcRenderer.invoke("toggle-darkmode"),
  addKeygroup: () => ipcRenderer.invoke("add-keygroup"),
  passKeygroup: (id) => ipcRenderer.invoke("pass-keygroup", id),
  recieveKeygroup: () => ipcRenderer.invoke("recieve-keygroup"),
});

// electron-store
contextBridge.exposeInMainWorld("store", {
  set: (key, value) => ipcRenderer.invoke("set-store", key, value),
  get: (key) => ipcRenderer.invoke("get-value", key),
  delete: (key) => ipcRenderer.invoke("delete-value", key),
});
