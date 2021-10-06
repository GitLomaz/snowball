let gameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function zoneScene() {
    Phaser.Scene.call(this, {
      key: "gameScene",
    });
  },

  preload: function () {
    this.load.audio("snowball_throw", "sounds/effects/snowball_throw.mp3");
    this.load.audio("snow_crunch", "sounds/effects/snow_crunch.mp3");
    this.load.audio("game_over", "sounds/effects/game_over.mp3");
    this.load.audio("powerup_spawn", "sounds/effects/powerup_spawn.mp3");
    this.load.audio("background_music", "sounds/music/background_music.mp3");

    this.load.image("pu-heart", "images/pu-heart.png");
    this.load.image("pu-snow", "images/pu-snow.png");
    this.load.image("pu-shovel", "images/pu-shovel.png");
    this.load.image("x", "images/x.png");
    this.load.image("fallingSnow", "images/snowFall.png");
    this.load.image("tilesheet", "images/tiles-ex.png");
    this.load.tilemapTiledJSON("Arena", "json/field.json");
    this.load.spritesheet("snow", "images/snow.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("options", "images/options.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("snowball", "images/snowball.png", {
      frameWidth: 48,
      frameHeight: 48,
      spacing: 12,
      margin: 12,
    });
    this.load.spritesheet("yeti", "images/yeti.png", {
      frameWidth: 48,
      frameHeight: 48,
      spacing: 12,
      margin: 12,
    });
  },

  create: function () {
    // set scene for global access
    scene = this;

    yetiLevel = 1;
    yetiDeaths = 0;

    // create and render map
    map = this.make.tilemap({ key: "Arena", tileWidth: 48, tileHeight: 48 });
    let tiles = map.addTilesetImage("tilesheet", "tilesheet", 48, 48, 13, 14);
    map.createStaticLayer(0, tiles);

    // create physics group for buildingPhysicsGroup
    buildingPhysicsGroup = this.physics.add.group({
      immovable: true,
    });

    // create snow sprites
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        snow = this.physics.add.image(x * 48, y * 48, "snow");
        // tile selector for building
        snow.setInteractive();
        snow.on("pointerover", function (event) {
          if (
            (((action === "wall" && player.snow >= 10) ||
              (action === "tower" && player.snow >= 100)) &&
              !this.building) ||
            (this.building && action === "sell")
          ) {
            this.setTint(0x00ff00);
          } else if (action !== "throw") {
            this.setTint(0xff0000);
          }
        });

        snow.on("pointerout", function (event) {
          this.clearTint();
        });

        snow.on("pointerdown", function (event, currentlyOver) {
          if (action === "wall" && player.snow >= 10 && !this.building) {
            triggerBuild("wall", this, buildingPhysicsGroup);
          } else if (
            action === "tower" &&
            player.snow >= 100 &&
            !this.building
          ) {
            triggerBuild("tower", this, buildingPhysicsGroup);
          } else if (action === "sell" && this.building) {
            triggerBuild("sell", this, buildingPhysicsGroup);
          }
        });

        tileArray.push(snow);
        snow.snowAmount = Phaser.Math.Between(0, 4);
        snow.currentTick = Phaser.Math.Between(0, 999);
        snow.setFrame(snow.snowAmount);
      }
    }

    // create player, limit him to within a rectangle
    player = this.physics.add.sprite(800, 800, "snowball");
    player.health = 100;
    player.body.setSize(40, 40);
    player.snow = 100;
    player.score = 0;
    player.alive = true;
    player.setCollideWorldBounds(true);
    player.body.setBoundsRectangle(
      new Phaser.Geom.Rectangle(384, 384, 1632, 1632)
    );

    // player animations
    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNumbers("snowball", {
        frames: [0, 2, 3],
      }),
      frameRate: 2,
      repeat: 0,
    });

    this.anims.create({
      key: "player-walkRight",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [4, 5] }),
      frameRate: 4,
      repeat: 0,
    });

    this.anims.create({
      key: "player-walkLeft",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [6, 7] }),
      frameRate: 4,
      repeat: 0,
    });

    this.anims.create({
      key: "player-shovelRight",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [8, 9] }),
      frameRate: 4,
      repeat: 0,
    });

    this.anims.create({
      key: "player-shovelLeft",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [10, 11] }),
      frameRate: 4,
      repeat: 0,
    });

    this.anims.create({
      key: "player-throwRight",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [12, 13] }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: "player-throwLeft",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [14, 15] }),
      frameRate: 8,
      repeat: 0,
    });

    // yeti animations
    this.anims.create({
      key: "yeti-idle",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [0] }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "yeti-walkRight",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [4, 5] }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "yeti-walkLeft",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [6, 7] }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "yeti-dieRight",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [8, 9] }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: "yeti-dieLeft",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [10, 11] }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: "yeti-attackRight",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [12, 13] }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: "yeti-attackLeft",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [14, 15] }),
      frameRate: 8,
      repeat: 0,
    });

    player.play("player-idle");

    // force the camera to follow player
    this.cameras.main.startFollow(player, false, 0.06, 0.06);
    this.cameras.main.setDeadzone(15, 15);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // create input
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
    });

    // input handlers
    spacebar = this.input.keyboard.addKey("Space");
    spacebar.on("down", () => {
      interuptBuild();
      gathering = true;
    });

    spacebar.on("up", () => {
      gathering = false;
    });

    // set counter for throwing actions
    this.input.on("pointerdown", (pointer) => {
      if (action === "throw") {
        counter = 0;
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (action === "throw") {
        counter = -1;
      }
    });

    // loading bar for item construction
    loadingBar = this.add.rectangle(100, 100, 40, 5, 0x00ff00);
    loadingBar.scaleX = 0;
    loadingBar.setOrigin(0, 0);

    scoreRectangle = this.add.rectangle(0, 0, 150, 110, 0x344b50, 0.8);
    scoreRectangle.setOrigin(0, 0).setScrollFactor(0);

    fontConfig = {
      fontFamily: 'Arial, "DejaVu Sans", Calibri, sans-serif',
      fontSize: "18px",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 1,
      shadow: {
        offsetX: 2,
        offsetY: 1,
        color: "#5fcde4",
        blur: 1,
        stroke: true,
        fill: true,
      },
    };

    // resources indicator
    snowCounter = this.add
      .text(3, 3, "Snow: " + player.snow, fontConfig)
      .setScrollFactor(0);
    scoreCounter = this.add
      .text(3, 23, "Score: " + player.snow, fontConfig)
      .setScrollFactor(0);
    yetiCounter = this.add
      .text(3, 43, "Active Yetis: " + player.snow, fontConfig)
      .setScrollFactor(0);
    levelCounter = this.add
      .text(3, 63, "Yeti Level: " + player.snow, fontConfig)
      .setScrollFactor(0);
    healthCounter = this.add
      .text(3, 83, "Health: " + player.snow, fontConfig)
      .setScrollFactor(0);
    fontConfig.fontSize = "36px";
    fontConfig.align = "center";
    alertText = this.add.text(0, 400, "", fontConfig).setScrollFactor(0);
    alertText.setFixedSize(800, 300);
    alertText.alpha = 0;

    btnSell = this.add
      .image(750, 550, "options")
      .setScrollFactor(0)
      .setInteractive();
    btnSell.setFrame(2);
    btnSell.on("pointerdown", function (event) {
      btnSell.clearTint();
      btnTower.clearTint();
      btnWall.clearTint();
      btnSnow.clearTint();
      this.tint = 0x00ff00;
      interuptBuild();
      action = "sell";
    });
    btnTower = this.add
      .image(700, 550, "options")
      .setScrollFactor(0)
      .setInteractive();
    btnTower.setFrame(3);
    btnTower.on("pointerdown", function (event) {
      btnSell.clearTint();
      btnTower.clearTint();
      btnWall.clearTint();
      btnSnow.clearTint();
      this.tint = 0x00ff00;
      interuptBuild();
      action = "tower";
    });
    btnWall = this.add
      .image(650, 550, "options")
      .setScrollFactor(0)
      .setInteractive();
    btnWall.setFrame(0);
    btnWall.on("pointerdown", function (event) {
      btnSell.clearTint();
      btnTower.clearTint();
      btnWall.clearTint();
      btnSnow.clearTint();
      this.tint = 0x00ff00;
      interuptBuild();
      action = "wall";
    });
    btnSnow = this.add
      .image(600, 550, "options")
      .setScrollFactor(0)
      .setInteractive();
    btnSnow.setFrame(1);
    btnSnow.tint = 0x00ff00;
    btnSnow.on("pointerdown", function (event) {
      btnSell.clearTint();
      btnTower.clearTint();
      btnWall.clearTint();
      btnSnow.clearTint();
      this.tint = 0x00ff00;
      interuptBuild();
      action = "throw";
    });

    edgeofthemap = [0, 2400];
    axis = ["x", "y"];
    swapparooni = [];
    swapparooni["x"] = "y";
    swapparooni["y"] = "x";
    enemies = [];
    enemiesGroup = this.physics.add.group();
    snowballsGroup = this.physics.add.group();
    this.cameras.main.fadeIn(200);

    snow_crunch = this.sound.add("snow_crunch");
    snowball_throw = this.sound.add("snowball_throw");
    game_over = this.sound.add("game_over");
    powerup_spawn = this.sound.add("powerup_spawn");
    background_music = this.sound.add("background_music", {
      loop: true,
      volume: 0.2,
    });
    background_music.play();
  },

  update: function () {
    if (player.alive) {
      scoreCounter.setText("Score: " + player.score);
      yetiCounter.setText("Yetis: " + enemiesGroup.children.size);
      levelCounter.setText("Yeti Level: " + yetiLevel);
      healthCounter.setText("Health: " + player.health + " / 100");

      // can't walk through buildingPhysicsGroup
      this.physics.world.collide(player, buildingPhysicsGroup);
      this.physics.world.collide(
        enemiesGroup,
        buildingPhysicsGroup,
        function (a, b) {
          if (!b.cooldownTween) {
            b.health = b.health - a.damage;
            b.cooldownTween = scene.tweens.add({
              targets: b,
              ease: "Linear",
              tint: 0xff0000,
              duration: 500,
              yoyo: true,
              onComplete: function () {
                b.cooldownTween = null;
              },
            });
            if (b.health <= 0) {
              buildingPhysicsGroup.remove(b);
              b.setFrame(0);
              b.snowAmount = 0;
              b.building = false;
            }
          }
          if (b.damage) b.health = b.health - b;
        }
      );

      // destroy snowball, injur yeti
      this.physics.world.collide(enemiesGroup, snowballsGroup, function (a, b) {
        a.hit();
        b.destroy();
      });
      // this.physics.add.collider(enemiesGroup);

      playerLocation = { x: player.x, y: player.y };
      enemies.forEach((enemy) => {
        enemy.moveTowards();
      });

      enemies.forEach((enemy) => {
        if (!enemy.alive) {
          try {
            enemy.setVelocityY(0);
            enemy.setVelocityX(0);
          } catch (error) {}
          return;
        }
        if (enemy.isNear(playerLocation)) {
          enemy.stopMoving();
          if (player.x < enemy.x) {
            playAnimation(enemy, "yeti-attackLeft");
          } else {
            playAnimation(enemy, "yeti-attackRight");
          }

          if (!cooldownTween && player.alive) {
            player.health = player.health - enemy.damage;

            cooldownTween = scene.tweens.add({
              targets: player,
              ease: "Linear",
              tint: 0xff0000,
              duration: 500,
              repeat: 0,
              yoyo: true,
              onComplete: function () {
                cooldownTween = null;
              },
            });

            if (player.health <= 25) {
              healthCounter.setColor("#ff0000");
              healthCounter.setShadow(0, 0, "#ff0000", 0, false, false);
            }

            if (player.health <= 0) {
              player.alive = false;
              player.health = 0;
              gameOver();
              background_music.stop();
              game_over.play();
            }
          }
        }
      });

      // can't walk through buildingPhysicsGroup
      this.physics.world.collide(player, buildingPhysicsGroup);

      // player movement logic
      if (cursors.left.isDown || wasd.left.isDown) {
        interuptBuild();
        if (gathering) {
          player.setVelocityX(-shovelSpeed);
          playAnimation(player, "player-shovelLeft");
          playSound(snow_crunch);
        } else {
          player.setVelocityX(-160);
          playAnimation(player, "player-walkLeft");
        }
      } else if (cursors.right.isDown || wasd.right.isDown) {
        interuptBuild();
        if (gathering) {
          player.setVelocityX(shovelSpeed);
          playAnimation(player, "player-shovelRight");
          playSound(snow_crunch);
        } else {
          player.setVelocityX(160);
          playAnimation(player, "player-walkRight");
        }
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up.isDown || wasd.up.isDown) {
        interuptBuild();
        if (gathering) {
          player.setVelocityY(-shovelSpeed);
          // playAnimation(player, 'shovelRight')
          playSound(snow_crunch);
        } else {
          player.setVelocityY(-160);
          // playAnimation(player, 'walkRight')
        }
      } else if (cursors.down.isDown || wasd.down.isDown) {
        interuptBuild();
        if (gathering) {
          player.setVelocityY(shovelSpeed);
          // playAnimation(player, 'shovelRight')
          playSound(snow_crunch);
        } else {
          player.setVelocityY(160);
          // playAnimation(player, 'walkRight')
        }
      } else {
        player.setVelocityY(0);
      }

      if (wasd.one.isDown) {
        btnSell.clearTint();
        btnTower.clearTint();
        btnWall.clearTint();
        btnSnow.clearTint();
        btnSnow.tint = 0x00ff00;
        interuptBuild();
        action = "throw";
      } else if (wasd.two.isDown) {
        btnSell.clearTint();
        btnTower.clearTint();
        btnWall.clearTint();
        btnSnow.clearTint();
        btnWall.tint = 0x00ff00;
        interuptBuild();
        action = "wall";
      } else if (wasd.three.isDown) {
        btnSell.clearTint();
        btnTower.clearTint();
        btnWall.clearTint();
        btnSnow.clearTint();
        btnTower.tint = 0x00ff00;
        interuptBuild();
        action = "tower";
      } else if (wasd.four.isDown) {
        btnSell.clearTint();
        btnTower.clearTint();
        btnWall.clearTint();
        btnSnow.clearTint();
        btnSell.tint = 0x00ff00;
        interuptBuild();
        action = "sell";
      }

      if (
        !(
          cursors.down.isDown ||
          wasd.down.isDown ||
          cursors.up.isDown ||
          wasd.up.isDown ||
          cursors.right.isDown ||
          wasd.right.isDown ||
          cursors.left.isDown ||
          wasd.left.isDown
        )
      ) {
        playAnimation(player, "player-idle");
      }

      // It's snowing!
      for (let i = 0; i < snowfallRate; i++) {
        let x = Phaser.Math.Between(0, 2400); // 50 * 48
        let y = Phaser.Math.Between(0, 2400); // 50 * 48
        let fadeHeight = Math.floor(Math.random() * 40) - 30;
        let image = "fallingSnow";
        let at = this.add.sprite(x, y, image);
        at.alpha = 0.05;

        at.tweena = this.tweens.add({
          targets: at,
          ease: "Linear",
          y: y + 120 - fadeHeight,
          duration: 800,
          onComplete: function () {
            this.targets[0].destroy();
          },
        });

        at.tweenb = this.tweens.add({
          targets: at,
          ease: "Sine.easeOut",
          alpha: 1,
          duration: 400,
          yoyo: true,
        });

        at.tweenc = this.tweens.add({
          targets: at,
          ease: "Sine.easeOut",
          x: x + 30,
          duration: 400,
          repeat: 2,
          yoyo: true,
        });
      }

      // snow can slowly accumulate at a rate of 1 stack every 2.5 seconds
      _.each(tileArray, function (tile) {
        tile.currentTick++;
        if (
          tile.currentTick % snowTick === 0 &&
          tile.snowAmount < 4 &&
          !tile.building
        ) {
          tile.snowAmount++;
          tile.setFrame(tile.snowAmount);
        }
      });

      // check snow under the feet
      // and powerups!
      var bodies = this.physics.overlapCirc(player.x, player.y, 3, true, true);
      _.each(bodies, function (body) {
        if (body && body.gameObject && body.gameObject.snowAmount) {
          if (gathering && body.gameObject.snowAmount > 0) {
            // collecting snow!
            player.snow += body.gameObject.snowAmount;
            snowCounter.setText("Snow: " + player.snow);
            body.gameObject.snowAmount = 0;
            body.gameObject.setFrame(0);
          }
        } else if (body && body.gameObject && body.gameObject.powerup) {
          activatePowerup(body.gameObject.powerup);
          body.gameObject.destroy();
          if (player.health > 25) {
            healthCounter.setColor("#fff");
            healthCounter.setShadow(2, 1, "#5fcde4", 1, true, true);
          }
          playSound(powerup_spawn);
        }
      });

      // throw snowballs
      if (counter % 20 == 0 && player.snow >= 5 && !gathering) {
        player.snow = player.snow - 5;
        snowCounter.setText("Snow: " + player.snow);
        if (player.x < this.cameras.main.scrollX + this.input.x) {
          playAnimation(player, "player-throwRight");
        } else {
          playAnimation(player, "player-throwLeft");
        }
        playSound(snowball_throw);

        throwSnowball(
          player,
          Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.cameras.main.scrollX + this.input.x,
            this.cameras.main.scrollY + this.input.y
          )
        );
      }

      if (counter !== -1) {
        counter++;
      }

      puCounter++;
      if (puCounter % 1800 == 0) {
        spawnPowerup(powerups[Phaser.Math.Between(0, powerups.length)]);
        playSound(powerup_spawn);
      }

      // spawn yetis faster as end of level approches
      if (puCounter % (200 - yetiDeaths * 15) == 0) {
        spawnEnemy();
      }

      if (puCounter % 30 == 0) {
        fireTurrets();
      }
    }
  },
});

