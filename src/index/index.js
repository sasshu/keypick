import Drag from "../utility/dragging.js";

window.addEventListener("DOMContentLoaded", async () => {
  let keyGroups = await window.store.get("keygroups");
  console.log(keyGroups);
  const dropZoneHtml = "<div class='key-drop-zone py-1'></div>";
  buildKeyGroupsHtml(keyGroups);

  // ドラッグイベントの登録
  const drag = new Drag(
    document.querySelectorAll(".key-group"),
    document.querySelectorAll(".key-drop-zone")
  );

  drag.setProcessAfterDrop(() => {
    // querySelectorAll()で取得できるのはNodeListなので、Arrayに変換する
    const orderedKeyGroupIdList = Array.from(
      document.querySelectorAll(".key-detail-button"),
      (button) => button.name
    );

    // データ順を変更
    const newKeyGroups = [];
    orderedKeyGroupIdList.forEach((id) => {
      const newKeyGroup = keyGroups.find((keyGroup) => keyGroup.id == id);
      newKeyGroups.push(newKeyGroup);
    });
    keyGroups = structuredClone(newKeyGroups);
    window.store.set("keygroups", keyGroups);
  });

  // キーグループを追加
  const keyGroupAddButton = document.querySelector("#keygroup-add-button");
  keyGroupAddButton.addEventListener("click", window.api.addKeyGroup);

  // キー詳細ページへ遷移
  const keyDetailButtons = document.querySelectorAll(".key-detail-button");
  keyDetailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const keyGroupIndex = keyGroups.findIndex(
        (group) => group.id == button.name
      );
      window.api.passKeyGroupIndex(keyGroupIndex);
      location.href = "../detail/detail.html";
    });
  });

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);

  // キーグループのリストを表示
  function buildKeyGroupsHtml(keyGroups) {
    const keyGroupsHtmls = [];
    keyGroups.forEach((keyGroup, index) => {
      keyGroupsHtmls.push(`
        ${dropZoneHtml}
        <li class="border-b-2 pt-2 key-group" draggable="true">
          <button class="key-detail-button hover:opacity-50"
            name="${keyGroup.id}">
            ${keyGroup.name}
          </button>
        </li>
        ${index === keyGroups.length - 1 ? dropZoneHtml : ""}
      `);
    });

    const keyGroupsWrapper = document.querySelector("#key-group-list");
    keyGroupsWrapper.innerHTML = keyGroupsHtmls.join("");
  }
});
