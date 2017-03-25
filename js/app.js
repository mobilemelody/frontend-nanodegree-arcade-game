var numEnemies = 20;

var scoreStart = 0;
var heartsStart = 5;

var score = scoreStart;
var hearts = heartsStart;

// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.x = x;
	this.y = y;
	this.speed = speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	if (this.x < 5) {
		this.x += this.speed * dt;
	} else {
		this.x = -Math.floor((Math.random() * 50) + 1);
	}
	if (Math.ceil(this.x) === player.x && this.y === player.y) {
		player.reset();
		hearts -= 1;
	}

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
	this.sprite = 'images/char-cat-girl.png';
	this.x = 2;
	this.y = 5;
	this.speed = 0;
}
Player.prototype = Object.create(Enemy.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {
}

Player.prototype.handleInput = function(key) {
	switch(key) {
		case "left":
			if (this.x > 0) this.x -= 1;
			break;
		case "up":
			if (this.y === 1) {
				this.y -= 1;
				this.reset();
				score += 1;
			} else if (this.y > 1) {
				this.y -= 1;
			}
			break;
		case "right":
			if (this.x < 4) this.x += 1;
			break;
		case "down":
			if (this.y < 5) this.y += 1;
	}
}

Player.prototype.reset = function() {
	if (hearts > 0) {
		this.x = 2;
		this.y = 5;
	} 
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (i = 0; i < numEnemies; i++) {
	var x = -Math.floor((Math.random() * 50) + 1);
	var y = Math.floor((Math.random() * 3) + 1);
	var speed = Math.floor((Math.random() * 5) + 1);
	allEnemies.push(new Enemy(x, y, speed));
}
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
