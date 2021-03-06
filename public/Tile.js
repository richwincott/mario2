import { Vector } from './helpers.js';

export default class Tile {
  constructor(j, i, passable, img, collisionActions) {
    const dim = { x: img.width, y: img.height };
    const gs = 16;
    const x = ((j * gs) + (gs / 2)) - dim.x / 2;
    const y = ((i * gs) + (gs / 2)) - dim.y / 2;
    this.j = j;
    this.i = i;
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.w = dim.x + 1;
    this.h = dim.y;
    this.passable = passable;
    this.collisionActions = collisionActions;
    this.img = img;
    this.colliding = false;
    this.collidingCounter = 0;
  }

  update() {
    if (this.colliding) this.collidingCounter++;
    if (this.collidingCounter > 10) {
      this.collidingCounter = 0;
      this.colliding = false;
    }
  }

  show(context) {
    context.drawImage(this.img, this.pos.x, this.pos.y, this.w, this.h);
  }

  showDebug(viewport) {
    if (this.colliding) {
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