export default class Drag {
  // ドラッグ要素
  dragging;
  // ドラッグ中に適応されるドロップゾーンのClass
  #dropAreaClassList = ["border-indigo-500", "border-y-2"];
  // ドロップゾーンの高さ
  #dropZoneHeight;

  constructor(items, dropZones) {
    this.#dropZoneHeight = dropZones[0].clientHeight;

    items.forEach((item) => {
      this.#addEventToDragStart(item);
    });

    dropZones.forEach((dropZone) => {
      this.#addEventToDragOver(dropZone);
      this.#addEventToDragLeave(dropZone);
      this.#addEventToDrop(dropZone);
    });
  }

  /**
   * ドロップ後に行いたい処理をインスタンス側で定義
   * @param {function} callback ドロップ後に行いたい処理
   */
  setProcessAfterDrop(callback) {
    this.#executeProcessAfterDrop = callback;
  }

  /** ドロップ後に行う処理 */
  #executeProcessAfterDrop = () => {};

  /**
   * 対象のドロップゾーンがドラッグ要素の一つ前か判定
   * @param {HTMLElement} dropZone ドロップを受け入れる要素
   * @return {boolean} 存在するならtrue、しなければfalse
   */
  isFront(dropZone) {
    return this.dragging.previousElementSibling === dropZone;
  }

  /**
   * 対象のドロップゾーンがドラッグ要素の一つ後か判定
   * @param {HTMLElement} dropZone ドロップを受け入れる要素
   * @return {boolean} 存在するならtrue、しなければfalse
   */
  isBehind(dropZone) {
    return this.dragging.nextElementSibling === dropZone;
  }

  /**
   * ドラッグが開始されたときのイベントを登録
   * @param {HTMLElement} item ドラッグさせる要素
   */
  #addEventToDragStart(item) {
    item.ondragstart = (event) => {
      this.dragging = event.currentTarget;
      event.dataTransfer.effectAllowed = "move";
    };
  }

  /**
   * ドラッグ要素がターゲットの上にあるときのイベントを登録
   * @param {HTMLElement} dropZone ドロップを受け入れる要素
   */
  #addEventToDragOver(dropZone) {
    dropZone.ondragover = (event) => {
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
    };
  }

  /**
   * ドラッグ要素がターゲットの上から離れたときのイベントを登録
   * @param {HTMLElement} dropZone ドロップを受け入れる要素
   */
  #addEventToDragLeave(dropZone) {
    dropZone.ondragleave = (event) => {
      event.preventDefault();
      // ドラッグ要素の前後への移動は禁止
      if (
        !this.isFront(event.currentTarget) &&
        !this.isBehind(event.currentTarget)
      ) {
        event.currentTarget.classList.remove(...this.#dropAreaClassList);
        event.currentTarget.style.height = "auto";
      }
    };
  }

  /**
   * ドラッグ要素がドロップされたときのイベントを登録
   * @param {HTMLElement} dropZone ドロップを受け入れる要素
   */
  #addEventToDrop(dropZone) {
    dropZone.ondrop = (event) => {
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
    };
  }
}
