import Tile from './Tile.js';
import Mario from './Mario.js';
import Koopa from './Koopa.js';
import { Time, text, constrain, Vector, processLevel, processImage, processSpriteBoard, pixelValueToGridPosition, loadAssets } from './helpers.js';
import Pickup from './Pickup.js';
import FireBall from './FireBall.js';

let canvas;
let preRenderedTiles;
let player;
let others = [];
let tiles = [];
let viewport = new Vector(0, 0);
let viewportV = new Vector(0, 0);
let bgImg;
let bgImgs;
let debug = false;
let koopaImages;
let level;
let passableTiles = [125, 126, 127, 70, 16, 17, 18, 7, 22, 23, 93, 94, 95, 141, 142, 143, 77, 78, 79, 109, 110, 111, 3, 260];
let movableTiles = [267, 262]; //266 remove as handle specifically
//let idleCounter = 0;

window.GRAVITY = 20;
window.MOVE_SPEED = 140;
window.JUMP_HEIGHT = 400;
window.LEVEL_NAME = "1";
//window.PAUSED = false;

/* setInterval(() => {
  idleCounter++
  if (idleCounter > 59) PAUSED = true;
  else if (idleCounter == 1 && PAUSED) {
    PAUSED = false;
    TIME.start();
  }
}, 1000); */

function preload(callback) {
  loadAssets([
    ['mario_sheet.png', processSpriteBoard, 40, 40, 22, 9, 0, 0],
    ['enemies_sheet.png', processSpriteBoard, 40, 40, 11, 9, 0, 0],
    ['bg.png', processSpriteBoard, 16, 16, 16, 16, 0, 0],
    ['misc.png', processSpriteBoard, 23, 22, 1, 19, 30, 429],
    ['bg-plain.png', processImage],
    [`levels/${LEVEL_NAME}.json`, processLevel]
  ]).then((assets) => callback(assets));
}

function preRenderTiles() {
  const canvas = document.createElement("canvas");
  canvas.width = 16 * 245;
  canvas.height = 16 * 28;
  const ctx = canvas.getContext("2d");
  for (let tile of tiles) {
    tile.show(ctx);
  }
  return canvas;
}

function setup([mImgs, eImgs, bgs, bg, level1], callback) {
  canvas = document.getElementById("canvas");
  canvas.width = 800;
  canvas.height = 447;
  window.WIDTH = canvas.width;
  window.HEIGHT = canvas.height;
  window.ctx = canvas.getContext("2d");
  bgImg = bg;
  bgImgs = bgs;
  canvas.addEventListener('click', mouseClick);
  level = level1;
  const playerImages = {
    run: [mImgs[22], mImgs[19], mImgs[18]],
    crouch: mImgs[29],
    jump: [mImgs[31], mImgs[30]],
    dead: mImgs[9]
  }
  const playerImagesFire = {
    run: [mImgs[103], mImgs[100], mImgs[99]],
    crouch: mImgs[110],
    jump: [mImgs[112], mImgs[111]],
    dead: mImgs[9]
  }
  player = new Mario(20, 30, playerImages, playerImagesFire);
  koopaImages = {
    run: [eImgs[3], eImgs[2]],
  }
  for (let i = 0; i < level.length; i++) {
    for (let j = 0; j < level[i].length; j++) {
      if (level[i][j]) {
        spawnTile(level, i, j);
      }
    }
  }
  setTimeout(() => {
    preRenderedTiles = preRenderTiles();
  }, 0)
  setInterval(() => {
    if (Math.random() < 0.3 && ENEMY_SPAWNING)
      others.push(new Koopa(canvas.width - viewport.x, 30, koopaImages, -1));
  }, 1000);
  callback();
}

