import Drag from "../utility/dragging.js";

window.addEventListener("DOMContentLoaded", async () => {
  let keyGroups;
  let keyGroupIndex;
  let keyGroup;
  let isEditing = false;
  let drag;
  const dropZoneHtml = "<div class='key-drop-zone pt-5'></div>";

  const addButton = document.querySelector("#key-add-button");
  const editButton = document.querySelector("#key-edit-button");
  const storeButton = document.querySelector("#key-store-button");
  const deleteButton = document.querySelector("#key-group-delete-button");

  await init();

  /** ドラッグイベントの登録 */
  function setDragEvent() {
    drag = new Drag(
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
    const copyButtons = document.querySelectorAll(".copy-button");

    if (isEditing) {
      editButton.textContent = "キャンセル";
      deleteButton.classList.add("hidden");
      addButton.classList.remove("invisible");
      storeButton.classList.remove("hidden");

      titleWrapper.innerHTML = `<input
        type="text"
        value="${titleWrapper.firstElementChild.textContent.trim()}"
        class="text-2xl font-bold w-full text-black bg-indigo-100 focus:outline-blue-600 px-2"
      />`;
      labelWrappers.forEach((element) => {
        changeKeyLabelHtmlToUpdate(element);
      });
      valueElements.forEach((element) => {
        changeValueInputHtmlToUpdate(element);
      });
      copyButtons.forEach((element) => {
        element.innerHTML = "delete";
      });

      toggleKeyDraggable();
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

  // キーの追加
  addButton.addEventListener("click", async () => {
    const newKey = {
      id: generateId("key"),
      name: "",
      value: "",
      isVisible: true,
    };

    // HTML要素を作成し、innerHTMLで中身を指定
    const newKeyLine = document.createElement("div");
    newKeyLine.innerHTML = prepareKeyLineHtml(newKey);

    // キー編集モードに切り替え
    changeKeyLabelHtmlToUpdate(newKeyLine.querySelector(".key-label"));
    changeValueInputHtmlToUpdate(newKeyLine.querySelector(".value-input"));

    const newDropZone = document.createElement("div");
    newDropZone.innerHTML = dropZoneHtml;

    // fragmentを作成し、HTMLの中身をすべて投入
    const fragment = document.createDocumentFragment();
    fragment.appendChild(newKeyLine.firstElementChild);
    fragment.appendChild(newDropZone.firstElementChild);

    // DOMにfragmentを反映
    document.querySelector("#key-list").appendChild(fragment);

    // イベントの登録
    addEventToRevealKey();
    addEventToCopyKey();
  });

  /**
   * キーラベルHTMLの変更
   * @param {HTMLElement} element キーラベルのHTML要素
   */
  function changeKeyLabelHtmlToUpdate(element) {
    element.innerHTML = `<input
      type="text"
      name="${element.name}"
      placeholder="ラベル"
      value="${element.textContent.trim()}"
      class="w-full text-black bg-indigo-100 focus:outline-blue-600 p-2"
    />`;
  }

  /**
   * キー入力欄HTMLの変更
   * @param {HTMLElement} element キー入力欄のHTML要素
   */
  function changeValueInputHtmlToUpdate(element) {
    element.readOnly = false;
    element.placeholder = "キー値";
    element.classList.remove("bg-transparent", "outline-none");
    element.classList.add(
      "bg-indigo-100",
      "focus:outline-blue-600",
      "text-black"
    );
  }

  /** キーのドラッグ可否切り替え */
  function toggleKeyDraggable() {
    document.querySelectorAll(".key-content").forEach((element) => {
      element.draggable = !element.draggable;
    });
  }

  /**
   * Idの生成
   * @param {string} type Idの種類
   * @return {string} 生成したId
   */
  function generateId(type) {
    const dt = new Date();
    const year = dt.getFullYear();
    const month = ("0" + (dt.getMonth() + 1)).slice(-2);
    const date = ("0" + dt.getDate()).slice(-2);
    const hour = ("0" + dt.getHours()).slice(-2);
    const minute = ("0" + dt.getMinutes()).slice(-2);
    const second = ("0" + dt.getSeconds()).slice(-2);
    const millisecond = ("000" + dt.getMilliseconds()).slice(-4);

    return `${type}${year}${month}${date}${hour}${minute}${second}${millisecond}`;
  }

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

  /** 初期化処理 */
  async function init() {
    isEditing = false;
    editButton.textContent = "編集";
    addButton.classList.add("invisible");
    storeButton.classList.add("hidden");
    deleteButton.classList.remove("hidden");

    keyGroups = await window.store.get("keygroups");
    keyGroupIndex = await window.api.recieveKeyGroupIndex();
    keyGroup = keyGroups[keyGroupIndex];
    buildDetailHtml(keyGroup);
    registerEvent();
  }

  /**
   * 詳細ページのHTML全体を作成
   * @param {{
   * id: string,
   * name: string,
   * keys: array
   * }} keyGroup キーグループデータ
   */
  function buildDetailHtml(keyGroup) {
    console.log(keyGroup);
    document.querySelector(
      "#key-group-title"
    ).innerHTML = `<h1 class="text-2xl font-bold">${keyGroup.name}</h1>`;

    const keyListHtmls = [];
    keyGroup.keys.forEach((key, index) => {
      keyListHtmls.push(`
      ${dropZoneHtml}
      ${prepareKeyLineHtml(key)}
      ${index === keyGroup.keys.length - 1 ? dropZoneHtml : ""}
      `);
    });

    const keyListElement = document.querySelector("#key-list");
    keyListElement.innerHTML = keyListHtmls.join("");
  }

  /**
   * HTML（キー1行）の用意
   * @param {{
   * id: string,
   * name: string,
   * value: string,
   * isVisible: boolean,
   * }} key キーデータ
   */
  function prepareKeyLineHtml(key) {
    return `
      <li class="border-b-2 flex items-center key-content" draggable="${!isEditing}">
        <div class="key-label basis-3/12 max-w-40 mx-2">
          <p class="text-right">${key.name}</p>
        </div>
        <input name="${key.id}"
          type="${key.isVisible ? "text" : "password"}"
          class="value-input flex-auto mx-2 p-2 bg-transparent outline-none"
          value="${key.value}"
          readonly/>
        <button name="${key.id}"
          class="visibility-button material-icons flex-none hover:opacity-50 rounded-full p-1 mx-2">
            ${key.isVisible ? "visibility_off" : "visibility"}
        </button>
        <button name="${key.id}"
          class="copy-button material-icons flex-none hover:opacity-50 rounded-full p-1 mx-2">
            ${isEditing ? "delete" : "content_copy"}
        </button>
      </li>
    `;
  }

  /** 各イベントの登録（HTML構造が変化する場合、イベントの再登録必須）*/
  function registerEvent() {
    addEventToRevealKey();
    addEventToCopyKey();
    setDragEvent();
  }

  /**
   * キーの更新
   * @param {{
   * id: string,
   * name: string,
   * value: string,
   * isVisible: boolean,
   * }} newKey 新キーデータ
   */
  async function updateKeyLine(newKey) {
    const keyIndex = keyGroup.keys.findIndex(
      (oldKey) => oldKey.id === newKey.id
    );
    keyGroups[keyGroupIndex].keys[keyIndex] = newKey;
    await window.store.set("keygroups", keyGroups);
  }

  /**
   * キーグループの更新
   * @param {{
   * id: string,
   * name: string,
   * keys: array
   * }} newKeyGroup 新キーグループデータ
   */
  async function updateKeyGroup(newKeyGroup) {
    keyGroups[keyGroupIndex] = newKeyGroup;
    await window.store.set("keygroups", keyGroups);
  }

  /** イベントの登録（キー値表示/非表示制御） */
  function addEventToRevealKey() {
    const visibilityButtons = document.querySelectorAll(".visibility-button");
    visibilityButtons.forEach((button, index) => {
      button.onclick = () => {
        const valueInput = document.querySelector(
          `.value-input[name='${button.name}']`
        );
        if (button.innerHTML.includes("off")) {
          valueInput.type = "password";
          button.textContent = "visibility";
          updateKeyLine({ ...keyGroup.keys[index], isVisible: false });
        } else {
          valueInput.type = "text";
          button.textContent = "visibility_off";
          updateKeyLine({ ...keyGroup.keys[index], isVisible: true });
        }
      };
    });
  }

  /** イベントの登録（キー値をクリップボードにコピー） */
  function addEventToCopyKey() {
    const copyButtons = document.querySelectorAll(".copy-button");
    copyButtons.forEach((button) => {
      button.onclick = () => {
        if (isEditing) {
          // HTML要素の削除
          button.parentElement.nextElementSibling.remove();
          button.parentElement.remove();
        } else {
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
        }
      };
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
