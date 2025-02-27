let scene; // game scene
let tileArray = []; // array of all game tiles
let player; // player object
let snowCounter; // snow text oject
let scoreCounter; // score text oject
let yetiCounter; // yeti text oject
let levelCounter; // level text oject
let healthCounter; // health text oject
let counter = -1; // throw counter
let gathering = false; // gathering snow flag
let action = "throw"; // action, 'wall', 'tower', 'sell', or 'throw'
let loadingBar; // loading bar for actions
let loadingTween; // loading bar tween, interupt to cancel build
let puCounter = 0; // counter to spawn powerups
let cooldownTween; // tween that runs when taking damage
let yetiLevel = 1; // yeti level
let yetiDeaths = 0; // total killed
let alertText; // notices
let animal = animals[Phaser.Math.Between(0, 191)].toUpperCase();

// item select menu
let btnSnow;
let btnWall;
let btnTower;
let btnSell;

// modifyable variables
let shovelSpeed = 80;
let snowTick = 1000;
let snowfallRate = 3;

let showScores = false;
let submission = false;

// other
let powerups = ["snow", "shovel", "shovel", "shovel", "heart"];
