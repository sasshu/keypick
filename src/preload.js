const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  toggleDarkmode: () => ipcRenderer.invoke("toggle-darkmode"),
  generateId: (type) => ipcRenderer.invoke("generate-id", type),
  passKeyGroupIndex: (index) => ipcRenderer.invoke("pass-keyGroupIndex", index),
  recieveKeyGroupIndex: () => ipcRenderer.invoke("recieve-keyGroupIndex"),
});

// electron-store
contextBridge.exposeInMainWorld("store", {
  set: (key, value) => ipcRenderer.invoke("set-store", key, value),
  get: (key) => ipcRenderer.invoke("get-value", key),
  delete: (key) => ipcRenderer.invoke("delete-value", key),
});
