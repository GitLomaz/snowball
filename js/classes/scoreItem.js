class ScoreItem extends Phaser.GameObjects.Container {
  // static counter = 0;

  constructor(x, y, number, name, score) {
    super(scene, x, y);
    let frame = scene.add.image(0, 5, "highscore");
    frame.setOrigin(0);
    this.add(frame);
    let num = scene.add.text(90, 6, displayNumber(number) + ".", {
      fontFamily: "myFont",
      fontSize: "24px",
      stroke: '#330030',
      strokeThickness: 4
    });
    num.setOrigin(1, 0);
    this.add(num);
    this.add(
      scene.add.text(98, 6, name, {
        fontFamily: "myFont",
        fontSize: "24px",
        stroke: '#330030',
        strokeThickness: 4
      })
    );
    this.add(
      scene.add.text(380, 6, displayNumber(score), {
        fontFamily: "myFont",
        fontSize: "24px",
        stroke: '#330030',
        strokeThickness: 4
      })
    );
  }
}
