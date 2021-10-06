/*
TODO's and Ideas:

High score list, complete with API endpoint to store highscores

*/

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#2d2d2d",
  parent: "wrapper",
  scene: [menuScene, gameScene],
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: { y: 0 },
    },
  },
};

let game = new Phaser.Game(config);
