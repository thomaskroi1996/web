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
  let notDead = true;
  let featurePoints; //array that holds Vectors
  let nFeaturePoints = 5;
  let buffer; //
  let player; //class
  let cellSize;
  let level = 1;
  let zIndex = 0; //variable for moving along "time dimension", for animation
  let zStep = 50;

  let colorSchemes = new Map();
  colorSchemes.set(0, p.floor(p.random(175, 255)));
  colorSchemes.set(0, p.floor(p.random(0, 175)));

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
      this.speed = 1;
      this.nParticles = 100;
      this.maxR = 500;
      this.dots = [];
    }

    draw() {
      this.makeParticles(this.nParticles);

      p.strokeWeight(2);
      p.stroke(255);
      for (let i = 0; i < this.nParticles; i++) {
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

      if (p.keyIsDown(87)) this.y -= this.speed * 1.2; // W
      if (p.keyIsDown(83)) this.y += this.speed * 1.2; // S
      if (p.keyIsDown(65)) this.x -= this.speed * 1.2; // A
      if (p.keyIsDown(68)) this.x += this.speed * 1.2; // D

      this.x = p.constrain(this.x, 0, p.width - this.maxR);
      this.y = p.constrain(this.y, 0, p.height - this.maxR);

      this.randomMove();
    }

    randomMove() {
      this.x += p.random(-1, 1);
      this.y += p.random(-1, 1);
    }
  }

  p.setupScene = () => {
    let level = p.random(1, 10);

    cellSize = (p.width / level) * 2;
    featurePoints = p.getFeaturePoints(cellSize);
    buffer = p.drawScene(featurePoints, cellSize);

    //spawn player at random feature point
    let spawnPoint = featurePoints[p.floor(p.random(featurePoints.length))];
    player = new Player(spawnPoint.x, spawnPoint.y);

    buffer.loadPixels();
  };

  p.setup = () => {
    p.createCanvas(400, 400);

    p.setupScene();

    p.frameRate(60);
  };

  p.draw = () => {
    p.image(buffer, 0, 0);

    player.move();

    // check stuck
    // check dead

    player.draw();
  };

  p.keyPressed = () => {
    if (p.key === "r" || p.key === "R") {
      p.setupScene();
    }
    if (p.keyCode === p.RIGHT_ARROW) {
      zIndex += zStep;
      console.log(zIndex);
      p.drawScene(featurePoints, zIndex);
    }
    if (p.keyCode === p.LEFT_ARROW) {
      zIndex -= zStep;
      p.drawScene(featurePoints, zIndex || 0);
    }
  };

  p.getFeaturePoints = (cellSize) => {
    const points = [];

    const cols = p.ceil(p.width / cellSize);
    const rows = p.ceil(p.height / cellSize);

    for (let i = 0; i < nFeaturePoints; i++) {
      points.push(
        p.createVector(
          p.random(p.width),
          p.random(p.height),
          p.random(p.width)
        )
      );
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
  p.drawScene = (points, zIndex) => {
    const buf = p.createGraphics(p.width, p.height);
    buf.pixelDensity(1);
    buf.loadPixels();

    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        let distances = points.map((v) =>
          p.dist(x, y, zIndex, v.x, v.y, v.z)
        );
        distances.sort((a, b) => a - b);

        let r = p.map(distances[0], 0, 800, 0, 255);
        let g = p.map(distances[1], 0, 800, 255, 0);
        let b = p.map(distances[2], 0, 600, 255, 0);

        let idx = 4 * (x + y * p.width);
        buf.pixels[idx] = r;
        buf.pixels[idx + 1] = g;
        buf.pixels[idx + 2] = b;
        buf.pixels[idx + 3] = 255;
      }
    }

    buf.updatePixels();

    return buf;
  };

  p.getColorValue = (minDist, cellSize, colorSchemes) => {
    const c = p.map(
      minDist,
      2,
      cellSize,
      0,
      colorSchemes.get(p.floor(p.random(0, colorSchemes.size - 1)))
    );

    if (p.random(1) >= 0.5) {
      if (p.random(1) <= 0.7) {
        return [c, 0, 255];
      } else {
        return [0, c, 150];
      }
    } else {
      if (p.random(1) >= 0.5) {
        return [0, 255, c];
      } else {
        return [255, 0, c];
      }
    }
  };
}
