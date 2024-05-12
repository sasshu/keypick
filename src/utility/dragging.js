export default class Drag {
  // ドラッグ要素
  dragging;
  // ドラッグ中に適応されるドロップゾーンのClass
  #dropAreaClassList = ["border-indigo-500", "border-y-2"];
  // ドロップゾーンの高さ
  #dropZoneHeight;

  constructor(items, dropZones) {
    items.forEach((item) => {
      // ドラッグが開始したときに発生
      item.addEventListener("dragstart", (event) => {
        this.dragging = event.currentTarget;
        event.dataTransfer.effectAllowed = "move";
      });
    });

    this.#dropZoneHeight = dropZones[0].clientHeight;

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
      if (
        !this.isFront(event.currentTarget) &&
        !this.isBehind(event.currentTarget)
      ) {
        event.currentTarget.classList.add(...this.#dropAreaClassList);
        event.currentTarget.style.height = `${
          this.dragging.clientHeight + this.#dropZoneHeight
        }px`;
      }
    });
  }

  #addEventToDragLeave(dropZone) {
    // ドラッグ要素がターゲットの上から離れたときに発生
    dropZone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        !this.isFront(event.currentTarget) &&
        !this.isBehind(event.currentTarget)
      ) {
        event.currentTarget.classList.remove(...this.#dropAreaClassList);
        event.currentTarget.style.height = "auto";
      }
    });
  }

  #addEventToDrop(dropZone) {
    // ドラッグ要素がドロップされたときに発生
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        !this.isFront(event.currentTarget) &&
        !this.isBehind(event.currentTarget)
      ) {
        event.currentTarget.classList.remove(...this.#dropAreaClassList);
        event.currentTarget.style.height = "auto";

        const draggedParent = this.dragging.parentNode;
        // 元の場所から削除
        draggedParent.removeChild(this.dragging.previousElementSibling);
        // 移動先に追加
        const newDropZone = event.currentTarget.cloneNode();
        draggedParent.insertBefore(this.dragging, event.currentTarget);
        draggedParent.insertBefore(newDropZone, this.dragging);

        this.#executeProcessAfterDrop();

        this.#addEventToDragOver(newDropZone);
        this.#addEventToDragLeave(newDropZone);
        this.#addEventToDrop(newDropZone);
      }
    });
  }
}
