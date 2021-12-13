import { Vector, constrain, doBoxesIntersect, flipImg } from './helpers.js';
import Mario from './Mario.js';

export default class Character {
  constructor(x, y, images) {
    this.original_pos = new Vector(x, y);
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.dir = -1;
    this.w = 20;
    this.h = 30;
    this.health = 1;
    this.airBourne = false;
    this.collisionsEnabled = true;
    this.score = 0;
    this.images = images;
    this.images.runFlipped = images.run.map((img) => flipImg(img))
    this.obstructedTime = 0;
  }

  respawn() {
    this.health = 1;
    this.dir = -1;
    this.collisionsEnabled = true;
    this.vel = new Vector(0, 0);
    this.pos = new Vector(this.original_pos.x, this.original_pos.y);
  }

  update(viewport) {
    this.vel.y += this.crouch ? GRAVITY * 3 : GRAVITY;
    this.pos.add(this.vel);
    if (this instanceof Mario)
      this.pos.x = constrain(this.pos.x, this.pos.x > (canvas.width / 4) - (this.w + 1) && viewport.x < 0 ? (canvas.width / 4) : 0, (canvas.width / 2) - this.w);
    this.pos.y = constrain(this.pos.y, 0, canvas.height * 2);
    this.vel.x = constrain(this.vel.x, -MOVE_SPEED, MOVE_SPEED);

    if (this.pos.y > canvas.height + 100) {
      this.respawn();
    }

    if (this.obstructedTime > 10) {
      this.obstructedTime = 0;
      this.jump();
    }
  }

  collision(transforms, viewport, top, bottom, left, right) {
    transforms.forEach((transform) => {
      if (this.collisionsEnabled && !transform.passable && doBoxesIntersect(this, transform, viewport)) {
        const platXPlusViewport = transform.pos.x + viewport.x;
        const xTest = (this.pos.x + (this.w / 2)) - (platXPlusViewport + (transform.w / 2));

        const distX = xTest < 0 ? (this.pos.x + this.w) - transform.pos.x
          : xTest > 0 ? this.pos.x - (transform.pos.x + transform.w)
            : undefined;

        const distY = (this.pos.y + this.h) < transform.pos.y + (transform.h / 2) ? (this.pos.y + this.h) - transform.pos.y
          : this.pos.y > transform.pos.y + (transform.h / 2) ? this.pos.y - (transform.pos.y + transform.h)
            : undefined;

        const overlap = {
          x: distX - viewport.x,
          y: distY,
        }

        if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
          if (overlap.y < 0) {
            top(transform, overlap);
          }
          else {
            bottom(transform, overlap);
          }
        }
        else {
          if (overlap.x < 0) {
            left(transform, overlap);
          }
          else {
            right(transform, overlap)
          }
        }
      }
    })
  }

  tileCollisions(tiles, viewport) {
    this.collision(tiles, viewport,
      (other, overlap) => {
        if (other.collisionActions && other.collisionActions.top) other.collisionActions.top(other, overlap, this);
        else {
          this.pos.y += Math.abs(overlap.y);
          this.vel.y = constrain(this.vel.y, 0, 9999);
        }
      },
      (other, overlap) => {
        if (other.collisionActions && other.collisionActions.bottom) other.collisionActions.bottom(other, overlap, this);
        else {
          this.airBourne = false;
          this.pos.y -= Math.abs(overlap.y);
          this.vel.y = constrain(this.vel.y, -9999, 0);
        }
      },
      (other, overlap) => {
        if (other.collisionActions && other.collisionActions.left) other.collisionActions.left(other, overlap, this);
        else {
          this.pos.x += Math.abs(overlap.x);
          if (!(this instanceof Mario))
            this.obstructedTime++;
        }
      },
      (other, overlap) => {
        if (other.collisionActions && other.collisionActions.right) other.collisionActions.right(other, overlap, this);
        else {
          this.pos.x -= Math.abs(overlap.x);
          if (!(this instanceof Mario))
            this.obstructedTime++;
        }
      }
    )
  }

  enemyCollisions(enemies, viewport) {
    this.collision(enemies, viewport,
      (other, overlap) => null,
      (other, overlap) => {
        other.takeDamage();
        this.vel.y = 0;
        this.vel.x = 0;
        this.airBourne = false;
        this.jump();
        this.score += 5;
      },
      (other, overlap) => this.takeDamage(),
      (other, overlap) => this.takeDamage()
    )
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    if (this.health == 0) this.die();
  }

  die() {
    this.collisionsEnabled = false;
    this.score = 0;
    this.vel.y = 0;
    this.vel.x = 0;
    if (this instanceof Mario)
      this.jump();
  }

  jump() {
    if (this.airBourne) return;
    this.airBourne = true;
    this.vel.y = -JUMP_HEIGHT;
  }

  move(x, y) {
    /* const force = new Vector(x, y);
    this.vel.add(force); */
    this.vel.x = x;
    this.dir = this.vel.x < 0 ? 1 : -1;
  }

  show(index, viewport) {
    const runKey = this.dir == 1 ? 'run' : 'runFlipped';
    let img = this.vel.x != 0 ? this.images[runKey][index] : this.images[runKey][0];
    ctx.drawImage(img, (this.pos.x - 10) + viewport.x, this.pos.y - 5, img.width, img.height);
  }
}