function spawnTile(level, i, j) {
  let existing = tiles.filter((tile) => {
    const middle = { x: tile.pos.x + (tile.w / 2), y: tile.pos.y + (tile.h / 2) };
    return middle.x > j * 16 && middle.x < (j * 16) + 16
      && middle.y > i * 16 && middle.y < (i * 16) + 16;
  })[0];
  //console.log("existing", existing)
  if (level[i][j]) {
    const pickupTileLeft = (other, overlap, entity) => {
      entity.pos.x += Math.abs(overlap.x);
      if (entity.hold && entity.holding == null) {
        entity.holding = other;
        others.splice(others.indexOf(other), 1);
      }
    }
    const pickupTileRight = (other, overlap, entity) => {
      entity.pos.x -= Math.abs(overlap.x);
      if (entity.hold && entity.holding == null) {
        entity.holding = other;
        others.splice(others.indexOf(other), 1);
      }
    }
    if (level[i][j] == 2) {
      const increaseHealth = (other, overlap, entity) => {
        if (entity instanceof Mario) {
          others.splice(others.indexOf(other), 1);
          player.health++;
        }
      }
      const collectFireBalls = (other, overlap, entity) => {
        if (entity instanceof Mario) {
          others.splice(others.indexOf(other), 1);
          player.powerups.push("FireBalls");
        }
      }
      const spawnItem = (other, overlap, entity) => {
        if (entity instanceof Mario) {
          const randomNo = Math.random() < 0.5;
          const collectAction = randomNo < 0.5 ? increaseHealth : collectFireBalls;
          entity.pos.y += Math.abs(overlap.y);
          entity.vel.y = constrain(entity.vel.y, 0, 9999);
          others.push(new Pickup(j, i - 2, { run: [bgImgs[randomNo < 0.5 ? 260 : 256]] }, -1, {
            top: collectAction, bottom: collectAction, left: collectAction, right: collectAction
          }, 0));
        }
      }
      tiles.push(new Tile(j, i, false, bgImgs[level[i][j]], {
        top: spawnItem, bottom: null, left: null, right: null
      }));
    }
    else if (level[i][j] == 7) {
      const collectCoin = (other, overlap, entity) => {
        if (entity instanceof Mario) {
          others.splice(others.indexOf(other), 1);
          player.score += 20;
        }
      }
      others.push(new Pickup(j, i, { run: [bgImgs[7]] }, 0, {
        top: collectCoin, bottom: collectCoin, left: collectCoin, right: collectCoin
      }, 0, 0));
    }
    else if (level[i][j] == 266) {
      const bounce = (other, overlap, entity) => {
        entity.pos.y -= Math.abs(overlap.y);
        entity.vel.y = constrain(entity.vel.y, -9999, 0);
        entity.airBourne = false;
        entity.jump(JUMP_HEIGHT * 2);
      }
      others.push(new Pickup(j, i, { run: [bgImgs[266]] }, 0, {
        top: null, bottom: bounce, left: pickupTileLeft, right: pickupTileRight
      }, 0));
    }
    else if (level[i][j] == 14 || level[i][j] == 15) {
      const pipe = (other, overlap, entity) => {
        entity.airBourne = false;
        entity.pos.y -= Math.abs(overlap.y);
        entity.vel.y = constrain(entity.vel.y, -9999, 0);
        if (entity.crouch) {
          entity.pos.x = canvas.width / 4;
          entity.crouch = false;
          viewport.x = -1295;
        }
      }
      tiles.push(new Tile(j, i, false, bgImgs[level[i][j]], {
        top: null, bottom: pipe, left: null, right: null
      }));
    }
    else if (movableTiles.includes(level[i][j])) {
      others.push(new Pickup(j, i, { run: [bgImgs[level[i][j]]] }, 0, {
        top: null, bottom: (other, overlap, entity) => {
          entity.airBourne = false;
          entity.pos.y -= Math.abs(overlap.y);
          entity.vel.y = constrain(entity.vel.y, -9999, 0);
        }, left: pickupTileLeft, right: pickupTileRight
      }, 0));
    }
    else {
      if (existing) tiles[tiles.indexOf(existing)] = new Tile(j, i, passableTiles.includes(level[i][j]), bgImgs[level[i][j]]);
      else tiles.push(new Tile(j, i, passableTiles.includes(level[i][j]), bgImgs[level[i][j]]));
    }
  }
  else {
    if (existing) tiles.splice(tiles.indexOf(existing), 1);
  }
  if (editMode) {
    preRenderedTiles = preRenderTiles()
  }
}

