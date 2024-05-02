import Drag from "../utility/dragging.js";

window.addEventListener("DOMContentLoaded", async () => {
  let keyGroups;
  let keyGroupIndex;
  let keyGroup;
  let isEditing = false;
  const dropZoneHtml = "<div class='key-drop-zone py-1'></div>";

  const editButton = document.querySelector("#key-edit-button");
  const storeButton = document.querySelector("#key-store-button");
  const deleteButton = document.querySelector("#key-delete-button");

  await init();

  function setDragEvent() {
    // ドラッグイベントの登録
    const drag = new Drag(
      document.querySelectorAll(".key-content"),
      document.querySelectorAll(".key-drop-zone")
    );

    drag.setProcessAfterDrop(() => {
      // querySelectorAll()で取得できるのはNodeListなので、Arrayに変換する
      const orderedKeyIdList = Array.from(
        document.querySelectorAll(".value-input"),
        (element) => element.name
      );

      // データ順を変更
      const newKeys = [];
      orderedKeyIdList.forEach((id) => {
        const newKey = keyGroup.keys.find((key) => key.id == id);
        newKeys.push(newKey);
      });
      keyGroup.keys = [...newKeys];
      keyGroups[keyGroupIndex] = structuredClone(keyGroup);
      window.store.set("keygroups", keyGroups);
    });
  }

  // キーの編集/編集キャンセル
  editButton.addEventListener("click", async () => {
    isEditing = !isEditing;
    const titleWrapper = document.querySelector("#key-group-title");
    const labelWrappers = document.querySelectorAll(".key-label");
    const valueElements = document.querySelectorAll(".value-input");

    if (isEditing) {
      editButton.textContent = "キャンセル";
      deleteButton.classList.add("hidden");
      storeButton.classList.remove("hidden");

      titleWrapper.innerHTML = `<input
        type="text"
        value="${titleWrapper.firstElementChild.textContent.trim()}"
        class="text-2xl font-bold w-full text-black bg-indigo-100 focus:outline-blue-600 px-2"
      />`;
      labelWrappers.forEach((element) => {
        element.innerHTML = `<input
          type="text"
          name="${element.name}"
          value="${element.textContent.trim()}"
          class="w-full text-black bg-indigo-100 focus:outline-blue-600 p-2"
        />`;
      });
      valueElements.forEach((element) => {
        element.readOnly = false;
        element.classList.add("bg-indigo-100");
      });
    } else {
      await init();
    }
  });

  // 編集内容の保存
  storeButton.addEventListener("click", async () => {
    const title =
      document.querySelector("#key-group-title").firstElementChild.value;
    const valueInputs = document.querySelectorAll(".value-input");
    const keyList = [];
    valueInputs.forEach((valueInput) => {
      keyList.push({
        id: valueInput.name,
        name: valueInput.previousElementSibling.firstElementChild.value,
        value: valueInput.value,
        isVisible: valueInput.type === "text" ? true : false,
      });
    });

    const newKeyGroup = {
      id: keyGroup.id,
      name: title,
      keys: keyList,
    };
    await updateKeyGroup(newKeyGroup);
    await init();
  });

  // キーグループの削除
  deleteButton.addEventListener("click", async () => {});

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);

  // ホームに戻る
  const backButton = document.querySelector("#back-button");
  backButton.addEventListener("click", () => {
    location.href = "../index/index.html";
  });

  async function init() {
    keyGroups = await window.store.get("keygroups");
    keyGroupIndex = await window.api.recieveKeyGroupIndex();
    keyGroup = keyGroups[keyGroupIndex];
    buildDetailHtml(keyGroup);
    registerEvent();

    isEditing = false;
    editButton.textContent = "編集";
    storeButton.classList.add("hidden");
    deleteButton.classList.remove("hidden");
  }

  // HTMLの作成
  function buildDetailHtml(keyGroup) {
    console.log(keyGroup);
    document.querySelector(
      "#key-group-title"
    ).innerHTML = `<h1 class="text-2xl font-bold">${keyGroup.name}</h1>`;

    const keyListHtmls = [];
    keyGroup.keys.forEach((key, index) => {
      keyListHtmls.push(`
      ${dropZoneHtml}
      <li class="border-b-2 pt-4 flex items-center key-content" draggable="true">
        <div class="key-label basis-3/12 max-w-40 mx-2">
          <p class="text-right">${key.name}</p>
        </div>
        <input name="${key.id}"
          type="${key.isVisible ? "text" : "password"}"
          class="value-input text-black flex-auto mx-2 p-2 focus:outline-blue-600"
          value="${key.value}"
          readonly/>
        <button name="${key.id}"
          class="visibility-button material-icons flex-none hover:opacity-50 rounded-full p-1 mx-2">
            ${key.isVisible ? "visibility_off" : "visibility"}
        </button>
        <button name="${key.id}"
          class="copy-button material-icons flex-none hover:opacity-50 rounded-full p-1 mx-2">content_copy
        </button>
      </li>
      ${index === keyGroup.keys.length - 1 ? dropZoneHtml : ""}
      `);
    });

    const keyListElement = document.querySelector("#key-list");
    keyListElement.innerHTML = keyListHtmls.join("");
  }

  // 各イベントの登録（HTML構造が変化する場合、イベントを再登録しなければならない）
  function registerEvent() {
    addEventToRevealKey();
    addEventToCopyKey();
    setDragEvent();
  }

  // キーの更新（単体）
  async function updateSingleKey(newKey) {
    const keyIndex = keyGroup.keys.findIndex(
      (oldKey) => oldKey.id === newKey.id
    );
    keyGroups[keyGroupIndex].keys[keyIndex] = newKey;
    await window.store.set("keygroups", keyGroups);
  }

  // キーの更新（全体）
  async function updateKeyGroup(newKeyGroup) {
    keyGroups[keyGroupIndex] = newKeyGroup;
    await window.store.set("keygroups", keyGroups);
  }

  // キー値表示/非表示制御
  function addEventToRevealKey() {
    const visibilityButtons = document.querySelectorAll(".visibility-button");
    visibilityButtons.forEach((button, index) => {
      button.addEventListener("click", async () => {
        const valueInput = document.querySelector(
          `.value-input[name='${button.name}']`
        );
        if (button.innerHTML.includes("off")) {
          valueInput.type = "password";
          button.textContent = "visibility";
          updateSingleKey({ ...keyGroup.keys[index], isVisible: false });
        } else {
          valueInput.type = "text";
          button.textContent = "visibility_off";
          updateSingleKey({ ...keyGroup.keys[index], isVisible: true });
        }
      });
    });
  }

  // キー値をクリップボードにコピー
  function addEventToCopyKey() {
    const copyButtons = document.querySelectorAll(".copy-button");
    copyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const textToCopy = document.querySelector(
          `.value-input[name='${button.name}']`
        ).value;
        navigator.clipboard.writeText(textToCopy).then(() => {
          console.log(textToCopy);
          button.textContent = "check";
          setTimeout(() => {
            button.textContent = "content_copy";
          }, 2000);
        });
      });
    });
  }
});

