import { Vector, constrain, doBoxesIntersect, text } from './helpers.js';

export default class Player {
  constructor(x, y, images) {
    this.prev = new Vector(x, y);
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.dir = -1;
    this.w = 20;
    this.h = 30;
    this.crouch = false;
    this.images = images;
    this.images.crouchFlipped = this.flipImg(images.crouch);
    this.images.runFlipped = images.run.map((img) => this.flipImg(img))
  }

  flipImg(img) {
    const flippedImg = document.createElement('canvas');
    flippedImg.width = img.width;
    flippedImg.height = img.height;
    const ictx = flippedImg.getContext("2d");
    ictx.translate(img.width, 0);
    ictx.scale(-1, 1);
    ictx.drawImage(img, 0, 0);
    return flippedImg;
  }

  update(platforms, viewport) {
    this.vel.y += this.crouch ? GRAVITY * 3 : GRAVITY;
    this.prev = new Vector(this.pos.x, this.pos.y);
    this.pos.add(this.vel);
    this.pos.x = constrain(this.pos.x, 0, canvas.width - this.w);
    this.pos.y = constrain(this.pos.y, 0, canvas.height - this.h);
    this.vel.x = constrain(this.vel.x, -MOVE_SPEED, MOVE_SPEED);
  }

  collisions(platforms, viewport) {
    platforms.forEach((platform) => {
      if (doBoxesIntersect(this, platform, viewport)) {
        platform.colliding = true;
        const platXPlusViewport = platform.pos.x - viewport.x
        const distX = (this.pos.x + this.w) < platXPlusViewport + (platform.w / 2) ? (this.pos.x + this.w) - platform.pos.x
          : this.pos.x > platXPlusViewport + (platform.w / 2) ? this.pos.x - (platform.pos.x + platform.w)
            : undefined;
        const distY = (this.pos.y + this.h) < platform.pos.y + (platform.h / 2) ? (this.pos.y + this.h) - platform.pos.y
          : this.pos.y > platform.pos.y + (platform.h / 2) ? this.pos.y - (platform.pos.y + platform.h)
            : undefined;
        const overlap = {
          x: distX - viewport.x,
          y: distY,
        }
        window.overlap = overlap;
        if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
          if (overlap.y < 0) {
            console.log("top", overlap.y)

            this.pos.y += Math.abs(overlap.y);
            this.vel.y = constrain(this.vel.y, 0, 9999);
          }
          else {

            this.pos.y -= Math.abs(overlap.y);
            this.vel.y = constrain(this.vel.y, -9999, 0);
          }
        }
        else {
          if (overlap.x < 0) {
            console.log("right", overlap.x)

            //this.pos.x += Math.abs(overlap.x);
          }
          else {
            this.pos.x -= Math.abs(overlap.x);
          }
        }
      }
    })
  }

  jump() {
    this.airBourne = true;
    this.vel.y = -JUMP_HEIGHT;
  }

  setCrouch(value) {
    this.crouch = value;
  }

  move(x, y) {
    /* const force = new Vector(x, y);
    this.vel.add(force); */
    this.vel.x = x;
    this.dir = this.vel.x < 0 ? 1 : -1;
  }

  show(index) {
    const runKey = this.dir == 1 ? 'run' : 'runFlipped';
    const crouchKey = this.dir == 1 ? 'crouch' : 'crouchFlipped';
    let img = this.vel.x != 0 ? this.images[runKey][index] : this.images[runKey][0];
    let yOffset = 5;
    if (this.crouch) {
      img = this.images[crouchKey];
      yOffset = -2;
    }
    ctx.drawImage(img, this.pos.x - 10, this.pos.y - yOffset, img.width, img.height);
  }
}