function update(deltaTime) {
  player.update(viewport);
  player.tileCollisions(tiles, viewport);
  player.otherCollisions(others, viewport);

  for (let other of others) {
    if (other.alive == false) others.splice(others.indexOf(other), 1);
    other.update();
    if (other.additionalUpdate)
      other.additionalUpdate();
    if (other.tileCollisions)
      other.tileCollisions(tiles, { x: 0 });
  }

  viewport.add(viewportV);
  if (player.pos.x > (canvas.width / 2) - (player.w + 1)) {
    viewportV.x = player.vel.x == 0 ? 0 : -MOVE_SPEED;
  }
  else if (player.pos.x == (canvas.width / 4) && viewport.x < 0) {
    viewportV.x = player.vel.x == 0 ? 0 : MOVE_SPEED;
  }
  else {
    viewportV.x = 0;
  }

  if (debug) {
    for (let tile of tiles) {
      tile.update();
    }
  }

  if (player.holding != null && player.hold == false) {
    const pos = pixelValueToGridPosition(level, player.pos.x - viewport.x, player.pos.y + (player.h / 2));
    let temp_level = JSON.parse(JSON.stringify(level));
    const x = player.dir > 0 ? pos.x : pos.x + 1;
    const y = pos.y;
    temp_level[y][x] = parseInt(player.holding.images.run[0].getAttribute('title'));
    spawnTile(temp_level, y, x);
    player.holding = null;
  }

  if (player.action && player.powerups.includes("FireBalls") && (Math.floor((Math.floor(TIME.lastTime) % 40) / 10) == 1)) {
    const pos = pixelValueToGridPosition(level, player.pos.x - viewport.x, player.pos.y);
    const x = player.dir > 0 ? pos.x - 1 : pos.x + 2;
    const y = pos.y;
    others.push(new FireBall(x, y, { run: [bgImgs[272], bgImgs[273], bgImgs[274]] }, -player.dir, {
      top: () => null, bottom: () => null, left: () => null, right: () => null
    }));
  }
}

function draw(deltaTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 5; i++) {
    ctx.drawImage(bgImg, (i * bgImg.width) + (viewport.x * 0.8), 0);
  }
  if (editMode) {
    for (let i = 0; i < level.length; i++) {
      for (let j = 0; j < level[i].length; j++) {
        if (!level[i][j]) {
          ctx.strokeStyle = "#ccc";
          ctx.lineWidth = 0.5;
          ctx.strokeRect((j * 16) + viewport.x, i * 16, 17, 16);
        }
      }
    }
  }
  ctx.drawImage(preRenderedTiles, viewport.x, 0);
  if (debug) {
    for (let tile of tiles) {
      tile.showDebug(viewport);
    }
  }
  player.show(Math.floor((Math.floor(TIME.lastTime) % 300) / 100), debug);
  for (let other of others) {
    other.show(Math.floor((Math.floor(TIME.lastTime) % 200) / 100), viewport);
    if (debug && other.showDebug) {
      other.showDebug(viewport);
    }
  }
  text("Health: " + player.health + "       Score: " + player.score + "       Time: " + TIME.time + "       FPS: " + Math.floor(1 / deltaTime) + "       Entities: " + others.length + "       Tiles: " + tiles.length, 10, 20);
}

preload((assets) => {
  setup(assets, () => {
    window.TIME = new Time((deltaTime) => {
      TIME.simulate(deltaTime, (stableDelta) => update(stableDelta));
      draw(deltaTime);
    });
  });
})

