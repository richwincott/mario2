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
  ctx.fillText(JSON.stringify(value), x, y);
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

function processSpriteBoard(spriteImage, w, h, r, c, preview = false) {
  return new Promise((resolve, reject) => {
    processImage(spriteImage).then((img) => {
      const imgs = [];
      for (var i = 0; i < r; i++) {
        for (var j = 0; j < c; j++) {
          const sprite = document.createElement('canvas');
          const sctx = sprite.getContext("2d");
          sprite.width = w;
          sprite.height = h;
          sctx.drawImage(img, w * j, h * i, w, h, 0, 0, w, h);
          if (preview) {
            sprite.setAttribute('title', (i + 1) * (j + 1));
            document.body.appendChild(sprite)
          }
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

export {
  Vector,
  Time,
  constrain,
  text,
  processLevel,
  processImage,
  processSpriteBoard,
  doBoxesIntersect
}