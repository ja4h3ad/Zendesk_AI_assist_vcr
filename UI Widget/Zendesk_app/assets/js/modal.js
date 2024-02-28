class Modal {
  constructor(url) {
    this.url = url;
  }

  open(args) {
    this.window = window.open(this.url, "_blank", "popup=1");
    this.window.postMessage(args);
  }

  close() {
    this.window.close();
  }
}
