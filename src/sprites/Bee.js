// 不再需要单独的Bee类，因为我们现在使用PathFollower
class Bee extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, texture) {
        super(scene, path, x, y, texture);
    }
}