window.addEventListener("DOMContentLoaded", () => {
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

  // キーグループを追加
  const keygroupAddButton = document.querySelector("#keygroup-add-button");
  keygroupAddButton.addEventListener("click", window.api.addKeygroup);

  // キー詳細ページへ遷移
  const keyDetailButtons = document.querySelectorAll(".key-detail-button");
  keyDetailButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      window.api.setTitle(button.textContent);
      location.href = "../detail/detail.html";
    });
  });

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);
});
