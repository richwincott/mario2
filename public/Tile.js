import { text, Vector } from './helpers.js';

export default class Tile {
  constructor(x, y, w, h, passable, img, collisionActions) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.w = w;
    this.h = h;
    this.passable = passable;
    this.collisionActions = collisionActions;
    this.img = img;
    this.colliding = false;
    this.collidingCounter = 0;
  }

  show(viewport, debug) {
    if (this.colliding) this.collidingCounter++;
    if (this.collidingCounter > 10 && !debug) {
      this.collidingCounter = 0;
      this.colliding = false;
    }
    ctx.drawImage(this.img, this.pos.x + viewport.x, this.pos.y, this.w, this.h);
    if (this.colliding && debug) {
      ctx.strokeStyle = "#F00";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.pos.x + viewport.x, //this.h > 50 ? this.pos.x : this.pos.x + 20,
        this.pos.y,
        this.w - 1, //this.h > 50 ? this.w : this.w - 40,
        this.h
      );
    }
  }
}