function keyPressed(ev) {
  if (ev.key == 'w' || ev.key == ' ' || ev.key == 'ArrowUp') {
    player.jump();
  }
  if (ev.key == 'd' || ev.key == 'ArrowRight') {
    player.move(MOVE_SPEED, 0);
  }
  if (ev.key == 'a' || ev.key == 'ArrowLeft') {
    player.move(-MOVE_SPEED, 0);
  }
  if (ev.key == 's' || ev.key == 'ArrowDown') {
    player.setCrouch(true);
  }
  if (ev.key == 'e') {
    player.triggerAction(true);
  }
  if (ev.key == 'k') {
    debug = true;
  }
}

function keyReleased(ev) {
  //idleCounter = 0;
  if (ev.key == 'd' || ev.key == 'a' || ev.key == 'ArrowLeft' || ev.key == 'ArrowRight') {
    player.vel.x = 0;
  }
  if (ev.key == 's' || ev.key == 'ArrowDown') {
    player.setCrouch(false);
  }
  if (ev.key == 'e') {
    player.triggerAction(false);
    if (player.hold) player.setHolding(false);
    else player.setHolding(true);
  }
  if (ev.key == 'k') {
    debug = false;
  }
}

function mouseClick(ev) {
  /* if (PAUSED) {
    idleCounter = 0;
    return;
  } */
  if (editMode) {
    const mouseX = ev.offsetX - viewport.x;
    const mouseY = ev.offsetY;
    for (let i = 0; i < level.length; i++) {
      for (let j = 0; j < level[i].length; j++) {
        if (mouseX > j * 16 && mouseX < (j * 16) + 16) {
          if (mouseY > i * 16 && mouseY < (i * 16) + 16) {
            //console.log({ currentValue: level[i][j], newValue: SELECTED_TILE_INDEX })
            level[i][j] = SELECTED_TILE_INDEX;
            spawnTile(level, i, j);
          }
        }
      }
    }
  }
  else {
    others.push(new Koopa(ev.offsetX - viewport.x, ev.offsetY, koopaImages, player.pos.x < ev.offsetX - viewport.x ? -1 : 1));
  }
  /* player.vel = new Vector(0, 0);
  player.pos.x = ev.offsetX;
  player.pos.y = ev.offsetY; */
}

window.addEventListener('keydown', keyPressed);
window.addEventListener('keyup', keyReleased);




// OTHER FUNCTIONS

let editMode = false;
window.ENEMY_SPAWNING = false;
window.SELECTED_TILE_INDEX = null;

function toggleEnemySpawning(event) {
  ENEMY_SPAWNING = !ENEMY_SPAWNING;
  if (ENEMY_SPAWNING) {
    event.target.innerText = "Disable enemy auto spawning";
  }
  if (!ENEMY_SPAWNING) {
    event.target.innerText = "Enable enemy auto spawning";
  }
}

function toggleEditMode(event) {
  editMode = !editMode;
  if (editMode) {
    event.target.innerText = "Disable edit mode";
    for (let i = 0; i < document.getElementsByClassName("sprites").length; i++) {
      const element = document.getElementsByClassName("sprites")[i];
      element.style.display = "block";
    }
    document.getElementById("save-level-btn").style.display = "inline-block";
  }
  if (!editMode) {
    event.target.innerText = "Enable edit mode";
    for (let i = 0; i < document.getElementsByClassName("sprites").length; i++) {
      const element = document.getElementsByClassName("sprites")[i];
      element.style.display = "none";
    }
    document.getElementById("save-level-btn").style.display = "none";
  }
}

function saveLevel(event) {
  fetch(`/save/${LEVEL_NAME}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(level)
  }).then((res) => {
    //console.log(res);
  }, (err) => {
    console.log("Failed: " + err.message);
  })
}

Object.assign(window, { toggleEditMode, toggleEnemySpawning, saveLevel })