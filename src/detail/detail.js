// electron-store
// 値を保存
// setStore = (key, value) => {
//   window.store.set(key, value);
// };
// // 保存された値を取得
// getValue = async (key) => {
//   return window.store.get(key);
// };
// // 保存された値を削除
// deleteValue = (key) => {
//   window.store.delete(key);
// };

window.addEventListener("DOMContentLoaded", async () => {
  const keygroup = await window.api.recieveKeygroup();
  console.log(keygroup);
  document.querySelector("#key-group-title").textContent = keygroup.name;

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);

  // ホームに戻る
  const backButton = document.querySelector("#back-button");
  backButton.addEventListener("click", () => {
    location.href = "../index/index.html";
  });
});
