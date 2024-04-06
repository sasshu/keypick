window.addEventListener("DOMContentLoaded", () => {
  // const button = document.getElementById("button");
  // const text = document.getElementById("text");
  // button.addEventListener("click", async () => {
  //   text.textContent = await window.api.openDialog();

  //   console.log(await getValue("unicorn"));
  // });

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

  const keyAddButton = document.querySelector(".key-add-button");

  // キー詳細ページへ遷移
  const keyDetailButtons = document.querySelectorAll(".key-detail-button");
  keyDetailButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      console.log(await window.api.openDetail(button.textContent));
    });
  });

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);
});
