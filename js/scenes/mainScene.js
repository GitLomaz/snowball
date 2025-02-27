let menuScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function menuScene() {
    Phaser.Scene.call(this, {
      key: "menuScene",
    });
  },
  preload: function () {
    scene = this
    this.load.image("grass", "images/grassNew.png");
    this.load.image("fallingSnow", "images/snowFall.png");
    this.load.image("play", "images/play.png");
    this.load.image("play-o", "images/play-over.png");
    this.load.image("highscore", "images/highscore.png");
    this.load.image("logo", "images/logo.png");
    this.load.image("tutorial", "images/tutorial.png");
    this.load.image("tutorial-o", "images/tutorial-over.png");
    this.load.image("scores", "images/scores.png");
    this.load.image("scores-o", "images/scores-over.png");
    this.load.image("back", "images/back.png");
    this.load.image("back-o", "images/back-over.png");
    this.load.image("submit", "images/submit.png");
    this.load.image("submit-o", "images/submit-over.png");
    this.load.image("guide", "images/guide.png");
    this.load.image("discord", "images/discord.png");
    this.load.image("tree", "images/tree.png");

    this.load.spritesheet("snow", "images/snowNew-ex.png", {
      frameWidth: 48,
      frameHeight: 48,
      margin: 1,
      spacing: 2
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
    this.tileCounter = 400;
    tileArray = [];
    guide = this.add.image(0, 0, "guide").setOrigin(0);
    this.add.image(0, 0, "grass").setOrigin(0);

    logo = this.add.image(400, 200, "logo");

    let playBtn = this.add
      .image(350, 520, "play")
      .setOrigin(0)
      .setInteractive({ cursor: 'pointer' })
    let tutBtn = this.add
      .image(50, 520, "tutorial")
      .setOrigin(0)
      .setInteractive({ cursor: 'pointer' })
    let backBtn = this.add
      .image(50, 520, "back")
      .setOrigin(0)
      .setInteractive({ cursor: 'pointer' })
    let scoreBtn = this.add
      .image(650, 520, "scores")
      .setOrigin(0)
      .setInteractive({ cursor: 'pointer' })
    playBtn.depth = 1;
    backBtn.depth = 1;
    tutBtn.depth = 1;
    scoreBtn.depth = 1;
    logo.depth = 1;

    backBtn.on("pointerover", function (event) {
      this.setTexture("back-o");
    });

    backBtn.on("pointerout", function (event) {
      this.setTexture("back");
    });

    playBtn.on("pointerover", function (event) {
      this.setTexture("play-o");
    });

    playBtn.on("pointerout", function (event) {
      this.setTexture("play");
    });

    tutBtn.on("pointerover", function (event) {
      this.setTexture("tutorial-o");
    });

    tutBtn.on("pointerout", function (event) {
      this.setTexture("tutorial");
    });

    scoreBtn.on("pointerover", function (event) {
      this.setTexture("scores-o");
    });

    scoreBtn.on("pointerout", function (event) {
      this.setTexture("scores");
    });

    playBtn.on(
      "pointerdown",
      function () {
        this.cameras.main.fadeOut(200);
        this.cameras.main.on(
          "camerafadeoutcomplete",
          () => {
            this.scene.start("gameScene");
          },
          this
        );
      },
      this
    );

    tutBtn.on("pointerdown", function () {
      guide.depth = 2;
      playBtn.depth = 3;
    });    
    
    backBtn.on("pointerdown", function () {
      showScores = false
      discordBackground.visible = true
      discordButton.visible = true
      scoreBtn.visible = true
      tutBtn.visible = true
      logo.visible = true
      highScoreTitle.visible = false 
      backBtn.visible = false
      _.each(scene.scores, function(score) {
        score.destroy()
      })
    });

    scoreBtn.on("pointerdown", function () {
      showScores = true
      discordBackground.visible = false
      discordButton.visible = false
      scoreBtn.visible = false
      tutBtn.visible = false
      logo.visible = false
      highScoreTitle.visible = true 
      backBtn.visible = true
      buildHighScores()
    });

    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        snow = this.physics.add.image(x * 48 + 24, y * 48 + 16, "snow");
        tileArray.push(snow);
        snow.snowAmount = Phaser.Math.Between(0, 4);
        snow.currentTick = Phaser.Math.Between(0, 999);
        snow.setFrame(snow.snowAmount);
      }
    }
    player = this.physics.add.sprite(-200, 400, "snowball");
    this.anims.create({
      key: "player-shovelRight",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [8, 9] }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "player-shovelLeft",
      frames: this.anims.generateFrameNumbers("snowball", { frames: [10, 11] }),
      frameRate: 5,
      repeat: -1,
    });

    yeti = this.physics.add.sprite(-200, 400, "yeti");
    this.anims.create({
      key: "yeti-walkRight",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [4, 5] }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "yeti-walkLeft",
      frames: this.anims.generateFrameNumbers("yeti", { frames: [6, 7] }),
      frameRate: 5,
      repeat: -1,
    });

    discordBackground = this.add.rectangle(755, 565, 40, 30, 0x344b50, 0.8);
    discordBackground.setOrigin(0, 0).setScrollFactor(0);

    discordButton = this.add
      .image(775, 580, "discord")
      .setInteractive({ cursor: 'pointer' })
      .setScale(0.01);
    discordButton.on(
      "pointerup",
      function () {
        url = "https://discord.gg/k3kn93J7w4";
        var s = window.open(url, "_blank");

        if (s && s.focus) {
          s.focus();
        } else if (!s) {
          window.location.href = url;
        }
      },
      this
    );

    let highScoreTitle = this.add.text(400, 100, "Hall Of Fame", {
      fontFamily: 'myFont',
      fontSize: "64px",
      align: "center",
      align: "center",
      stroke: '#330030',
      strokeThickness: 4
    });
    highScoreTitle.setOrigin(.5)    

    if (showScores) {
      discordBackground.visible = false
      discordButton.visible = false
      scoreBtn.visible = false
      tutBtn.visible = false
      logo.visible = false
      buildHighScores()
    } else {
      highScoreTitle.visible = false   
      backBtn.visible = false  
    }
  },

  update: function () {
    this.tileCounter++;

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
          at = null;
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
        repeat: 1,
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

    // Player
    if (this.tileCounter % 1000 == 0) {
      this.row = Phaser.Math.Between(0, 11) * 48 + 16;
      player.anims.play("player-shovelRight");
      player.x = -20;
      player.y = this.row;
      this.tweens.add({
        targets: player,
        ease: "Linear",
        x: 900,
        duration: 6000,
      });
    }
    if (this.tileCounter % 1000 == 500) {
      this.row = Phaser.Math.Between(0, 12) * 48 + 16;
      player.anims.play("player-shovelLeft");
      player.x = 800;
      player.y = this.row;
      this.tweens.add({
        targets: player,
        ease: "Linear",
        x: -20,
        duration: 6000,
      });
    }

    if (this.tileCounter % 1000 == 100) {
      yeti.anims.play("yeti-walkRight");
      yeti.x = -20;
      yeti.y = this.row;
      this.tweens.add({
        targets: yeti,
        ease: "Linear",
        x: 900,
        duration: 5000,
      });
    }
    if (this.tileCounter % 1000 == 600) {
      yeti.anims.play("yeti-walkLeft");
      yeti.x = 800;
      yeti.y = this.row;
      this.tweens.add({
        targets: yeti,
        ease: "Linear",
        x: -20,
        duration: 5000,
      });
    }
    if (this.tileCounter % 1000 == 600) {
      yeti.anims.play("yeti-walkLeft");
      yeti.x = 800;
      yeti.y = this.row;
      this.tweens.add({
        targets: yeti,
        ease: "Linear",
        x: -20,
        duration: 5000,
      });
    }

    var bodies = this.physics.overlapCirc(player.x, player.y, 3, true, true);
    _.each(bodies, function (body) {
      if (body && body.gameObject && body.gameObject.snowAmount) {
        if (body.gameObject.snowAmount > 0) {
          body.gameObject.snowAmount = 0;
          body.gameObject.setFrame(0);
        }
      }
    });
  },
});

