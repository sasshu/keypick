window.addEventListener("DOMContentLoaded", async () => {
  let keyGroups = await window.store.get("keygroups");
  console.log(keyGroups);
  let draggedElement;
  const dropZoneHtml = "<div class='key-drop-zone py-1'></div>";
  buildKeyGroupsHtml(keyGroups);

  // キーグループの順序入れ替え
  const keyElements = document.querySelectorAll(".key-group");
  keyElements.forEach((keyElement) => {
    // ドラッグが開始したときに発生
    keyElement.addEventListener("dragstart", (event) => {
      draggedElement = event.target;
      event.dataTransfer.effectAllowed = "move";
    });
  });

  const dropZones = document.querySelectorAll(".key-drop-zone");
  dropZones.forEach((dropZone) => {
    registerDragAndDropEvent(dropZone);
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

  function registerDragAndDropEvent(dropZone) {
    addEventToDragOver(dropZone);
    addEventToDragLeave(dropZone);
    addEventToDrop(dropZone);
  }

  function addEventToDragOver(dropZone) {
    // ドラッグ要素がターゲットの上にあるときに発生
    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        draggedElement.previousElementSibling !== dropZone &&
        draggedElement.nextElementSibling !== dropZone
      ) {
        event.target.classList.remove("py-1");
        event.target.classList.add("py-3");
      }
    });
  }

  function addEventToDragLeave(dropZone) {
    // ドラッグ要素がターゲットの上から離れたときに発生
    dropZone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        draggedElement.previousElementSibling !== event.target &&
        draggedElement.nextElementSibling !== event.target
      ) {
        event.target.classList.remove("py-3");
        event.target.classList.add("py-1");
      }
    });
  }

  function addEventToDrop(dropZone) {
    // ドラッグ要素がドロップされたときに発生
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        draggedElement.previousElementSibling !== event.target &&
        draggedElement.nextElementSibling !== event.target
      ) {
        event.target.classList.remove("py-3");
        event.target.classList.add("py-1");

        const draggedParent = draggedElement.parentNode;
        const keyGroupsWrapper = document.querySelector("#key-group-list");
        // 元の場所から削除
        draggedParent.removeChild(draggedElement.previousElementSibling);
        // 移動先に追加
        const newDropZone = event.target.cloneNode();
        keyGroupsWrapper.insertBefore(draggedElement, event.target);
        keyGroupsWrapper.insertBefore(newDropZone, draggedElement);

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

        registerDragAndDropEvent(newDropZone);
      }
    });
  }
});
