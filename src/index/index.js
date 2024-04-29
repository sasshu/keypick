window.addEventListener("DOMContentLoaded", async () => {
  const keygroups = await window.store.get("keygroups");
  console.log(keygroups);
  let draggedElement;
  const dropZoneHtml = "<div class='key-drop-zone py-1'></div>";
  buildKeygroupsHtml(keygroups);

  // キーグループの順序入れ替え
  const keyElements = document.querySelectorAll('li[draggable="true"]');
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

  function registerDragAndDropEvent(dropZone) {
    addEventToDragOver(dropZone);
    addEventToDragLeave(dropZone);
    addEventToDrop(dropZone);
  }

  function addEventToDragOver(dropZone) {
    // ドラッグ要素がターゲットの上にあるときに発生
    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      // ドラッグ要素の両脇への移動は禁止
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
      // ドラッグ要素の両脇への移動は禁止
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
      // ドラッグ要素の両脇への移動は禁止
      if (
        draggedElement.previousElementSibling !== event.target &&
        draggedElement.nextElementSibling !== event.target
      ) {
        event.target.classList.remove("py-3");
        event.target.classList.add("py-1");

        const draggedParent = draggedElement.parentNode;
        const keygroupsWrapper = document.querySelector("#key-group-list");
        // 元の場所から削除
        draggedParent.removeChild(draggedElement.previousElementSibling);
        // 移動先に追加
        const newDropZone = event.target.cloneNode();
        keygroupsWrapper.insertBefore(draggedElement, event.target);
        keygroupsWrapper.insertBefore(newDropZone, draggedElement);

        registerDragAndDropEvent(newDropZone);
      }
    });
  }

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

  // キーグループのリストを表示
  function buildKeygroupsHtml(keygroups) {
    const keygroupsHtmls = [];
    keygroups.forEach((keygroup, index) => {
      keygroupsHtmls.push(`
        ${dropZoneHtml}
        <li class="border-b-2 pt-2" draggable="true">
          <button class="key-detail-button hover:opacity-50"
            name="${keygroup.id}">
            ${keygroup.name}
          </button>
        </li>
        ${index === keygroups.length - 1 ? dropZoneHtml : ""}
      `);
    });

    const keygroupsWrapper = document.querySelector("#key-group-list");
    keygroupsWrapper.innerHTML = keygroupsHtmls.join("");
  }
});
