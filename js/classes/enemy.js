class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    this.alive = true;

    // MAKE DYNAMIC
    this.health = 100 + yetiLevel * 25;
    this.damage = 6 + yetiLevel * 3;
    this.score = 25 + yetiLevel * 5;
    this.movementSpeed = 55 + yetiLevel * 5;
  }

  moveTowards() {
    if (this.alive) {
      if (player.x < this.x) {
        playAnimation(this, "yeti-walkLeft");
      } else {
        playAnimation(this, "yeti-walkRight");
      }
      let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      scene.physics.velocityFromRotation(
        angle,
        this.movementSpeed,
        this.body.velocity
      );
    } else {
      this.stopMoving();
    }
  }

  stopMoving() {
    if (this.alive) {
      this.setVelocityY(0);
      this.setVelocityX(0);
    }
  }

  isNear(coordinates) {
    if (this.alive) {
      return (
        Math.abs(this.x - coordinates.x) < 25 &&
        Math.abs(this.y - coordinates.y) < 25
      );
    }
  }

  hit(damage = 50) {
    this.health = this.health - damage;
    scene.tweens.add({
      targets: this,
      ease: "Linear",
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
    });
    if (this.health <= 0) {
      this.destroyObj();
    }
  }

  destroyObj() {
    if (this.alive) {
      yetiDeaths++;
      if (yetiDeaths === 10) {
        yetiDeaths = 0;
        yetiLevel++;
        notice("Yeti Levels Increased!");
      }
      enemiesGroup.remove(this);
      player.score = player.score + this.score;
      this.anims.play("yeti-dieRight");
      this.alive = false;
      scene.tweens.add({
        targets: this,
        ease: "Linear",
        alpha: 0,
        duration: 1000,
        onComplete: function () {
          this.targets[0].destroy();
        },
      });
    }
  }
}
