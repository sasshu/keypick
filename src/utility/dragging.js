export default class Drag {
  // ドラッグ要素
  dragging;
  // ドラッグ中に適応されるドロップゾーンのClass
  #dropEreaClassList = ["border-indigo-500", "border-y-2"];

  constructor(items, dropZones) {
    this.items = items;
    this.items.forEach((item) => {
      // ドラッグが開始したときに発生
      item.addEventListener("dragstart", (event) => {
        this.dragging = event.target;
        event.dataTransfer.effectAllowed = "move";
      });
    });

    dropZones.forEach((dropZone) => {
      this.#addEventToDragOver(dropZone);
      this.#addEventToDragLeave(dropZone);
      this.#addEventToDrop(dropZone);
    });
  }

  // ドロップ後に行いたい処理をインスタンス側で定義
  setProcessAfterDrop(process) {
    this.#executeProcessAfterDrop = process;
  }

  #executeProcessAfterDrop = () => {};

  // ドロップゾーンがドラッグ要素の前後か判定
  isFront(dropZone) {
    return this.dragging.previousElementSibling === dropZone;
  }

  isBehind(dropZone) {
    return this.dragging.nextElementSibling === dropZone;
  }

  #addEventToDragOver(dropZone) {
    // ドラッグ要素がターゲットの上にあるときに発生
    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (!this.isFront(dropZone) && !this.isBehind(dropZone)) {
        event.target.classList.add(...this.#dropEreaClassList);
        dropZone.style.height = `${this.dragging.clientHeight}px`;
      }
    });
  }

  #addEventToDragLeave(dropZone) {
    // ドラッグ要素がターゲットの上から離れたときに発生
    dropZone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (!this.isFront(dropZone) && !this.isBehind(dropZone)) {
        event.target.classList.remove(...this.#dropEreaClassList);
        dropZone.style.height = "auto";
      }
    });
  }

  #addEventToDrop(dropZone) {
    // ドラッグ要素がドロップされたときに発生
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (!this.isFront(dropZone) && !this.isBehind(dropZone)) {
        event.target.classList.remove(...this.#dropEreaClassList);
        dropZone.style.height = "auto";

        const draggedParent = this.dragging.parentNode;
        // 元の場所から削除
        draggedParent.removeChild(this.dragging.previousElementSibling);
        // 移動先に追加
        const newDropZone = event.target.cloneNode();
        draggedParent.insertBefore(this.dragging, event.target);
        draggedParent.insertBefore(newDropZone, this.dragging);

        this.#executeProcessAfterDrop();

        this.#addEventToDragOver(newDropZone);
        this.#addEventToDragLeave(newDropZone);
        this.#addEventToDrop(newDropZone);
      }
    });
  }
}
