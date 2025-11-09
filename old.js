function web(p) {
  const level = 2;
  const cellSize = 400 / level; // you can adjust
  let featurePoints;
  let buffer;
  let player;

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 2;
      this.prevX = x;
      this.prevY = y;
      this.stuckCounter = 0;
      this.notDead = true;
    }

    draw() {
      p.fill(255, 0, 0);
      p.noStroke();
      p.ellipse(this.x, this.y, 20, 20);
    }

    move() {
      // gradient ascent
      const gx =
        this.getBrightness(this.x + 2, this.y) -
        this.getBrightness(this.x - 2, this.y);
      const gy =
        this.getBrightness(this.x, this.y + 2) -
        this.getBrightness(this.x, this.y - 2);

      const len = Math.hypot(gx, gy);
      if (len > 0) {
        this.x += (gx / len) * this.speed;
        this.y += (gy / len) * this.speed;
      }

      // WASD input
      if (p.keyIsDown(87)) this.y -= this.speed; // W
      if (p.keyIsDown(83)) this.y += this.speed; // S
      if (p.keyIsDown(65)) this.x -= this.speed; // A
      if (p.keyIsDown(68)) this.x += this.speed; // D

      this.x = p.constrain(this.x, 0, p.width - 1);
      this.y = p.constrain(this.y, 0, p.height - 1);
    }

    getBrightness(x, y) {
      x = p.constrain(Math.floor(x), 0, p.width - 1);
      y = p.constrain(Math.floor(y), 0, p.height - 1);
      const idx = 4 * (x + y * p.width);
      const r = buffer.pixels[idx];
      const g = buffer.pixels[idx + 1];
      const b = buffer.pixels[idx + 2];
      return (r + g + b) / 3; // raw brightness
    }

    checkStuck() {
      const dx = this.x - this.prevX;
      const dy = this.y - this.prevY;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.5) {
        this.stuckCounter++;
      } else {
        this.stuckCounter = 0;
      }
      this.prevX = this.x;
      this.prevY = this.y;

      return this.stuckCounter > 10; // stuck if barely moved for 10 frames
    }

    handleStuck() {
      // teleport to random feature point if stuck
      const spawn = featurePoints[p.floor(p.random(featurePoints.length))];
      this.x = spawn.x;
      this.y = spawn.y;
      this.stuckCounter = 0;
    }
  }

  p.setup = () => {
    p.createCanvas(400, 400);
    featurePoints = p.getFeaturePoints();
    buffer = p.drawScene(featurePoints);

    // spawn player at random feature point
    const spawn = featurePoints[p.floor(p.random(featurePoints.length))];
    player = new Player(spawn.x, spawn.y);

    buffer.loadPixels(); // important for getBrightness
    p.frameRate(60);
  };

  p.draw = () => {
    // draw static background from buffer
    p.image(buffer, 0, 0);

    // move player along gradient and WASD
    player.move();

    // check stuck
    if (player.checkStuck()) {
      player.handleStuck();
    }

    // draw player
    player.draw();
  };

  p.getFeaturePoints = () => {
    const points = [];
    const cols = p.ceil(p.width / cellSize);
    const rows = p.ceil(p.height / cellSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        points.push({
          x: x * cellSize + p.random(cellSize),
          y: y * cellSize + p.random(cellSize),
        });
      }
    }
    return points;
  };

  p.drawScene = (points) => {
    const buf = p.createGraphics(p.width, p.height);
    buf.pixelDensity(1);
    buf.loadPixels();

    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        let minDist = Infinity;
        for (const pt of points) {
          const dx = x - pt.x;
          const dy = y - pt.y;
          const d = p.sqrt(dx * dx + dy * dy);
          if (d < minDist) minDist = d;
        }
        const c = p.map(minDist, 0, cellSize, 0, 255);
        const idx = 4 * (y * p.width + x);
        buf.pixels[idx] = c;
        buf.pixels[idx + 1] = c;
        buf.pixels[idx + 2] = c;
        buf.pixels[idx + 3] = 255;
      }
    }

    buf.updatePixels();
    return buf;
  };
}