function throwSnowball(sprite, angle) {
  // create a snowball
  let snowball = scene.add.circle(sprite.x, sprite.y, 5, 0xcccccc);
  scene.physics.add.existing(snowball, false);
  snowball.body.setMass(0.01);
  snowballsGroup.add(snowball);
  // figure out velocity based on angle between player and mouse
  scene.physics.velocityFromRotation(angle, 450, snowball.body.velocity);
  // add tween to make it get bigger and smaller (fly through the air)
  // and be destroyed after 400ms
  scene.tweens.add({
    targets: snowball,
    ease: "Linear",
    scale: 1.5,
    duration: 400,
    yoyo: true,
    onComplete: function () {
      this.targets[0].destroy();
    },
  });
}

function triggerBuild(type, sprite, group) {
  // stop any existing builds
  interuptBuild();

  // trigger new build loading
  if (type === "wall") {
    loadingBar.x = sprite.x - 20;
    loadingBar.y = sprite.y + 14;
    loadingTween = scene.tweens.add({
      targets: loadingBar,
      ease: "Linear",
      scaleX: 1,
      duration: 800,
      onComplete: function () {
        loadingTween = null;
        loadingBar.scaleX = 0;
        buildWall(sprite, group);
      },
    });
  } else if (type === "tower") {
    loadingBar.x = sprite.x - 20;
    loadingBar.y = sprite.y + 14;
    loadingTween = scene.tweens.add({
      targets: loadingBar,
      ease: "Linear",
      scaleX: 1,
      duration: 800,
      onComplete: function () {
        loadingTween = null;
        loadingBar.scaleX = 0;
        buildTower(sprite, group);
      },
    });
  } else if (type === "sell") {
    loadingBar.x = sprite.x - 20;
    loadingBar.y = sprite.y + 14;
    loadingTween = scene.tweens.add({
      targets: loadingBar,
      ease: "Linear",
      scaleX: 1,
      duration: 800,
      onComplete: function () {
        loadingTween = null;
        loadingBar.scaleX = 0;
        sellBuilding(sprite, group);
      },
    });
  }
}

