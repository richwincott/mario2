import Tile from './Tile.js';
import Mario from './Mario.js';
import Koopa from './Koopa.js';
import { Time, text, map, Vector, processLevel, processImage, processSpriteBoard } from './helpers.js';

let canvas;
let player;
let enemies = [];
let tiles = [];
let viewport = new Vector(0, 0);
let viewportV = new Vector(0, 0);
let bgImg;
let bgImgs;
let debug = false;
let koopaImages;
let level;
let passableTiles = [125, 126, 127, 70, 16, 17, 18, 7, 22, 23, 93, 94, 95, 141, 142, 143, 77, 78, 79, 109, 110, 111, 3];

window.GRAVITY = 20;
window.MOVE_SPEED = 140;
window.JUMP_HEIGHT = 400;
window.LEVEL_NAME = "1";

function preload(callback) {
  Promise.all([
    fetch('mario_sheet.png'),
    fetch('enemies_sheet.png'),
    fetch('bg.png'),
    fetch('misc.png'),
    fetch('bg-plain.png'),
    fetch(`levels/${LEVEL_NAME}.json`)])
    .then(([marioSheet, enemiesSheet, bgSheet, miscSheet, bg, level1]) => {
      Promise.all([
        processSpriteBoard(marioSheet, 40, 40, 11, 9, 0, 0),
        processSpriteBoard(enemiesSheet, 40, 40, 11, 9, 0, 0),
        processSpriteBoard(bgSheet, 16, 16, 16, 16, 0, 0, true),
        processSpriteBoard(miscSheet, 23, 22, 1, 16, 30, 429, true),
        processImage(bg),
        processLevel(level1)])
        .then(([mImgs, eImgs, bgs, ms, bg, level1]) => {
          const tiles = [...bgs, ...ms];
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
          callback(mImgs, eImgs, tiles, bg, level1)
        });
    })
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
  player = new Mario(20, 30, playerImages);
  koopaImages = {
    run: [eImgs[3], eImgs[2]],
  }
  for (let i = 0; i < level.length; i++) {
    for (let j = 0; j < level[i].length; j++) {
      if (level[i][j]) {
        const dim = { x: bgImgs[level[i][j]].width, y: bgImgs[level[i][j]].height };
        if (level[i][j] == 7) {
          const collectCoin = (other, overlap, character) => {
            if (character instanceof Mario) {
              tiles.splice(tiles.indexOf(other), 1);
              player.score += 20;
            }
          }
          tiles.push(new Tile(j * dim.x, i * dim.y, dim.x + 1, dim.y, false, bgImgs[level[i][j]], {
            top: collectCoin, bottom: collectCoin, left: collectCoin, right: collectCoin
          }));
        }
        else {
          tiles.push(new Tile(j * 16, i * 16, dim.x + 1, dim.y, passableTiles.includes(level[i][j]), bgImgs[level[i][j]]));
        }
      }
    }
  }
  setInterval(() => {
    if (Math.random() < 0.3 && ENEMY_SPAWNING)
      enemies.push(new Koopa(canvas.width - viewport.x, 30, koopaImages, -1));
  }, 1000);
  callback();
}

function update(deltaTime) {
  player.update(viewport);
  player.tileCollisions(tiles, viewport);
  player.enemyCollisions(enemies, viewport);
  for (let enemy of enemies) {
    enemy.update();
    enemy.tileCollisions(tiles, { x: 0 });
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
}

function draw() {
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
  for (let tile of tiles) {
    tile.show(viewport, debug);
  }
  player.show(Math.floor((Math.floor(TIME.previous) % 300) / 100));
  for (let enemy of enemies) {
    enemy.show(Math.floor((Math.floor(TIME.previous) % 200) / 100), viewport);
  }
  text("Health: " + player.health + "       Score: " + player.score, 10, 20);
}

preload((...assets) => {
  setup([...assets], () => {
    window.TIME = new Time((deltaTime) => {
      TIME.simulate(deltaTime, (stableDelta) => update(stableDelta));
      draw();
    });
  });
})

function keyPressed(ev) {
  if (ev.key == 'w' || ev.key == ' ') {
    player.jump();
  }
  if (ev.key == 'd') {
    player.move(MOVE_SPEED, 0);
  }
  if (ev.key == 'a') {
    player.move(-MOVE_SPEED, 0);
  }
  if (ev.key == 's') {
    player.setCrouch(true);
  }
  if (ev.key == 'k') {
    debug = true;
  }
}

function keyReleased(ev) {
  if (ev.key == 'd' || ev.key == 'a') {
    player.vel.x = 0;
  }
  if (ev.key == 's') {
    player.setCrouch(false);
  }
  if (ev.key == 'k') {
    debug = false;
  }
}

function mouseClick(ev) {
  if (editMode) {
    const mouseX = ev.offsetX - viewport.x;
    const mouseY = ev.offsetY;
    for (let i = 0; i < level.length; i++) {
      for (let j = 0; j < level[i].length; j++) {
        if (mouseX > j * 16 && mouseX < (j * 16) + 16) {
          if (mouseY > i * 16 && mouseY < (i * 16) + 16) {
            //console.log({ currentValue: level[i][j], newValue: SELECTED_TILE_INDEX })
            level[i][j] = SELECTED_TILE_INDEX;
            let existing = tiles.filter((tile) => tile.pos.x == j * 16 && tile.pos.y == i * 16)[0];
            //console.log("existing", existing)
            if (level[i][j]) {
              if (existing) tiles[tiles.indexOf(existing)] = new Tile(j * 16, i * 16, 17, 16, passableTiles.includes(level[i][j]), bgImgs[level[i][j]]);
              else tiles.push(new Tile(j * 16, i * 16, 17, 16, passableTiles.includes(level[i][j]), bgImgs[level[i][j]]));
            }
            else {
              if (existing) tiles.splice(tiles.indexOf(existing), 1);
            }
          }
        }
      }
    }
  }
  else {
    enemies.push(new Koopa(ev.offsetX - viewport.x, ev.offsetY, koopaImages, player.pos.x < ev.offsetX - viewport.x ? -1 : 1));
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