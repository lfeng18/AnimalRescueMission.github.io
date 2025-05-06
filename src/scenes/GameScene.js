class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.animalThemes = [
            ['animal1', 'animal2'],  
            ['animal3', 'animal4'],  
            ['animal1', 'animal5'],  
        ];
        this.currentTheme = 0;
        this.isSlowed = false; // slow sign for web
        this.originalSpeed = 200;
        
    }

    getRandomAnimalType() {
        const theme = this.animalThemes[this.currentTheme];
        return theme[Math.floor(Math.random() * theme.length)];
        
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
        this.load.image('zookeeper', 'assets/images/zookeeper.png');
        this.load.image('animal1', 'assets/images/animal1.png');
        this.load.image('animal2', 'assets/images/animal2.png');
        this.load.image('animal3', 'assets/images/animal3.png');
        this.load.image('animal4', 'assets/images/animal4.png');
        this.load.image('animal5', 'assets/images/animal5.png');
        this.load.image('bee', 'assets/images/bee.png');
        this.load.image('spider', 'assets/images/spider.png');
        this.load.image('dart', 'assets/images/dart.png');
        this.load.image('sting', 'assets/images/sting.png');
        this.load.image('web', 'assets/images/web.png');
        this.load.image('heart', 'assets/images/heart.png');
        
        this.load.audio('shoot', 'assets/audio/shoot.ogg');
        this.load.audio('hit', 'assets/audio/hit.ogg');
        this.load.audio('beHit', 'assets/audio/behit.ogg');
        this.load.audio('animalSaved', 'assets/audio/saved.ogg');
        this.load.audio('gameOver', 'assets/audio/gameover.ogg');
        this.load.audio('waveComplete', 'assets/audio/wavecomplete.ogg');
    }

    create() {
        
        this.gameOver = false;
        this.score = 0;
        this.wave = 1;
        this.health = 5;
        this.multiplier = 1.0;
        this.consecutiveWaves = 0;
        this.animalsRescued = 0;
        this.timeSinceLastWave = 0;
        this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        // background
        const bg = this.add.image(400, 300, 'background');
        bg.setScale(3.5);
        
        // UI
        this.createUI();
        
        // player
        this.player = new Zookeeper(this, 400, 550);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(50, 80); // 

    
        this.animals = this.physics.add.group({ collideWorldBounds: true, bounceX: 0.5, bounceY: 0.5 });
        this.enemies = this.physics.add.group();
        this.darts = this.physics.add.group();
        this.stings = this.physics.add.group();
        this.webs = this.physics.add.group();
        
     
        this.physics.add.overlap(this.darts, this.animals, this.dartHitAnimal, null, this);
        this.physics.add.overlap(this.player, this.stings, this.playerHitSting, null, this);
        this.physics.add.overlap(this.player, this.webs, this.playerHitWeb, null, this);
        
        // bee shooting event
        this.events.on('beeShoot', (x, y) => {
            const sting = this.stings.create(x, y + 20, 'sting');
            sting.setScale(0.5);
            this.physics.world.enable(sting);
            sting.body.setVelocityY(200);
            sting.body.setAllowGravity(false);
            sting.body.setSize(20, 20); // 设置碰撞体大小
            this.sound.play('hit');
        });
        
        // spider shooting event
        this.events.on('spiderShoot', (x, y) => {
            const web = this.webs.create(x, y + 20, 'web');
            web.setScale(0.5);
            this.physics.world.enable(web);
            web.body.setVelocityY(150);
            web.body.setAllowGravity(false);
            this.sound.play('hit');
        });

        // input control
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        
        this.startWave();
        
    }

    createUI() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        
        this.waveText = this.add.text(400, 16, 'Wave: 1', { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        
        this.hearts = [];
        for (let i = 0; i < 5; i++) {
            this.hearts.push(this.add.image(50 + i * 30, 50, 'heart').setScale(0.5));
        }
        
        this.multiplierText = this.add.text(600, 16, 'Multiplier: 1.0x', { 
            fontSize: '24px', 
            fill: '#ff0',
            stroke: '#000',
            strokeThickness: 4
        });
    }

    update() {
        if (this.gameOver) return;
        
        this.player.update(this.cursors);
        
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.shootDart();
        }
        
        // check current wave
        if (this.animals.getChildren().length === 0 && this.enemies.getChildren().length === 0) {
            this.timeSinceLastWave += this.time.delta;
            if (this.timeSinceLastWave > 2000) {
                this.waveComplete();
            }
        }

        // limit animals movement
        this.animals.getChildren().forEach(animal => {
            if (!animal.isTranquilized && animal.active) {
                animal.x = Phaser.Math.Clamp(animal.x, 10, 790);
                animal.y = Phaser.Math.Clamp(animal.y, 10, 590);
            }
        });
    }

    shootDart() {
        const dart = new Dart(this, this.player.x, this.player.y - 20);
        this.darts.add(dart);
        this.physics.world.enable(dart);
        dart.body.setVelocityY(-300);
        this.sound.play('shoot');
    }

    playerHitSting(player, sting) {
        if (this.gameOver || !sting.active || !player.active) return;
        
        sting.destroy();
        this.loseHealth(1);
        this.sound.play('beHit');
    }

    playerHitWeb(player, web) {
    if (!web.active || !player.active || this.isSlowed) return;
    
    web.destroy(); 
    this.sound.play('beHit'); 

    // slow effect
    this.isSlowed = true;
    player.setVelocityX(player.body.velocity.x * 0.3); // slow down 30%
    
    // back to normal speed for 2s
    this.time.delayedCall(2000, () => {
        this.isSlowed = false;
        if (player.active) {
            player.setVelocityX(player.body.velocity.x / 0.3); 
        }
    });
}

    startWave() {
        this.timeSinceLastWave = 0;
        
        const animalCount = 8 + Math.floor(this.wave / 2);
        for (let i = 0; i < animalCount; i++) {
            this.spawnAnimal();
        }
        
        this.createBees();
        this.createSpiders();
    }

    createBees() {
        const beePath1 = new Phaser.Curves.Path(100, 0);
        beePath1.cubicBezierTo(200, 50, 0, 150, 100, 200);

        
        const beePath2 = new Phaser.Curves.Path(700, 0);
        beePath2.cubicBezierTo(600, 50, 800, 150, 700, 200);

        
        const bee1 = this.add.follower(beePath1, 100, 0, 'bee');
        bee1.setScale(0.7);
        bee1.startFollow({
            duration: 8000,
            repeat: -1,
            rotateToPath: true,
            rotationOffset: 90
        });
        this.enemies.add(bee1);

        
        const bee2 = this.add.follower(beePath2, 700, 0, 'bee');
        bee2.setScale(0.7);
        bee2.startFollow({
            duration: 8000,
            repeat: -1,
            rotateToPath: true,
            rotationOffset: 90
        });
        this.enemies.add(bee2);

        // bee shooting timer
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (bee1.active) this.events.emit('beeShoot', bee1.x, bee1.y);
                if (bee2.active) this.events.emit('beeShoot', bee2.x, bee2.y);
            },
            loop: true
        });
    }

    createSpiders() {
        const spiderPath1 = new Phaser.Curves.Path(0, 100);
        spiderPath1.lineTo(800, 100);
        

        const spiderPath2 = new Phaser.Curves.Path(800, 300);
        spiderPath2.lineTo(0, 300);

      
        const spider1 = this.add.follower(spiderPath1, 0, 100, 'spider');
        spider1.setScale(0.5);
        spider1.startFollow({
            duration: 5000,
            repeat: -1
        });
        this.enemies.add(spider1);

     
        const spider2 = this.add.follower(spiderPath2, 800, 300, 'spider');
        spider2.setScale(0.5);
        spider2.startFollow({
            duration: 5000,
            repeat: -1
        });
        this.enemies.add(spider2);

        // spider shooting timer
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (spider1.active) this.events.emit('spiderShoot', spider1.x, spider1.y);
                if (spider2.active) this.events.emit('spiderShoot', spider2.x, spider2.y);
            },
            loop: true
        });
    }

    spawnAnimal() {
        const type = this.getRandomAnimalType();
        
        let x, y;
        if (Math.random() < 0.5) {
            x = Phaser.Math.Between(100, 700);
            y = -50;
        } else {
            x = Math.random() < 0.5 ? -50 : 850;
            y = Phaser.Math.Between(100, 400);
        }
        
        const animal = new Animal(this, x, y, type);
        this.animals.add(animal);
    }

    dartHitAnimal(dart, animal) {
        if (!dart.active || !animal.active) return;
        
        dart.destroy();
        
        if (animal.isTranquilized) return;
        
        animal.tranquilize();
        this.animalsRescued++;
        this.addScore(10);
        this.sound.play('animalSaved');
    
    
        this.time.delayedCall(2000, () => {
            if (animal.active) {
                animal.destroy();
                this.checkWaveCompletion(); 
            }
        });
    }
    
    checkWaveCompletion() {
        const remainingAnimals = this.animals.getChildren()
            .filter(animal => animal.active && !animal.isTranquilized).length;
        
        console.log(`Remaining animals: ${remainingAnimals}`);
        
        if (remainingAnimals === 0) {
            this.waveComplete();
        }
    }

    addScore(points) {
        this.score += Math.floor(points * this.multiplier);
        this.scoreText.setText(`Score: ${this.score}`);
    }

    loseHealth(amount) {
        this.health -= amount;
        this.updateHearts();
        
        if (this.health <= 0) {
            this.gameOver = true;
            this.sound.play('gameOver');
            this.showGameOver();
        }
    }

    updateHearts() {
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].setVisible(i < this.health);
        }
    }

    waveComplete() {
        this.animals.clear(true, true);
        this.currentTheme = (this.currentTheme + 1) % this.animalThemes.length;
        this.consecutiveWaves++;
        
        if (this.animalsRescued === (8 + Math.floor(this.wave / 2))) {
            this.addScore(50);
        }
        
        if (this.wave % 3 === 0 && this.health < 5) {
            this.health++;
            this.updateHearts();
        }
        
        if (this.consecutiveWaves > 1) {
            this.multiplier = 1.0 + Math.min(2.0, this.consecutiveWaves * 0.1);
            this.multiplierText.setText(`Multiplier: ${this.multiplier.toFixed(1)}x`);
        }
        
        this.sound.play('waveComplete');
        
        const waveCompleteText = this.add.text(400, 300, 'Wave Complete!', { 
            fontSize: '48px', 
            fill: 'rgb(255, 165, 0)',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            waveCompleteText.destroy();
            this.wave++;
            this.waveText.setText(`Wave: ${this.wave}`);
            this.animalsRescued = 0;
            this.startWave();
        });
    }

    showGameOver() {
        this.saveHighScore();

        this.gameOver = true; 
        this.player.setActive(false).setVelocity(0, 0);
        this.webs.children.iterate(web => web.setActive(false));
        this.stings.children.iterate(sting => sting.setActive(false));
        
        const gameOverText = this.add.text(400, 300, 'Game Over', { 
            fontSize: '64px', 
            fill: '#f00',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const scoreText = this.add.text(400, 350, `Final Score: ${this.score}`, { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const highScoreText = this.add.text(400, 400, 'High Scores:', { 
            fontSize: '24px', 
            fill: '#ff0',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.highScores.sort((a, b) => b.score - a.score);
        for (let i = 0; i < Math.min(3, this.highScores.length); i++) {
            this.add.text(400, 440 + i * 30, 
                `${i+1}. ${this.highScores[i].score} (Wave ${this.highScores[i].wave})`, { 
                    fontSize: '20px', 
                    fill: '#fff',
                    stroke: '#000',
                    strokeThickness: 2
                }).setOrigin(0.5);
        }
        
        this.time.delayedCall(5000, () => {
            this.scene.start('TitleScene');
        });
    }

    saveHighScore() {
        
        const newScore = {
            score: this.score,
            wave: this.wave,
            date: new Date().toLocaleDateString()
        };
        
        
        let highScores = [];
        try {
            const savedScores = localStorage.getItem('highScores');
            highScores = savedScores ? JSON.parse(savedScores) : [];
        } catch (e) {
            console.error('Failed to parse high scores:', e);
            highScores = [];
        }
        
      
        highScores.push(newScore);
        highScores.sort((a, b) => b.score - a.score);
        
       
        if (highScores.length > 3) {
            highScores = highScores.slice(0, 3);
        }
        
       
        try {
            localStorage.setItem('highScores', JSON.stringify(highScores));
        } catch (e) {
            console.error('Failed to save high scores:', e);
        }
        
    
        this.highScores = highScores;
    }
}