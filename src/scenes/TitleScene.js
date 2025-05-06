class TitleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.image('titleBackground', 'assets/images/title_background.png');
        this.load.image('startButton', 'assets/images/start_button.png');
        this.load.audio('titleMusic', 'assets/audio/title_music.ogg');
        this.load.image('animal1', 'assets/images/animal1.png');
        this.load.image('animal2', 'assets/images/animal2.png');
        this.load.image('animal3', 'assets/images/animal3.png');
        this.load.image('animal4', 'assets/images/animal4.png');
    }

    create() {
        const background = this.add.image(400, 300, 'titleBackground');
        background.setDisplaySize(800, 600);

        this.music = this.sound.add('titleMusic', { loop: true, volume: 0.3 });
        this.music.play();

        // game title
        this.add.text(400, 150, 'Animal Rescue Mission', {
            fontSize: '48px',
            fill: '#ff9900',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startButton = this.add.image(400, 350, 'startButton')
            .setInteractive({ useHandCursor: true }) 
            .setScale(1) 
            .setOrigin(0.5);

 
        startButton.on('pointerover', () => {
            this.tweens.add({
                targets: startButton,
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        startButton.on('pointerout', () => {
            this.tweens.add({
                targets: startButton,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // click
        startButton.on('pointerdown', () => {
            console.log('Start button clicked!');
            this.music.stop();
            this.scene.start('GameScene');
        });

        this.add.text(400, 420, 'Click the button above to start', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.displayHighScores();

        this.createAnimations();

        this.add.text(400, 550, 'Use Arrow Keys to Move | Space to Shoot', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    displayHighScores() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        this.add.text(400, 200, 'High Scores', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        if (highScores.length === 0) {
            this.add.text(400, 240, 'No scores yet!', {
                fontSize: '24px',
                fill: '#aaaaaa'
            }).setOrigin(0.5);
        } else {
            highScores.sort((a, b) => b.score - a.score);
            for (let i = 0; i < Math.min(5, highScores.length); i++) {
                this.add.text(400, 240 + i * 30,
                    `${i + 1}. ${highScores[i].score} (Wave ${highScores[i].wave})`, {
                        fontSize: '24px',
                        fill: i === 0 ? '#ffd700' : '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setOrigin(0.5);
            }
        }
    }

    createAnimations() {
        const allAnimals = ['animal1', 'animal2', 'animal3', 'animal4'];

        const selectedAnimals = Phaser.Math.RND.shuffle(allAnimals).slice(0, 3);
        

        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(200, 550);
            const animal = this.add.sprite(x, y, selectedAnimals[i]).setScale(0.5);

            this.tweens.add({
                targets: animal,
                x: Phaser.Math.Between(100, 700),
                y: Phaser.Math.Between(300, 550),
                duration: Phaser.Math.Between(2000, 5000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });

            this.tweens.add({
                targets: animal,
                y: animal.y - 20,
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }
}
