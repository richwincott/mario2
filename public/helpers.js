class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x * TIME.delaTime;
    this.y += vector.y * TIME.delaTime;
  }

  multi(amount) {
    this.x *= amount;
    this.y *= amount;
  }
}

class Time {
  constructor(func) {
    this.lastTime = 0;
    this.delaTime = 0;
    this.accumulator = 0;
    this.step = 1 / 60;
    this.func = func;
    this.start();
  }

  start() {
    const loop = (time) => {
      if (PAUSED) return;
      if (this.previous) {
        this.func((time - this.previous) / 1000);
      }
      this.previous = time;
      requestAnimationFrame(loop);
    }
    loop();
  }

  simulate(deltaTime, cb) {
    this.accumulator += deltaTime;
    while (this.accumulator > this.step) {
      this.delaTime = this.step;
      cb(this.step);
      this.accumulator -= this.step;
    }
  }
}

function constrain(value, min, max) {
  if (value < min) return min;
  else if (value > max) return max;
  else return value;
}

function text(value, x, y) {
  ctx.fillText(typeof value != "string" ? JSON.stringify(value) : value, x, y);
}

function map(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function processImage(image) {
  return new Promise((resolve, reject) => {
    image.blob().then((blob) => {
      blob.arrayBuffer().then((buffer) => {
        const content = new Uint8Array(buffer);
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([content.buffer], { type: blob.type } /* (1) */));
        img.onload = () => {
          resolve(img);
        }
      })
    })
  })
}

function processLevel(level) {
  return new Promise((resolve, reject) => {
    level.json().then((json) => {
      resolve(json);
    })
  })
}

function processSpriteBoard(spriteImage, w, h, r, c, offsetX, offsetY) {
  return new Promise((resolve, reject) => {
    processImage(spriteImage).then((img) => {
      const imgs = [];
      for (var i = 0; i < r; i++) {
        for (var j = 0; j < c; j++) {
          const sprite = document.createElement('canvas');
          const sctx = sprite.getContext("2d");
          sprite.width = w;
          sprite.height = h;
          sctx.drawImage(img, (w * j) + offsetX, (h * i) + offsetY, w, h, 0, 0, w, h);
          imgs.push(sprite);
        }
      }
      resolve(imgs);
    })
  })
}

function doBoxesIntersect(a, b, viewport) {
  return (Math.abs((a.pos.x + (a.w / 2)) - ((b.pos.x + viewport.x) + (b.w / 2))) * 2 <= (a.w + b.w)) &&
    (Math.abs((a.pos.y + (a.h / 2)) - (b.pos.y + (b.h / 2))) * 2 <= (a.h + b.h));
}

function flipImg(img) {
  const flippedImg = document.createElement('canvas');
  flippedImg.width = img.width;
  flippedImg.height = img.height;
  const ictx = flippedImg.getContext("2d");
  ictx.translate(img.width, 0);
  ictx.scale(-1, 1);
  ictx.drawImage(img, 0, 0);
  return flippedImg;
}

export {
  Vector,
  Time,
  constrain,
  text,
  map,
  processLevel,
  processImage,
  processSpriteBoard,
  doBoxesIntersect,
  flipImg
}