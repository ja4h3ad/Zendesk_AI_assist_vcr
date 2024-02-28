class Chart {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.stage = new createjs.Stage(this.canvas);
    this.container.appendChild(this.canvas);
  }

  setData(data) {
    this.data = data;
    this.refresh();
  }

  refresh() {
    this.canvas.style.width = `${this.container.offsetWidth}px`;
    this.canvas.style.height = `${this.container.offsetHeight}px`;
    this.canvas.width = this.container.offsetWidth * 2;
    this.canvas.height = this.container.offsetHeight * 2;
    this.render();
  }

  render() {}

  renderLine(fx, fy, tx, ty, color, lineWidth = 1) {
    const shape = new createjs.Shape();
    shape.graphics.beginStroke(color).moveTo(fx, fy).lineTo(tx, ty);
    this.stage.addChild(shape);
    return shape;
  }
}