function interuptBuild() {
  // disable build bar, reset it
  if (loadingTween) {
    loadingTween.stop();
    loadingBar.scaleX = 0;
    loadingTween = null;
  }
}

function buildWall(sprite, group) {
  // set sprite to frame 5 (wall)
  // add it to physics group to collide
  if (
    scene.physics.overlapRect(sprite.x - 20, sprite.y - 20, 40, 40).length === 1
  ) {
    player.snow = player.snow - 10;
    snowCounter.setText("Snow: " + player.snow);
    group.add(sprite);
    sprite.setFrame(5);
    sprite.building = true;
    sprite.snowValue = 5;
    sprite.health = 500;
    sprite.buildingType = "wall";
  } else {
    let x = scene.add.sprite(sprite.x, sprite.y, "x");
    scene.tweens.add({
      targets: x,
      ease: "Linear",
      alpha: 0,
      duration: 800,
      onComplete: function () {
        this.targets[0].destroy();
      },
    });
  }
}

function buildTower(sprite, group) {
  // set sprite to frame 6 (wall)
  // add it to physics group to collide
  if (
    scene.physics.overlapRect(sprite.x - 20, sprite.y - 20, 40, 40).length === 1
  ) {
    player.snow = player.snow - 100;
    snowCounter.setText("Snow: " + player.snow);
    group.add(sprite);
    sprite.setFrame(6);
    sprite.building = true;
    sprite.snowValue = 50;
    sprite.health = 100;
    sprite.buildingType = "tower";
  } else {
    let x = scene.add.sprite(sprite.x, sprite.y, "x");
    scene.tweens.add({
      targets: x,
      ease: "Linear",
      alpha: 0,
      duration: 800,
      onComplete: function () {
        this.targets[0].destroy();
      },
    });
  }
}

