class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x * GAME.delaTime;
    this.y += vector.y * GAME.delaTime;
  }

  multi(amount) {
    this.x *= amount;
    this.y *= amount;
  }
}

class Game {
  constructor(update, draw) {
    this.lastTime = 0;
    this.delaTime = 0;
    this.accumulator = 0;
    this.step = 1 / 60;
    this.update = update;
    this.draw = draw;
    this.time = 0
    this.loop();

    setInterval(() => {
      this.time++;
    }, 1000);
  }

  loop(time) {
    if (PAUSED) return;
    if (this.lastTime) {
      const unStableDelta = (time - this.lastTime) / 1000;
      this.simulate(unStableDelta, (stable) => {
        this.update(stable)
        this.draw(stable)
      })
    }
    this.lastTime = time;
    requestAnimationFrame(this.loop.bind(this));
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

function loadAssets(assets) {
  return new Promise((resolve, reject) => {
    Promise.all(assets.map(([url]) => fetch(url))).then((data) => {
      Promise.all(assets.map(([url, processingFnc, tileSizeX, tileSizeY, rows, cols, offsetX, offsetY], index) => {
        return processingFnc(data[index], tileSizeX, tileSizeY, rows, cols, offsetX, offsetY)
      })).then(([mImgs, eImgs, bgs, ms, gun, bg, level1]) => {
        const tiles = [...bgs, ...ms, ...gun];
        addTilesToPage(tiles);
        resolve([mImgs, eImgs, tiles, bg, level1])
      })
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
  flippedImg.className = img.className;
  flippedImg.setAttribute('title', img.getAttribute('title'));
  return flippedImg;
}

function pixelValueToGridPosition(level, x, y) {
  for (let i = 0; i < level.length; i++) {
    for (let j = 0; j < level[i].length; j++) {
      if (x > j * 16 && x < (j * 16) + 16 && y > i * 16 && y < (i * 16) + 16) return { x: j, y: i };
    }
  }
  return { x: null, y: null };
}

function addTilesToPage(tiles) {
  const div = document.createElement("div");
  div.className = "sprites";
  let i = 0;
  for (let sprite of tiles) {
    sprite.setAttribute('title', i);
    sprite.className = "sprite";
    sprite.addEventListener('click', () => {
      for (let i = 0; i < document.getElementsByClassName("sprite").length; i++) {
        const element = document.getElementsByClassName("sprite")[i];
        element.removeAttribute("style");
      }
      sprite.style.border = "3px solid rgb(242 44 255)";
      console.log("SELECTED_TILE_INDEX = " + sprite.getAttribute('title'));
      SELECTED_TILE_INDEX = parseInt(sprite.getAttribute('title'));
    });
    div.appendChild(sprite);
    i++;
  }
  document.body.appendChild(div);
}

export {
  Vector,
  Game,
  constrain,
  text,
  map,
  processLevel,
  processImage,
  processSpriteBoard,
  doBoxesIntersect,
  flipImg,
  pixelValueToGridPosition,
  loadAssets
}