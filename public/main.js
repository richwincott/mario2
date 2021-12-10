import Platform from './Platform.js';
import Player from './Player.js';
import { Time, text, Vector, processLevel, processImage, processSpriteBoard } from './helpers.js';

let canvas;
let player;
let platforms = [];
let viewport = new Vector(0, 0);
let bgImg;
let debug = false;

window.GRAVITY = 20;
window.MOVE_SPEED = 220;
window.JUMP_HEIGHT = 450;

function preload(callback) {
  Promise.all([fetch('mario_sprite.png'), fetch('bg.png'), fetch('bg-plain.png'), fetch('levels/1.json')])
    .then(([marioSprite, bgSprite, bg, level1]) => {
      Promise.all([processSpriteBoard(marioSprite, 40, 40, 11, 9), processSpriteBoard(bgSprite, 32, 32, 17, 16), processImage(bg), processLevel(level1)])
        .then(([mImgs, bgImgs, bg, level1]) => callback(mImgs, bgImgs, bg, level1));
    })
}

function setup([mImgs, bgImgs, bg, level1], callback) {
  canvas = document.getElementById("canvas");
  canvas.addEventListener('click', mouseClick);
  canvas.width = 800;
  canvas.height = 447;
  window.WIDTH = canvas.width;
  window.HEIGHT = canvas.height;
  window.ctx = canvas.getContext("2d");
  bgImg = bg;
  const playerImages = {
    run: [mImgs[22], mImgs[19], mImgs[18]],
    crouch: mImgs[29]
  }
  player = new Player(10, 10, playerImages);
  for (let i = 0; i < level1.length; i++) {
    for (let j = 0; j < level1[i].length; j++) {
      if (level1[i][j]) {
        platforms.push(new Platform(j * 32, i * 32, 33, 33, bgImgs[level1[i][j]]));
      }
    }
  }
  callback();
}

function update(deltaTime) {
  player.update(platforms, viewport);
  player.collisions(platforms, viewport);
  if (player.pos.x > 100) {
    viewport.x = -player.pos.x * 0.7;
  }
  else viewport.x = -70;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 5; i++) {
    ctx.drawImage(bgImg, (i * bgImg.width) + (viewport.x * 0.8), 0);
  }
  for (let platform of platforms) {
    platform.show(viewport, debug);
  }
  player.show(Math.floor((Math.floor(TIME.previous) % 300) / 100));
  text(viewport, 10, 20);
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
  player.vel = new Vector(0, 0);
  player.pos.x = ev.offsetX;
  player.pos.y = ev.offsetY;
}

window.addEventListener('keydown', keyPressed);
window.addEventListener('keyup', keyReleased);