function sellBuilding(sprite, group) {
  // increase player snow
  player.snow = player.snow + sprite.snowValue;
  snowCounter.setText("Snow: " + player.snow);

  // remove from physics group and return to collecting snow
  group.remove(sprite);
  sprite.setFrame(0);
  sprite.snowAmount = 0;
  sprite.building = false;
}

function playAnimation(sprite, key) {
  if (
    !sprite.anims.isPlaying ||
    (key !== "player-idle" && sprite.anims.currentAnim.key === "player-idle") ||
    key !== sprite.anims.currentAnim.key
  ) {
    sprite.play(key);
  }
}

function playSound(sound) {
  if (!sound.isPlaying || sound.key === "snowball_throw") {
    sound.play();
  }
}

function spawnPowerup(type = "snow") {
  x = Phaser.Math.Between(384, 1632);
  y = Phaser.Math.Between(384, 1632);
  let pu = scene.physics.add.image(x, y, "pu-" + type);
  pu.powerup = type;
  scene.tweens.add({
    targets: pu,
    ease: "Linear",
    scale: 1.6,
    duration: 2000,
    yoyo: true,
    repeat: -1,
  });

  setTimeout(function () {
    scene.tweens.add({
      targets: pu,
      alpha: 0,
      duration: 3000,
      onComplete: function () {
        this.targets[0].destroy();
      },
    });
  }, 15000);
}

