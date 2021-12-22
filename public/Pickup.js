import Character from './Character.js';

export default class Pickup extends Character {
  constructor(j, i, images, dir, collisionActions, offsetY, gravity) {
    const gs = 16;
    const x = j * gs;
    const y = i * gs;
    super(x, y, images, collisionActions, 16, 16);
    this.j = j;
    this.i = i;
    this.dir = dir;
    this.gravity = gravity;
    this.offsetY = offsetY != undefined ? offsetY : 12;
    if (this.dir)
      setTimeout((jump) => {
        this.dir = Math.random() < 0.5 ? -1 : 1;
        this.move((MOVE_SPEED / 2) * this.dir, 0);
        jump(JUMP_HEIGHT / 2);
      }, 0, this.jump.bind(this));
    this.jump = () => {
      // re purpose this function to switch direction
      const newDir = this.dir < 0 ? 1 : this.dir > 0 ? -1 : 0;
      this.move((MOVE_SPEED / 2) * newDir, 0);
      this.dir = newDir;
    }
  }

  respawn() {

  }

  show(index, viewport) {
    let img = this.images.run[0];
    const dim = { x: img.width, y: img.height };
    const gs = 16;
    const x = ((this.j * gs) + (gs / 2)) - dim.x / 2;
    const y = ((this.i * gs) + (gs / 2)) - dim.y / 2;
    ctx.drawImage(img, x + viewport.x, y + this.offsetY, img.width, img.height);
    /* ctx.strokeStyle = "#F00";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.pos.x + viewport.x, //this.h > 50 ? this.pos.x : this.pos.x + 20,
      this.pos.y,
      this.w, //this.h > 50 ? this.w : this.w - 40,
      this.h
    ); */
  }
}