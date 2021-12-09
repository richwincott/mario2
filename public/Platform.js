import { text, Vector } from './helpers.js';

export default class Platform {
  constructor(x, y, w, h, img) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.w = w;
    this.h = h;
    this.collisions = null;
    this.img = img;
    this.colliding = false;
  }

  show(viewport, debug) {
    if (this.colliding && debug) {
      this.colliding = false;
      ctx.fillRect(
        this.pos.x + viewport.x, //this.h > 50 ? this.pos.x : this.pos.x + 20,
        this.pos.y,
        this.w, //this.h > 50 ? this.w : this.w - 40,
        this.h
      );
    }
    else {
      ctx.drawImage(this.img, this.pos.x + viewport.x, this.pos.y, this.w, this.h)
    }
  }
}