function buildHighScores() {
  scene.loading = scene.add.text(400, 300, "Loading . . .", {
    fontFamily: 'myFont',
    fontSize: "32px",
    align: "center",
    stroke: '#330030',
    strokeThickness: 4
  });
  scene.loading.setOrigin(.5)  
  scene.scores = [] 
  if (submission) {
    $.ajax({
      type: "POST",
      // url: "https://us-dev.nightscapes.io/arena/score.php",
      url: "https://us-dev.nightscapes.io/snowball/score.php",
      data: { data: submission },
      dataType: "json",
      success: function (res) {
        scene.loading.visible = false
        _.each(res.scores, function (score, i) {
          let item = new ScoreItem(115, 150 + i * 30, i + 1, score.name, score.score)
          scene.scores.push(item)
          scene.add.existing(item);
        });
        if (res.position) {
          let item = new ScoreItem(115, 150 + 310, res.position, res.name, res.score)
          scene.scores.push(item)
          scene.add.existing(item);
        }
      },
    });
    submission = false
  } else {
    $.ajax({
      // url: "https://us-dev.nightscapes.io/arena/score.php",
      url: "https://us-dev.nightscapes.io/snowball/score.php",
      type: "GET",
      dataType: "json",
      success: function (res) {
        scene.loading.visible = false
        _.each(res.scores, function (score, i) {
          let item = new ScoreItem(
            115,
            150 + i * 30,
            i + 1,
            score.name,
            score.score
          );
          scene.add.existing(item);
          scene.scores.push(item)
        });
      },
    });
  }

}
