import { flipImg } from './helpers.js';
import Character from './Character.js';

export default class Mario extends Character {
  constructor(x, y, images, imagesFire) {
    super(x, y, images);
    this.crouch = false;
    this.hold = false;
    this.action = false;
    this.holding = null;
    this.powerups = [];
    this.images.crouchFlipped = flipImg(images.crouch);
    this.images.jumpFlipped = images.jump.map((img) => flipImg(img))
    this.imagesFire = imagesFire;
    this.imagesFire.runFlipped = imagesFire.run.map((img) => flipImg(img))
    this.imagesFire.crouchFlipped = flipImg(imagesFire.crouch);
    this.imagesFire.jumpFlipped = imagesFire.jump.map((img) => flipImg(img))
  }

  setCrouch(value) {
    this.crouch = value;
  }

  triggerAction(value) {
    this.action = value;
  }

  setHolding(value) {
    this.hold = value;
  }

  show(index, debug) {
    const runKey = this.dir == 1 ? 'run' : 'runFlipped';
    const crouchKey = this.dir == 1 ? 'crouch' : 'crouchFlipped';
    const jumpKey = this.dir == 1 ? 'jump' : 'jumpFlipped';
    const images = this.powerups.includes("FireBalls") ? this.imagesFire : this.images;
    let img = this.vel.x != 0 ? images[runKey][index] : images[runKey][0];
    let yOffset = 5;
    if (this.airBourne) {
      img = this.vel.y < 0 ? images[jumpKey][0] : images[jumpKey][1];
    }
    if (this.crouch) {
      img = images[crouchKey];
      yOffset = -2;
    }
    if (this.health == 0) {
      img = images.dead;
    }
    ctx.drawImage(img, (this.pos.x - 10), this.pos.y - yOffset, img.width, img.height);
    if (this.holding) {
      ctx.drawImage(this.holding.img, this.dir > 0 ? (this.pos.x - 15) : (this.pos.x + 10), this.pos.y + 10, this.holding.img.width, this.holding.img.height);
    }
    if (debug) {
      ctx.strokeStyle = "#F00";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.pos.x, //this.h > 50 ? this.pos.x : this.pos.x + 20,
        this.pos.y,
        this.w, //this.h > 50 ? this.w : this.w - 40,
        this.h
      );
    }
  }
}