class ArrayBoom extends Phaser.Scene {
    constructor() {
        super("arrayBoom");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}}; 

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 10;           // Don't create more than this many bullets

        this.my.sprite.hippoBullets = [];
        this.maxHippoBullets = 5;
        
        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("elephant", "elephant.png");
        this.load.image("heart", "heart.png");
        this.load.image("hippo", "hippo.png");
        this.load.image("Boss", "hippo.png");
        this.load.image("HB", "hbullet.png");
        this.load.image("background", "back.png");
        
        

        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");
        

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("dadada", "jingles_NES13.ogg");
    }

    create() {
        let my = this.my;

        my.sprite.elephant = this.add.sprite(game.config.width/2, game.config.height - 40, "elephant");
        my.sprite.elephant.setScale(0.25);
        my.sprite.elephant.setDepth(1);
        my.sprite.elephant.hp = 3;

        my.sprite.hippo = this.add.sprite(game.config.width/2, 80, "hippo");
        my.sprite.hippo.setScale(0.25);
        my.sprite.hippo.setDepth(1);
        my.sprite.hippo.scorePoints = 25;
        my.sprite.hippo.velocity = Phaser.Math.Between(-10,10);

        my.sprite.Boss = this.add.sprite(-100, -100, "Boss");
        my.sprite.Boss.setScale(1.5);
        my.sprite.Boss.scorePoints = 100;
        my.sprite.Boss.visible = false;

        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background');
        this.background.setOrigin(0, 0);
        this.background.displayWidth = game.config.width;
        this.background.displayHeight = game.config.height;
        this.background.setDepth(-1);

        this.time.addEvent({
            delay: 1000, 
            callback: this.fireHippoBullet,
            callbackScope: this,
            loop: true
        });




        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,    // Note: case sensitive
            repeat: 5,
            hideOnComplete: true
        });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 5;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Array Boom.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);
        my.text.hp = this.add.bitmapText(580, 30, "rocketSquare", "HP: " + my.sprite.elephant.hp);

        // Put title on screen
        this.add.text(10, 5, "Hippo Hug!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });

    }

    update() {
        let my = this.my;

        this.background.tilePositionX += 1;


        // Move the hippo
        my.sprite.hippo.x += my.sprite.hippo.velocity;
        if (my.sprite.hippo.x <= 0|| my.sprite.hippo.x >= game.config.width - (my.sprite.hippo.displayWidth / 2)) {
            my.sprite.hippo.velocity *= -1; // Reverse direction on hitting bounds
        }

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.elephant.x > (my.sprite.elephant.displayWidth/2)) {
                my.sprite.elephant.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.elephant.x < (game.config.width - (my.sprite.elephant.displayWidth/2))) {
                my.sprite.elephant.x += this.playerSpeed;
            }
        }

        //hippo fire
        my.sprite.hippoBullets = my.sprite.hippoBullets.filter(bullet => {
            bullet.y += 3;
            if (bullet.y > game.config.height) {
                bullet.destroy();
                return false;
            }
            if (this.collides(bullet, my.sprite.elephant)) {
                my.sprite.elephant.hp -= 1;
                this.updateHPDisplay();
                bullet.destroy();
                if (my.sprite.elephant.hp <= 0) {
                    this.gameOver();
                }
                return false; // 子弹已处理，不保留
            }
            return true; // 保留未处理的子弹
        });

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.elephant.x, my.sprite.elephant.y-(my.sprite.elephant.displayHeight/2), "heart")
                );
            }

        }

        
         
        
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Check for collision with the hippo
        for (let bullet of my.sprite.bullet) {
            if (this.collides(my.sprite.hippo, bullet, my.sprite.Boss)) {
                // start animation
                this.puff = this.add.sprite(my.sprite.hippo.x, my.sprite.hippo.y, "whitePuff03").setScale(0.25).play("puff");

                
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                my.sprite.hippo.visible = false;
                my.sprite.hippo.x = -100;

                // Update score
                this.myScore += my.sprite.hippo.scorePoints;
                
                this.updateScore();
                // Play sound
                this.sound.play("dadada", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                // Have new hippo appear after end of animation
                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.my.sprite.hippo.visible = true;
                    this.my.sprite.hippo.x = Math.random()*config.width;
                }, this);

            }
        }
        

        


        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        //second
        if (this.myScore >= 200) {
            this.scene.start('second'); 
            this.myScore = 0;
        }

       

    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    fireHippoBullet() {
        if (this.my.sprite.hippoBullets.length < this.maxHippoBullets) {
            let Hbullet = this.add.sprite(this.my.sprite.hippo.x, this.my.sprite.hippo.y, 'HB');
            Hbullet.setScale(0.1);
            this.my.sprite.hippoBullets.push(Hbullet);
        }
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    spawnMiniBosses(x, y) {
        // Create two smaller Bosses
        let miniBoss1 = this.add.sprite(x - 50, y, "Boss").setScale(0.75);
        let miniBoss2 = this.add.sprite(x + 50, y, "Boss").setScale(0.75);
    
        // Set properties for mini Bosses
        miniBoss1.scorePoints = 50;  // Adjust score points for mini Bosses
        miniBoss2.scorePoints = 50;
    
        // Make mini Bosses visible
        miniBoss1.setVisible(true);
        miniBoss2.setVisible(true);
    
        
    }

    updateHPDisplay() {
        // Update the display for HP, assuming you have a method to show it
        let my = this.my;
        my.text.hp.setText("HP: " + my.sprite.elephant.hp);
        //console.log("HP: " + my.sprite.elephant.hp); // Or update a text object
    }
    
    gameOver() {
        let my = this.my;
        console.log("Game Over!");
        this.resetGameState();
        // Reset the game or return to a menu
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
         