class ChartSentimentOverTime extends Chart {
  render() {
    const padding = 10;
    const { data, canvas, context, stage } = this;
    const { width, height } = canvas;
    const middleY = ~~(height / 2);

    const [first, ...points] = data.messages.map(({ score }, i) => {
      const x =
        (i * (width - 2 * padding)) / (data.messages.length - 1) + padding;
      const y = middleY - score * (middleY - padding);
      return { x, y };
    });

    this.renderLine(padding, middleY, width, middleY, "#aaa");
    const shapeTop = new createjs.Shape();
    const top = shapeTop.graphics.drawRect(0, 0, width, middleY);
    const shapeBottom = new createjs.Shape();
    const bottom = shapeBottom.graphics.drawRect(0, middleY, width, middleY);

    const shapeTopLine = new createjs.Shape();
    const renderingTopLine = shapeTopLine.graphics
      .setStrokeStyle(2)
      .beginStroke("#06c258")
      .moveTo(first.x, first.y);
    points.forEach(({ x, y }) => renderingTopLine.lineTo(x, y));
    shapeTopLine.mask = shapeTop;

    const shapeTopBackground = new createjs.Shape();
    const renderingTopBackground = shapeTopBackground.graphics
      .beginLinearGradientFill(
        ["rgb(6, 194, 88, 0.4)", "rgb(6, 194, 88, 0)"],
        [0, 1],
        0,
        0,
        0,
        middleY
      )
      .moveTo(padding, middleY);
    [first, ...points].forEach(({ x, y }) =>
      renderingTopBackground.lineTo(x, y)
    );
    renderingTopBackground.lineTo(width - padding, middleY);
    shapeTopBackground.mask = shapeTop;

    const shapeBottomLine = new createjs.Shape();
    const renderingBottomLine = shapeBottomLine.graphics
      .setStrokeStyle(2)
      .beginStroke("#f01e2c")
      .moveTo(first.x, first.y);
    points.forEach(({ x, y }) => renderingBottomLine.lineTo(x, y));
    shapeBottomLine.mask = shapeBottom;

    const shapeBottomBackground = new createjs.Shape();
    const renderingBottomBackground = shapeBottomBackground.graphics
      .beginLinearGradientFill(
        ["rgb(240, 30, 44, 0.4)", "rgb(240, 30, 44, 0)"],
        [0, 1],
        0,
        height,
        0,
        middleY
      )
      .moveTo(padding, middleY);
    [first, ...points].forEach(({ x, y }) =>
      renderingBottomBackground.lineTo(x, y)
    );
    renderingBottomBackground.lineTo(width - padding, middleY);
    shapeBottomBackground.mask = shapeBottom;

    stage.addChild(shapeTop);
    stage.addChild(shapeBottom);

    stage.addChild(shapeTopLine);
    stage.addChild(shapeBottomLine);

    stage.addChild(shapeTopBackground);
    stage.addChild(shapeBottomBackground);

    [first, ...points].forEach(({ x, y }) => {
      let color = y > middleY ? "#f01e2c" : "#06c258";
      const shape = new createjs.Shape();
      shape.graphics.beginFill(color).drawCircle(x, y, 6);
      stage.addChild(shape);
    });
    stage.update();
  }
}