// {
// 	"theme": "light",
// 	"keygroups": [
// 		{
// 			"id": 1,
// 			"name": "DSC開発環境",
// 			"keys": [
// 				{
// 					"id": 1,
// 					"name": "ユーザ名",
// 					"value": "ssato@dataspider.com",
// 					"isVisible": true
// 				},
// 				{
// 					"id": 2,
// 					"name": "パスワード",
// 					"value": "dscUser2024",
// 					"isVisible": false
// 				}
// 			]
// 		},
// 		{
// 			"id": 2,
// 			"name": "Heroku DWH",
// 			"keys": [
// 				{
// 					"id": 1,
// 					"name": "host name",
// 					"value": "255.235.186.043",
// 					"isVisible": true
// 				},
// 				{
// 					"id": 2,
// 					"name": "port number",
// 					"value": "22",
// 					"isVisible": true
// 				},
// 				{
// 					"id": 3,
// 					"name": "user name",
// 					"value": "user01",
// 					"isVisible": true
// 				},
// 				{
// 					"id": 4,
// 					"name": "password",
// 					"value": "kegfo6bh3wcl",
// 					"isVisible": false
// 				},
// 				{
// 					"id": 5,
// 					"name": "table name",
// 					"value": "table_011",
// 					"isVisible": true
// 				}
// 			]
// 		},
// 		{
// 			"id": 3,
// 			"name": "Salesforce開発環境",
// 			"keys": [
// 				{
// 					"id": 1,
// 					"name": "ユーザ名",
// 					"value": "ssato@salesforce.com",
// 					"isVisible": true
// 				},
// 				{
// 					"id": 2,
// 					"name": "パスワード",
// 					"value": "sfdc2020",
// 					"isVisible": false
// 				},
// 				{
// 					"id": 3,
// 					"name": "ログインURL",
// 					"value": "https://login.salesforce.com/",
// 					"isVisible": true
// 				}
// 			]
// 		}
// 	]
// }
