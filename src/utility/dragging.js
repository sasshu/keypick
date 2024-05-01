export default class Drag {
  dragging;

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

  setProcessAfterDrop(process) {
    this.#executeProcessAfterDrop = process;
  }

  #executeProcessAfterDrop = () => {};

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
        event.target.classList.remove("py-1");
        event.target.classList.add("py-3");
      }
    });
  }

  #addEventToDragLeave(dropZone) {
    // ドラッグ要素がターゲットの上から離れたときに発生
    dropZone.addEventListener("dragleave", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (!this.isFront(dropZone) && !this.isBehind(dropZone)) {
        event.target.classList.remove("py-3");
        event.target.classList.add("py-1");
      }
    });
  }

  #addEventToDrop(dropZone) {
    // ドラッグ要素がドロップされたときに発生
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (!this.isFront(dropZone) && !this.isBehind(dropZone)) {
        event.target.classList.remove("py-3");
        event.target.classList.add("py-1");

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
