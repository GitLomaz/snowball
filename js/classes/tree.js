class Tree extends Phaser.Physics.Arcade.Sprite {
  constructor(x, y) {
    super(scene, x, y, 'tree');
    this.setDepth(5)
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.body.width = 10
    this.body.height = 10
    this.body.setOffset(20, 84)
  }
}