function activatePowerup(type = "shovel") {
  if (type === "shovel") {
    notice("2x shoveling speed for 30 seconds!");
    shovelSpeed = shovelSpeed * 2;
    setTimeout(function () {
      shovelSpeed = 80;
    }, 30000);
  } else if (type === "snow") {
    notice("5x snow accumulation for 30 seconds!");
    snowTick = 200;
    snowfallRate = 20;
    setTimeout(function () {
      snowTick = 1000;
      snowfallRate = 3;
    }, 30000);
  } else if (type === "heart") {
    notice("Player restored to full health!");
    player.health = 100;
  }
}

function gameOver() {
  scene.cameras.main.fadeOut(5000);
  scene.cameras.main.on(
    "camerafadeoutcomplete",
    () => {
      scene.scene.start("menuScene");
    },
    scene
  );
  notice("You have died!\r\nScore: " + player.score);
}

function spawnEnemy() {
  xOry = axis[Math.floor(Math.random() * 2)];
  zeroOrMax = edgeofthemap[Math.floor(Math.random() * 2)];

  randEnemySpawnCoordinates = [];
  randEnemySpawnCoordinates[xOry] = zeroOrMax;
  randEnemySpawnCoordinates[swapparooni[xOry]] = Phaser.Math.Between(0, 2400);

  enemies.push(
    new Enemy(
      scene,
      randEnemySpawnCoordinates["x"],
      randEnemySpawnCoordinates["y"],
      "yeti"
    )
  );
  enemiesGroup.add(enemies[enemies.length - 1]);

  scene.physics.add.existing(enemies[enemies.length - 1]);
  scene.add.existing(enemies[enemies.length - 1]);
  enemies[enemies.length - 1].setSize(38, 38);
}

function notice(text) {
  alertText.setText(text);
  scene.tweens.add({
    targets: alertText,
    ease: "Linear",
    alpha: 1,
    duration: 300,
    onComplete: function () {
      setTimeout(function () {
        scene.tweens.add({
          targets: alertText,
          alpha: 0,
          duration: 1000,
        });
      }, 5000);
    },
  });
}

function fireTurrets() {
  _.each(buildingPhysicsGroup.children.entries, function (tower) {
    if (tower.buildingType === "tower") {
      let target = false;
      _.each(enemiesGroup.children.entries, function (enemy) {
        if (Phaser.Math.Distance.BetweenPoints(enemy, tower) < 325) {
          target = enemy;
          throwSnowball(
            tower,
            Phaser.Math.Angle.Between(tower.x, tower.y, enemy.x, enemy.y)
          );
          return false;
        }
      });
    }
  });
}
