window.addEventListener("DOMContentLoaded", async () => {
  // electron-store
  // 値を保存
  setStore = (key, value) => {
    window.store.set(key, value);
  };
  // 保存された値を取得
  getValue = async (key) => {
    return window.store.get(key);
  };
  // 保存された値を削除
  deleteValue = (key) => {
    window.store.delete(key);
  };

  document.querySelector("#key-group-title").textContent =
    await window.api.getTitle();

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-buttons");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);
});
