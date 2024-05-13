class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }

    create() {

        
        this.add.text(game.config.width / 2, game.config.height / 2, 'Thank you for playing!', {
            font: '40px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);  // 将文本居中

        this.add.text(game.config.width / 2, game.config.height / 2 + 50, 'Click to play again', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);  // 提示再玩一次的文本

    }

    update(){

        this.input.once('pointerdown', () => {
            this.scene.start('arrayBoom');  // 点击后重启游戏
            this.resetGameState();
        });

    }

    resetGameState() {
        // Reset player's health and position
        this.my.sprite.elephant.hp = 3;
        this.updateHPDisplay();
        this.my.sprite.elephant.x = game.config.width / 2;
        this.my.sprite.elephant.y = game.config.height - 40;
    
        // Clear and recreate bullets
        this.my.sprite.bullet.forEach(bullet => bullet.destroy());
        this.my.sprite.bullet = [];
    
        // Reset score
        this.myScore = 0;
        this.updateScore();
    
        // Reset other elements as needed
        this.my.sprite.hippo.x = game.config.width / 2;
        this.my.sprite.hippoBullets.forEach(bullet => bullet.destroy());
        this.my.sprite.hippoBullets = [];

        this.my.sprite.hippoHorizontal.x = game.config.width / 2;
        this.my.sprite.hippoBulletsHorizontal.forEach(bullet => bullet.destroy());
        this.my.sprite.hippoBulletsHorizontal = [];
    
        
    }
}