import Character from './Character.js';

export default class Pickup extends Character {
  constructor(j, i, images, dir, collisionActions) {
    const dim = { x: images.run[0].width, y: images.run[0].height };
    const gs = 16;
    const x = ((j * gs) + (gs / 2)) - dim.x / 2;
    const y = ((i * gs) + (gs / 2)) - dim.y / 2;
    super(x, y, images, collisionActions);
    this.dir = dir;
    setTimeout((jump) => {
      this.dir = Math.random() < 0.5 ? -1 : 1;
      this.move((MOVE_SPEED / 2) * this.dir, 0);
      jump(JUMP_HEIGHT / 2);
    }, 0, this.jump.bind(this));
    this.jump = () => {
      // re purpose this function to switch direction
      const newDir = this.dir < 0 ? 1 : -1
      this.move((MOVE_SPEED / 2) * newDir, 0);
      this.dir = newDir;
    }
  }

  respawn() {

  }

  show(index, viewport) {
    let img = this.images.run[0];
    ctx.drawImage(img, this.pos.x + viewport.x, this.pos.y + 12, img.width, img.height);
  }
}