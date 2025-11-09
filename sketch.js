//ideas:

// every 10s you are shortly invincible
// objects at feature points
// warp cells
// eventually use color
// player particle swarm
// enemies
// every 10s reload voronoi map
// stuck -> travel to random feature point
// stuck -> spawn enemy at current loc and respawn at random feature point

function web(p) {
  let level = 5;
  let notDead = true;
  let featurePoints;
  let buffer;
  let player;

  // class Particle {
  //   constructor(x, y) {
  //     this.x = x;
  //     this.y = y;
  //   }
  // }

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 5;
      this.nParticles = 100;
      this.maxR = 500;
      this.dots = [];
    }

    draw() {
      this.makeParticles(this.nParticles);

      p.strokeWeight(2);
      p.stroke(255);
      for (let i = 0; i < this.nParticles; i++) {
        console.log(this.dots[i].x);
        p.point(this.dots[i].x, this.dots[i].y, 255);
      }
      this.dots = [];
    }

    makeParticles = (n) => {
      for (let i = 0; i < n; i++) {
        let a = p.random(0, p.TWO_PI);
        let r = p.sqrt(p.random(0, this.maxR));

        let x = p.floor(this.x + r * p.cos(a));
        let y = p.floor(this.y + r * p.sin(a));
        let newDot = p.createVector(x, y);
        this.dots.push(newDot);
      }
    };

    move() {
      // move along gradient (toward brighter areas)
      // get gradient of brightness at player position
      const gx =
        p.getBrightness(this.x + 5, this.y) -
        p.getBrightness(this.x - 5, this.y);
      const gy =
        p.getBrightness(this.x, this.y + 5) -
        p.getBrightness(this.x, this.y - 5);

      const len = p.sqrt(gx * gx + gy * gy);
      if (len > 0) {
        this.x += (gx / len) * this.speed;
        this.y += (gy / len) * this.speed;
      }

      if (p.keyIsDown(87)) this.y -= this.speed; // W
      if (p.keyIsDown(83)) this.y += this.speed; // S
      if (p.keyIsDown(65)) this.x -= this.speed; // A
      if (p.keyIsDown(68)) this.x += this.speed; // D

      this.x = p.constrain(this.x, 0, p.width - 1);
      this.y = p.constrain(this.y, 0, p.height - 1);

      this.randomMove();
    }

    randomMove() {
      this.x += p.random(-0.5, 0.5);
      this.y += p.random(-0.5, 0.5);
    }
  }

  p.setup = () => {
    p.createCanvas(800, 800);

    const cellSize = p.width / level;

    featurePoints = p.getFeaturePoints(cellSize);
    buffer = p.drawScene(featurePoints, cellSize);

    //spawn player at random feature point
    const spawnPoint = featurePoints[p.floor(p.random(featurePoints.length))];
    player = new Player(spawnPoint.x, spawnPoint.y);

    buffer.loadPixels();
    p.frameRate(60);
  };

  p.draw = () => {
    p.image(buffer, 0, 0);

    player.move();

    // check stuck
    // check dead

    player.draw();
  };

  p.getFeaturePoints = (cellSize) => {
    const points = [];

    const cols = p.ceil(p.width / cellSize);
    const rows = p.ceil(p.height / cellSize);

    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < rows; x++) {
        points.push({
          x: p.floor(x * cellSize + p.random(cellSize)),
          y: p.floor(y * cellSize + p.random(cellSize)),
        });
      }
    }

    return points;
  };

  //get brightness of a single pixel
  p.getBrightness = (x, y) => {
    x = p.constrain(Math.floor(x), 0, p.width - 1);
    y = p.constrain(Math.floor(y), 0, p.height - 1);
    const idx = 4 * (x + y * p.width);
    const r = buffer.pixels[idx];
    const g = buffer.pixels[idx + 1];
    const b = buffer.pixels[idx + 2];
    return (r + g + b) / 3;
  };

  //draw the Voronoi diagram scene
  p.drawScene = (points, cellSize) => {
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
        const c = p.map(minDist, 2, cellSize, 0, 255);
        const i = 4 * (y * p.width + x);
        buf.pixels[i] = c;
        buf.pixels[i + 1] = c;
        buf.pixels[i + 2] = c;
        buf.pixels[i + 3] = c / (c + 1);
      }
    }

    buf.updatePixels();
    return buf;
  };
}
