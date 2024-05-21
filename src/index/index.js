import Drag from "../utility/dragging.js";

window.addEventListener("DOMContentLoaded", async () => {
  /** @type {Object[]} */
  let keyGroups = await window.store.get("keygroups");
  console.log(keyGroups);
  const dropZoneHtml = "<div class='key-drop-zone pt-3'></div>";
  buildKeyGroupsHtml(keyGroups);

  // ダークモードの切り替え
  /** @type {HTMLElement} */
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.onclick = window.api.toggleDarkmode;

  // キー詳細ページへ遷移
  /** @type {HTMLElement[]} */
  const keyDetailButtons = document.querySelectorAll(".key-detail-button");
  keyDetailButtons.forEach((button) => {
    button.onclick = () => {
      const keyGroupIndex = keyGroups.findIndex(
        (group) => group.id == button.name
      );
      window.api.passKeyGroupIndex(keyGroupIndex);
      location.href = "../detail/detail.html";
    };
  });

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
  /** @type {HTMLElement} */
  const keyGroupAddButton = document.querySelector("#key-group-add-button");
  keyGroupAddButton.onclick = async () => {
    keyGroups.push({
      id: await window.api.generateId("group"),
      name: "",
      keys: [
        {
          id: await window.api.generateId("key"),
          name: "",
          value: "",
          isVisible: true,
        },
      ],
    });
    await window.store.set("keygroups", keyGroups);

    window.api.passKeyGroupIndex(keyGroups.length - 1);
    location.href = "../detail/detail.html";
  };

  /**
   * リストページのHTML全体を作成
   * @param {{
   * id: string,
   * name: string,
   * keys: {
   * id: string,
   * name: string,
   * value: string,
   * isVisible: boolean,
   * }[]
   * }[]} keyGroups キーグループリスト
   */
  function buildKeyGroupsHtml(keyGroups) {
    const keyGroupsHtmls = [];
    keyGroups.forEach((keyGroup, index) => {
      keyGroupsHtmls.push(`
        ${dropZoneHtml}
        <li class="border-b-2 key-group" draggable="true">
          <button class="key-detail-button hover:opacity-50 w-full text-left"
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
