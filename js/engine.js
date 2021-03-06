/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if (hearts > 0) {
			win.requestAnimationFrame(main);
		} else {
			reset();
		}
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
		render();	
		// Instructions
		var textX = 250;
		var textY = 180;
		ctx.fillStyle = 'black';
		ctx.fillRect(50,100,400,400);
		ctx.font = '20px Courier New';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('Cross the road without', textX, textY);
		ctx.fillText('getting hit by a bug.', textX, textY + 30);
		ctx.fillText('Earn 1 point each time', textX, textY + 70);
		ctx.fillText('you cross successfully.', textX, textY + 100);
		ctx.fillText('You have ' + hearts + ' tries total.', textX, textY + 140);
		ctx.fillText('Collect gems for extra points', textX, textY + 180);
		ctx.fillText('or hearts to re-up your health.', textX, textY + 210);
		ctx.fillText('Press Enter to start', textX, textY + 270);
		// Add key listener
		document.onkeyup = function(e) {
			var key = e.keyCode ? e.keyCode : e.which;
			if (key === 13) chooseCharacter();
		}
    }

	// Call function to render characters, add key listener
	function chooseCharacter() {
		choosingChar = true;
		render();
		renderChars(chosenChar);
		var choice = chosenChar;
		document.onkeyup = function(e) {
			var key = e.keyCode ? e.keyCode : e.which;
			if (choosingChar) {
				if (key === 13) {
					choosingChar = false;
					chosenChar = choice;
					player.sprite = characters[chosenChar];
					chooseLevel();
				} else if (key === 37) { // left
					if (choice > 0) {
						choice--;
						renderChars(choice);
					}
				} else if (key === 39) { // right
					if (choice < characters.length - 1) {
						choice++;
						renderChars(choice);
					}
				}
			}
		}
	}
	
	// Render character choices
	function renderChars(chosenChar) {
		ctx.fillStyle = 'black';
		ctx.fillRect(0,250,505,200);
		ctx.font = '20px Courier New';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('Choose your character', 250, 300);
		characters.forEach(function(item, index) {
			ctx.drawImage(Resources.get(item), index * 101, 270);
		}); 
		ctx.strokeStyle='#FFFFFF';
		ctx.strokeRect(chosenChar * 101 + 10,320,80,100);
	}
	
	// Choose level
	function chooseLevel() {
		choosingLevel = true;
		render();
		renderLevels(level);
		var choice = level;
		document.onkeyup = function(e) {
			var key = e.keyCode ? e.keyCode : e.which;
			if (choosingLevel) {
				if (key === 13) {
					choosingLevel = false;
					level = choice;
					generateEnemies(level);
					startGame();
				} else if (key === 37) { // left
					if (choice > 0) {
						choice--;
						renderLevels(choice);
					}
				} else if (key === 39) { // right
					if (choice < levelNames.length - 1) {
						choice++;
						renderLevels(choice);
					}
				}
			}
		}
	}
	
	// Render levels dialog box
	function renderLevels(level) {
		ctx.fillStyle = 'black';
		ctx.fillRect(0,250,505,200);
		ctx.font = '20px Courier New';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('Choose a level', 250, 300);
		levelNames.forEach(function(item, index) {
			ctx.fillText(item, index * 150 + 100, 350);
		}); 
		ctx.strokeStyle='#FFFFFF';
		ctx.strokeRect(level * 150 + 50,320,100,50);
	}

	function startGame() {
		gameStarted = true;
		score = scoreStart;
		hearts = heartsStart;
		lastTime = Date.now();
		main();
	}

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
		gem.update();
		heartGem.update();
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        if (gameStarted) renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
		if (gem.active) gem.render();
		if (heartGem.active) heartGem.render();
		
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
		
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,505,40);
		
		ctx.font = '20px Courier New';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'left';
		ctx.fillText('Score: ' + score, 10, 25);
		
		for (i = 0; i < hearts; i++) {
			ctx.drawImage(Resources.get('images/Heart.png'), 300 + (i * 25), 0, 25, 35);
		}
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
		gameStarted = false;
		hearts = heartsStart;
		
		// Game over message
		ctx.fillStyle = 'black';
		ctx.fillRect(50,100,400,400);
		ctx.font = '40px Courier New';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('GAME OVER', 250, 250);
		ctx.font = '20px Courier New';
		var scoreText = (score === 1) ? ' point' : ' points';
		ctx.fillText('You scored ' + score + scoreText, 250, 300);
		ctx.fillText('Press Enter to play again', 250, 420);
		ctx.fillText('or Space to change game options', 250, 450);
		
		// Add key listeners
		document.onkeyup = function(e) {
			var key = e.keyCode ? e.keyCode : e.which;
			if (key === 13) {
				resetObjects();
				render();
				startGame();
			} else if (key === 32) {
				resetObjects();
				render();
				chooseCharacter();
			}
		}
    }

	function resetObjects() {
		gem.reset();
		gem.active = true;
		heartGem.reset();
		heartGem.active = false;
		player.reset();
	}

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png',
		'images/Heart.png',
		'images/gem-blue.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
