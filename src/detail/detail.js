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

// キーのリストを表示
buildKeylistHtml = (keygroup) => {
  const keylistHtmls = [];
  for (const key of keygroup.keys) {
    keylistHtmls.push(`
      <li class="border-b-2 pt-8 flex items-center">
      <p name="${key.id}" class="basis-3/12 text-right pr-2">${key.name}</p>
      <input name="${key.id}" type="password" class="value-input text-black basis-7/12 border-2 p-2 focus:outline-blue-600" value="${key.value}" readonly/>
      <button name="${key.id}" class="visibility-button material-icons basis-1/12 px-1">visibility</button>
      <button name="${key.id}" class="copy-button material-icons basis-1/12 px-1">content_copy</button>
      </li>`);
  }

  const keylistWrapper = document.querySelector("#key-list");
  keylistWrapper.innerHTML = keylistHtmls.join("");
};

window.addEventListener("DOMContentLoaded", async () => {
  const keygroup = await window.api.recieveKeygroup();
  console.log(keygroup);
  document.querySelector("#key-group-title").textContent = keygroup.name;

  buildKeylistHtml(keygroup);

  // キー値表示/非表示制御
  const visibilityButtons = document.querySelectorAll(".visibility-button");
  visibilityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const valueInput = document.querySelector(
        `.value-input[name='${button.name}']`
      );
      if (button.innerHTML.includes("off")) {
        valueInput.type = "password";
        button.innerHTML = "visibility";
      } else {
        valueInput.type = "text";
        button.innerHTML = "visibility_off";
      }
    });
  });

  // キー値をクリップボードにコピー
  const copyButtons = document.querySelectorAll(".copy-button");
  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const textToCopy = document.querySelector(
        `.value-input[name='${button.name}']`
      ).value;
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log(textToCopy);
        button.innerHTML = "check";
        setTimeout(() => {
          button.innerHTML = "content_copy";
        }, 2000);
      });
    });
  });

  // ダークモードの切り替え
  const themeChangeButton = document.querySelector("#theme-change-button");
  themeChangeButton.addEventListener("click", window.api.toggleDarkmode);

  // ホームに戻る
  const backButton = document.querySelector("#back-button");
  backButton.addEventListener("click", () => {
    location.href = "../index/index.html";
  });
});
