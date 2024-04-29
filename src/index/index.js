// キーグループのリストを表示
buildKeygroupsHtml = (keygroups) => {
  const keygroupsHtmls = [];
  for (const keygroup of keygroups) {
    keygroupsHtmls.push(`
      <li class="border-b-2 pt-2">
        <button class="key-detail-button hover:opacity-50" name="${keygroup.id}">${keygroup.name}</button>
      </li>`);
  }

  const keygroupsWrapper = document.querySelector("#key-group-list");
  keygroupsWrapper.innerHTML = keygroupsHtmls.join("");
};

window.addEventListener("DOMContentLoaded", async () => {
  const keygroups = await window.store.get("keygroups");
  console.log(keygroups);
  buildKeygroupsHtml(keygroups);

  // キーグループを追加
  const keygroupAddButton = document.querySelector("#keygroup-add-button");
  keygroupAddButton.addEventListener("click", window.api.addKeygroup);

  // キー詳細ページへ遷移
  const keyDetailButtons = document.querySelectorAll(".key-detail-button");
  keyDetailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const keygroupIndex = keygroups.findIndex(
        (group) => group.id == button.name
      );
      window.api.passKeyGroupIndex(keygroupIndex);
      location.href = "../detail/detail.html";
    });
  });

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);
});
