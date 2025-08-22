let gameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function gameScene() {
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

    this.load.image("play", "images/play.png");
    this.load.image("play-o", "images/play-over.png");
    this.load.image("submit", "images/submit.png");
    this.load.image("submit-o", "images/submit-over.png");

    this.load.image("pu-heart", "images/pu-heart.png");
    this.load.image("pu-snow", "images/pu-snow.png");
    this.load.image("pu-shovel", "images/pu-shovel.png");
    this.load.image("backplate", "images/backplat.png");
    this.load.image("skillBackground", "images/skillBackground.png");
    this.load.image("x", "images/x.png");
    this.load.image("fallingSnow", "images/snowFall.png");
    this.load.image("tilesheet", "images/tiles-ex.png");
    this.load.image("tree", "images/tree.png");
    this.load.tilemapTiledJSON("Arena", "json/field.json");
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
    player.knockback = 0
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
    loadingBar = this.add.rectangle(100, 100, 40, 5, 0x008200);
    loadingBar.scaleX = 0;
    loadingBar.setOrigin(0, 0);

    scoreRectangle = this.add.sprite(0, 0, 'backplate');
    scoreRectangle.setOrigin(0, 0).setScrollFactor(0).setDepth(10)    
    
    skillRectangle = this.add.sprite(295, 525, 'skillBackground');
    skillRectangle.setOrigin(0, 0).setScrollFactor(0).setDepth(10)

    fontConfig = {
      fontFamily: 'myFont, Arial, "DejaVu Sans", Calibri, sans-serif',
      fontSize: "17px",
      color: "#5b8da6",
      stroke: '#9bbdd6',
      strokeThickness: 2,
    };

    // resources indicator
    snowCounter = this.add
      .text(13, 8, "Snow: " + player.snow, fontConfig)
      .setScrollFactor(0).setDepth(10);
    scoreCounter = this.add
      .text(13, 28, "Score: " + player.snow, fontConfig)
      .setScrollFactor(0).setDepth(10);
    yetiCounter = this.add
      .text(13, 48, "Active Yetis: " + player.snow, fontConfig)
      .setScrollFactor(0).setDepth(10);
    levelCounter = this.add
      .text(13, 68, "Yeti Level: " + player.snow, fontConfig)
      .setScrollFactor(0).setDepth(10);
    healthCounter = this.add
      .text(13, 88, "Health: " + player.snow, fontConfig)
      .setScrollFactor(0).setDepth(10);
    fontConfig.fontSize = "36px";
    fontConfig.align = "center";
    alertText = this.add.text(0, 400, "", fontConfig).setScrollFactor(0);
    alertText.setFixedSize(800, 300);
    alertText.alpha = 0;
    alertText.setDepth(500)
    scoreText = this.add.text(0, 200, "", fontConfig).setScrollFactor(0);
    scoreText.setFixedSize(800, 300);
    scoreText.alpha = 0;
    scoreText.setDepth(500)

    btnSell = this.add
      .image(472, 552, "options")
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
    btnSell.setFrame(2).setDepth(10);
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
      .image(472 - 50, 552, "options")
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
    btnTower.setFrame(3).setDepth(10);
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
      .image(372, 552, "options")
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
    btnWall.setFrame(0).setDepth(10);
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
      .image(372 - 50, 552, "options")
      .setScrollFactor(0)
      .setInteractive({ cursor: 'pointer' })
    btnSnow.setFrame(1).setDepth(10);
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
    trees = [];
    enemiesGroup = this.physics.add.group();
    treesGroup = this.physics.add.group({
      immovable: true,
    });
    snowballsGroup = this.physics.add.group();
    this.cameras.main.fadeIn(200);

    for (let i = 0; i < 100; i++) {
      let y = (i * 24)
      let x = Phaser.Math.Between(60, 340)
      spawnTree(x, y, treesGroup)
      spawnTree(y, x, treesGroup)


      y = (i * 24)
      x = Phaser.Math.Between(2020, 2300)
      spawnTree(x, y, treesGroup)
      spawnTree(y, x, treesGroup)
    }

    this.physics.add.collider(
      enemiesGroup,
      treesGroup
    )

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
      this.physics.world.collide(player, treesGroup);
      this.physics.world.collide(player, buildingPhysicsGroup);
      this.physics.world.collide(
        enemiesGroup,
        buildingPhysicsGroup,
        function (a, b) {
          if (!b.cooldownTween) {
            b.health = b.health - a.damage;
            let counter = 0
            let interval = setInterval(function(){
              if (counter % 2 === 0) {
                b.setTint(0xff0000)
              } else {
                b.clearTint()
              }
              counter++;
              if (counter === 6) {
                clearInterval(interval)
              }
            }, 100)
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
        a.hit(b);
        b.destroy();
      });
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
            let a = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            let x = Math.cos(a);
            let y = Math.sin(a);
            player.body.setVelocityX(x * getRandomInt(100, 400));
            player.body.setVelocityY(y * getRandomInt(100, 400));
            player.knockback = 10;
            player.health = player.health - enemy.damage;
            cooldownTween = true
            let counter = 0
            let interval = setInterval(function(){
              if (counter % 2 === 0) {
                player.setTint(0xff0000)
              } else {
                player.clearTint()
              }
              counter++;
              if (counter === 6) {
                clearInterval(interval)
                cooldownTween = false
              }
            }, 100);

            if (player.health <= 25) {
              healthCounter.setColor("#ff0000");
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

      let speed = 200
      if (gathering) {
        speed = 100
        playSound(snow_crunch);
      }
      if (player.shovelBonus) {
        speed = 200
      }

      let velocityX = 0
      let velocityY = 0
      
      // player movement logic
      if ((cursors.left.isDown || wasd.left.isDown) && player.health > 0) {
        interuptBuild();
        velocityX = -speed
        if (gathering) {
          playAnimation(player, "player-shovelLeft");
        } else {
          playAnimation(player, "player-walkLeft");
        }
      } else if ((cursors.right.isDown || wasd.right.isDown) && player.health > 0) {
        interuptBuild();
        velocityX = speed
        if (gathering) {
          playAnimation(player, "player-shovelRight");
        } else {
          playAnimation(player, "player-walkRight");
        }
      }

      if ((cursors.up.isDown || wasd.up.isDown) && player.health > 0) {
        interuptBuild();
        velocityY = -speed
      } else if ((cursors.down.isDown || wasd.down.isDown) && player.health > 0) {
        interuptBuild();
        velocityY = speed
      }

      if (velocityX !== 0 && velocityY !== 0) {
        velocityX = velocityX * .7
        velocityY = velocityY * .7
      }


      if (player.knockback === 0) {
        player.setVelocityX(velocityX)
        player.setVelocityY(velocityY)
      } else {
        player.knockback--;
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
      var bodies = this.physics.overlapCirc(player.x, player.y, 10, true, true);
      _.each(bodies, function (body) {
        if (body && body.gameObject && body.gameObject.snowAmount) {
          if (gathering && body.gameObject.snowAmount > 0) {
            // collecting snow!
            player.snow += Math.floor(body.gameObject.snowAmount * 1.5);
            snowCounter.setText("Snow: " + player.snow);
            body.gameObject.snowAmount = 0;
            body.gameObject.setFrame(0);
          }
        } else if (body && body.gameObject && body.gameObject.powerup) {
          activatePowerup(body.gameObject.powerup);
          body.gameObject.destroy();
          if (player.health > 25) {
            healthCounter.setColor("#5b8da6");
          }
          playSound(powerup_spawn);
        }
      });

      // throw snowballs
      if (counter % 20 == 0 && player.snow >= 3 && !gathering) {
        player.snow = player.snow - 3;
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
      if (puCounter % 30 == 0) {
        player.score++
      }
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
  let snowball = scene.add.circle(sprite.x, sprite.y, 6, 0xcccccc);
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
    let x = scene.add.sprite(loadingTween.targets[0].x + 20, loadingTween.targets[0].y - 14, "x");
    scene.tweens.add({
      targets: x,
      ease: "Linear",
      alpha: 0,
      duration: 800,
      onComplete: function () {
        this.targets[0].destroy();
      },
    });
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
    player.shovelBonus = true
    notice("2x shoveling speed for 30 seconds!");
    setTimeout(function () {
      player.shovelBonus = false
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
  player.setVelocityX(0)
  player.setVelocityY(0)
  let whiteout = scene.add.rectangle(0,0,2000,2000, 0xFFFFFF)
  whiteout.setOrigin(.5)
  whiteout.setScrollFactor(0)
  whiteout.setDepth(400)
  whiteout.alpha = 0
  scene.tweens.add({
    targets: whiteout,
    ease: "Linear",
    alpha: 1,
    duration: 5000,
  });

  let submitBtn = scene.add
    .image(350, 420, "submit")
    .setOrigin(0)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(600)
    .setInteractive({ cursor: 'pointer' })
  let playBtn = scene.add
    .image(50, 420, "play")
    .setOrigin(0)
    .setAlpha(0)
    .setScrollFactor(0)
    .setDepth(600)
    .setInteractive({ cursor: 'pointer' })

    
  submitBtn.on("pointerover", function (event) {
    this.setTexture("submit-o");
  });

  submitBtn.on("pointerout", function (event) {
    this.setTexture("submit");
  });

  playBtn.on("pointerover", function (event) {
    this.setTexture("play-o");
  });

  playBtn.on("pointerout", function (event) {
    this.setTexture("play");
  });

  playBtn.on(
    "pointerdown",
    function () {
      scene.cameras.main.fadeOut(200);
      $('#user').fadeOut(200)
      scene.cameras.main.on(
        "camerafadeoutcomplete",
        () => {
          scene.scene.start("gameScene");
        },
        scene
      );
    },
    scene
  );

  submitBtn.on(
    "pointerdown",
    function () {
      submission = btoa(
        '{ "game": "snowball", "name": "' +
          $("#user").val().toUpperCase() +
          '", "score": ' +
          player.score +
          "}"
      );
      animal = $("#user").val().toUpperCase();
      // submitScore("Highest Score", scene.player.score);
      showScores = true;
      scene.cameras.main.fadeOut(200);
      $('#user').fadeOut(200)
      scene.cameras.main.on(
        "camerafadeoutcomplete",
        () => {
          scene.scene.start("menuScene");
        },
        scene
      );

    },
    scene
  );
  submitScore("High Score", scene.day);
  scoreText.setText("You have died!\r\nScore: " + displayNumber(player.score))
  scene.tweens.add({
    targets: [submitBtn, playBtn, scoreText],
    ease: "Linear",
    alpha: 1,
    duration: 1000,
  });
  $('#user').fadeIn(1000)
  $('#user').focus()
  $('#user').val(animal)
  scene.input.keyboard.clearCaptures()
}

function spawnTree(x, y, treesGroup) {

  let tree = new Tree(x, y)
  
  treesGroup.add(tree)
  trees.push(tree);
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
  // enemies[enemies.length - 1].setSize(38, 38);
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
