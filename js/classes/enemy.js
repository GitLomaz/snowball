class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    this.alive = true;
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.setSize(24, 24)

    // MAKE DYNAMIC
    this.health = 100 + yetiLevel * 25;
    this.damage = 6 + yetiLevel * 3;
    this.score = 500 + yetiLevel * 200;
    this.movementSpeed = 55 + yetiLevel * 5;
    this.knockback = 0
  }

  moveTowards() {
    if (this.alive) {
      if (this.knockback > 0) {
        this.knockback--;
        return
      }
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

  hit(projectile) {
    // difference here
    // set knockback
    let a = Phaser.Math.Angle.Between(projectile.x, projectile.y, this.x, this.y);
    let x = Math.cos(a);
    let y = Math.sin(a);
    this.body.setVelocityX(x * getRandomInt(50, 200));
    this.body.setVelocityY(y * getRandomInt(50, 200));
    this.knockback = 10;
    let damage = 50
    this.health = this.health - damage;
    let that = this
    let counter = 0
    let interval = setInterval(function(){
      if (counter % 2 === 0) {
        that.setTint(0xff0000)
      } else {
        that.clearTint()
      }
      counter++;
      if (counter === 6) {
        clearInterval(interval)
      }
    }, 100)
    if (this.health <= 0) {
      this.destroyObj();
    }
  }

  destroyObj() {
    if (this.alive) {
      yetiDeaths++;
      submitScore("Most Yetis Killed", yetiDeaths + ((yetiLevel - 1) * 10));
      if (yetiDeaths === 10) {
        yetiDeaths = 0;
        yetiLevel++;
        submitScore("Highest Yeti Level Reached", yetiLevel);
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
