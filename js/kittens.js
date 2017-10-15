// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 3;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;

var NEW_LIFE_WIDTH = 75;
var NEW_LIFE_HEIGHT = 54;
var MAX_NEW_LIVES = 2;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';

// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});





// This section is where you will be doing most of your coding
class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

class FallingItem extends Entity {
    constructor() {
        super();
    }
    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}
class Enemy extends FallingItem{
    constructor(xPos, score) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];
        this.score = score;

        // Each enemy should have a different speed
        var excelerator = score > 2500 ? 2 : score > 3500 ? 3 : 1;
        this.speed = (Math.random() / 3 + 0.2) * excelerator;
    }

}

class NewLife extends FallingItem{
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -NEW_LIFE_HEIGHT;
        this.sprite = images['player.png'];
       
        //var excelerator = score > 2500 ? 2 : score > 3500 ? 3 : 1;
        this.speed = (Math.random() / 2 + 0.25);

    }
}

class Player extends Entity{
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        } 
        else if (direction === MOVE_UP && this.y > 0) {
            this.y = this.y - PLAYER_HEIGHT;
        } 
        else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT) {
            this.y = this.y + PLAYER_HEIGHT;
        }
    }

    
}





/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();
        // Setup enemies, making sure there are always three
        this.setupEnemies();
        //set lives
        this.lives = 2;
        //setup new lives
       // this.setupNewLives();
        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH; //5

        var enemySpot; //undefined
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH, this.score);
        console.log('this is enemy spot',enemySpot*ENEMY_WIDTH);
        
    }

    // setupNewLives() {
    //     this.newLives = [];
    //     while (newLives.length < MAX_NEW_LIVES) {
    //         this.addNewLife();
    //     }
       // if (!this.newLives) {
        //     this.newLives = [];
        // }
       

        // while (this.newLives.length < MAX_NEW_LIVES) {
        //     this.addNewLife();
        // }
    
    // }

    // addNewLife() {
    //     var newLifeSpots = GAME_WIDTH / NEW_LIFE_WIDTH;
    //     var newLifeSpot; //undefined
        // // Keep looping until we find a free enemy spot at random
        // while (newLifeSpot === undefined || this.newLives[newLifeSpot]) {
        //     newLifeSpot = Math.floor(Math.random() * newLifeSpots);
        // }

    //     // this.newLifeSpots[newLifeSpot] = new NewLife(newLifeSpot * NEW_LIFE_WIDTH);
    //     console.log('this is NEW LIFE spot',NEW_LIFE_WIDTH);

    // }

    lostLife() {
        this.lives = this.lives - 1;
        return this.lives;
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            else if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            }
            else if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            }
        });

        this.gameLoop();
        addNewLife();
    }

    restart() {
        document.getElementById("controls").style.display = "none";
        this.score = 0;
        this.lastFrame = Date.now();
        this.enemies = [];
        this.player.x = 2 * PLAYER_WIDTH;
        this.player.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.lives = 2;
        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;
        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies & new lives
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        // this.newLives.forEach(newLife => newLife.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
      // this.newLives.forEach(newLife => newLife.render(this.ctx)); // draw new lives
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();
       
        // check if any new lives should die
        // this.newLives.forEach((newLife, newLifeIdx) => {
        //     if (newLife.y > GAME_HEIGHT) {
        //         delete this.newLives[newLifeIdx];
        //     }
        // });
        // this.setupNewLives();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
           // this.ctx.textAlign = 'center'
            this.ctx.font = "60px Verdana";
            // Create gradient
            var gradient = this.ctx.createLinearGradient(0,0,GAME_WIDTH,0);
            gradient.addColorStop("0","magenta");
            gradient.addColorStop("0.5","blue");
            gradient.addColorStop("1.0","red");
            //  Fill with gradient
            this.ctx.fillStyle = gradient;
            this.ctx.fillText('GAME OVER', 5, GAME_HEIGHT / 3);
            this.ctx.font = 'bold 30px Calibri';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + '... not too shabby!', 50, 300)
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
        var checkForDead = (enemy) => {
            if (this.lives < 1) {
                document.getElementById("controls").style.display = "block";
                return true
            }
            if(enemy.x === this.player.x && enemy.y + ENEMY_HEIGHT > this.player.y && enemy.y < this.player.y + PLAYER_HEIGHT)  {
                this.lostLife();
                this.enemies.forEach((enemy, enemyIdx) => {
                    {delete this.enemies[enemyIdx];
                    }
                });
                
            }
        }
        return this.enemies.some(checkForDead)
        
    }
}


var restartGame = function() {
    gameEngine.restart();
}
document.getElementById("restart-button").onclick = restartGame;




// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));

gameEngine.start();