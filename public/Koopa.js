import Entity from './Entity.js';

export default class Koopa extends Entity {
  constructor(x, y, images, dir) {
    super(x, y, images);
    setTimeout(() => {
      this.move((MOVE_SPEED / 2) * dir, 0);
    }, 3000);
  }

  respawn() {
    /* this.health = 1;
    this.collisionsEnabled = true;
    var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.move((MOVE_SPEED / 2) * plusOrMinus, 0);
    this.pos = new Vector(this.original_pos.x, this.original_pos.y); */
  }

  show(index, viewport) {
    const runKey = this.dir == 1 ? 'run' : 'runFlipped';
    let img = this.vel.x != 0 ? this.images[runKey][index] : this.images[runKey][0];
    ctx.drawImage(img, (this.pos.x - 10) + viewport.x, this.pos.y - 2, img.width, img.height);
  }
}