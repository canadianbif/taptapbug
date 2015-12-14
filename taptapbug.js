var currentLevel = 0;
var isPaused = false;
var isGameGoing = false;
if (!localStorage.oneHighScore) {
	localStorage.setItem("oneHighScore", 0)
}
if (!localStorage.twoHighScore) {
	localStorage.setItem("twoHighScore", 0)
}

// Response to user tapping/clicking
function getPosition(event) {
	if (!isPaused && isGameGoing) {
		var x = event.offsetX;
		var y = event.offsetY;
		var click = new coordinate(x, y);
		for (i = 0; i < bugList.length; i++) {
			var bugPositionOne = new coordinate(bugList[i].coordinates.x, bugList[i].coordinates.y);
			var bugPositionTwo = new coordinate(bugList[i].coordinates.x, bugList[i].coordinates.y);
			bugPositionOne.x -= 8 * Math.cos(bugList[i].angle);
			bugPositionOne.y -= 8 * Math.sin(bugList[i].angle);
			bugPositionTwo.x += 8 * Math.cos(bugList[i].angle);
			bugPositionTwo.y += 8 * Math.sin(bugList[i].angle);
			debugger;
			if (checkOverlap(bugPositionOne, click, 33) || checkOverlap(bugPositionTwo, click, 33)) {
				bugList[i].dead = true;
				switch (bugList[i].color) {
					case "orange":
						score++;
						break;
					case "red":
						score += 3;
						break;
					case "black":
						score += 5;
						break;
				}
				document.getElementById("score-num").innerHTML = score;
			}
		}
	}
}

function makeBug() {
	this.dead = false;
	this.color;
	this.speed;
	var colorProb = Math.random();
	if (colorProb < 0.3) {
		this.color = "black";
	} else if (colorProb >= 0.3 && colorProb < 0.6) {
		this.color = "red";
	} else {
		this.color = "orange";
	}

	if (currentLevel == 1) {
		switch (this.color) {
			case "orange":
				this.speed = 2;
				break;
			case "red":
				this.speed = 2.5;
				break;
			case "black":
				this.speed = 5;
				break;
		}
	} else {
		switch (this.color) {
			case "orange":
				this.speed = 2.67;
				break;
			case "red":
				this.speed = 3.33;
				break;
			case "black":
				this.speed = 6.67;
				break;
		}
	}

	this.opacity = 1;
	var x = Math.floor(Math.random() * 380) + 10;
	this.coordinates = new coordinate(x + 5, -22);
	this.angle = 0 - Math.PI / 2;
	drawAnt(this.color, this.coordinates);

	this.move = function() {
		var closestFood = getClosestFood(this.coordinates);
		var desiredAngle = getDesiredAngle(this.coordinates, closestFood);
		if (this.angle != desiredAngle) {
			this.angle = getNewAngle(this.angle, desiredAngle);
		}
		this.coordinates.x -= this.speed * Math.cos(this.angle);
		this.coordinates.y -= this.speed * Math.sin(this.angle);
		context.save();
		context.translate(this.coordinates.x, this.coordinates.y);
		context.rotate(this.angle - Math.PI / 2);
		drawAnt(this.color);
		context.restore();

		if (checkOverlap(this.coordinates, closestFood, 30)) {
			var index = food.indexOf(closestFood);
			if (index > -1) {
    			food.splice(index, 1);
			}
			foodRemaining--;
		}
	};

	this.kill = function() {
		context.save();
		context.translate(this.coordinates.x, this.coordinates.y);
		context.rotate(this.angle - Math.PI / 2);
		context.globalAlpha = this.opacity;
		drawAnt(this.color);
		context.restore();

		this.opacity -= 0.0167;
		if (this.opacity <= 0) {
			var index = bugList.indexOf(this);
			if (index > -1) {
    			bugList.splice(index, 1);
			}
		}
	};
}

function drawAnt(color, coordinates) {
	coordinates = typeof coordinates !== 'undefined' ?  coordinates : new coordinate(0,0);
	x = coordinates.x;
	y = coordinates.y;
	context.beginPath();
	context.moveTo(x, y-10);
	context.bezierCurveTo(x+4, y-10, x+4, y-20, x, y-20);
	context.bezierCurveTo(x-4, y-20, x-4, y-10, x, y-10);
	context.bezierCurveTo(x-7, y-10, x-7, y+20, x, y+20);
	context.bezierCurveTo(x+7, y+20, x+7, y-10, x, y-10);
	context.closePath();
	context.fillStyle = color;
    context.fill();
    context.strokeStyle = 'grey';
	context.stroke(); 
}

function getDesiredAngle(antCoord, foodCoord) {
	if (typeof(foodCoord) == "object") {
		var yDiff = antCoord.y - foodCoord.y;
		var xDiff = antCoord.x - foodCoord.x;
		return Math.atan2(yDiff, xDiff);
	}
	return 0;
}

function checkOverlap(antCoord, foodCoord, distanceLimit) {
	if (typeof(foodCoord) == "object") {
		var xDiff = antCoord.x - foodCoord.x;
		var yDiff = antCoord.y - foodCoord.y;
		var distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
		if (distance < distanceLimit) {
			return true;
		}
	}
	return false;
}

function getNewAngle(angle, desiredAngle) {
	var rotation = Math.PI / 48;
	desiredAngle = desiredAngle % (2 * Math.PI);
	angle = angle % (2 * Math.PI);
	if (Math.abs(angle - desiredAngle) < Math.PI) {
		if (angle < desiredAngle) {
			angle += Math.min(rotation, (desiredAngle - angle));
		} else {
			angle -= Math.min(rotation, (angle - desiredAngle));
		}
	} else {
		if (angle < desiredAngle) {
			desiredAngle -= 2 * Math.PI;
			angle -= Math.min(rotation, (angle - desiredAngle));
		} else {
			desiredAngle += 2 * Math.PI;
			angle += Math.min(rotation, (desiredAngle - angle));
		}
	}
	return angle;
}

function getClosestFood(antCoord) {
	var closestFoodDist = 2000;
	var closestFoodCoord;
	for (i = 0; i < food.length; i++) {
		var foodCoord = food[i];
		var xDiff = antCoord.x - foodCoord.x;
		var yDiff = antCoord.y - foodCoord.y;
		var distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
		if (distance < closestFoodDist) {
			closestFoodDist = distance;
			closestFoodCoord = foodCoord;
		}
	}
	return closestFoodCoord;
}

function nextFrame() {
	if (!isPaused && isGameGoing) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (var i in bugList) {
			ant = bugList[i];
			if (ant.dead == true) {
				ant.kill();
			} else {
				ant.move();
			}
		}
		for (i = 0; i < food.length; i++) {
			context.beginPath();
			context.arc(food[i].x, food[i].y, 10, 0, 2 * Math.PI, false);
			context.fillStyle = '#33CC33';
			context.fill();
			context.strokeStyle = 'green';
			context.stroke();
		}
	}
}

function startGame() {
	document.getElementById("game-over").style.display = "none";
	if (currentLevel == 0) {
		var levels = document.getElementsByName("level");
		for (var i = 0; i < levels.length; i++) {
			if (levels[i].checked) {
				currentLevel = levels[i].value;
			}
		}
	}
	document.getElementById("title-screen").style.display = "none";
	document.getElementById("game-screen").style.display = "block";
	setupLevel();
}

function setupLevel() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	foodRemaining = 5;
	timeRemaining = 60;
	score = 0;
	document.getElementById("time-num").innerHTML = timeRemaining;
	document.getElementById("score-num").innerHTML = score;
	document.getElementById("level-num").innerHTML = currentLevel;
	placeFood();
	bugList = new Array();
	document.getElementById("level-text").style.display = "block";
	setTimeout(startLevel, 2000);
}

function placeFood() {
	food = new Array();
	for (i = 0; i < 5; i++) {
		var yCoord = Math.floor((Math.random() * 230)) + 130 + ((i % 2) * 230);
		var xCoord = Math.floor((Math.random() * 76)) + 10 + (i * 76)
		food.push(new coordinate(xCoord, yCoord));
		context.beginPath();
		context.arc(xCoord, yCoord, 10, 0, 2 * Math.PI, false);
		context.fillStyle = '#33CC33';
		context.fill();
		context.strokeStyle = 'green';
		context.stroke();
	}
}

function coordinate(x, y) {
    this.x = x;
    this.y = y;
}

function startLevel() {
	document.getElementById("level-text").style.display = "none";
	timeToSpawn = 0;
	timer = window.setInterval(decrementTimer, 1000);
	isGameGoing = true;
	movementTimer = window.setInterval(nextFrame, 33);
};

function decrementTimer() {
	if (!isPaused) {
		if (timeRemaining > 0 && foodRemaining > 0) {
			timeRemaining--;
			document.getElementById("time-num").innerHTML = timeRemaining;
		} else if (foodRemaining == 0) {
			isGameGoing = false;
			clearInterval(timer);
			clearInterval(movementTimer);
			updateHighScore(score, currentLevel);
			resultsScreen(false);
		} else if (timeRemaining == 0) {
			// Reset timer and save high score
			isGameGoing = false;
			clearInterval(timer);
			clearInterval(movementTimer);
			updateHighScore(score, currentLevel);
			if (currentLevel == 1) {
				currentLevel = 2;
				// Move to next level
				setupLevel();
			} else if (currentLevel == 2) {
				// Reset game
				resultsScreen(true);
			}
		}

		if (timeToSpawn == 0) {
			timeToSpawn = Math.floor(Math.random() * 3) + 1;
			var newBug = new makeBug();
			bugList.push(newBug);
		}
		timeToSpawn--;
	}
}

function updateHighScore(score, level) {
	if (level == 1) {
		if (score > localStorage.oneHighScore) {
			localStorage.setItem("oneHighScore", score);
		}
	} else if (level == 2) {
		if (score > localStorage.twoHighScore) {
			localStorage.setItem("twoHighScore", score);
		}
	}
}

function resultsScreen(didWin) {
	if (didWin) {
		document.getElementById("lose").style.display = "none";
		document.getElementById("win").style.display = "inline";
	} else {
		document.getElementById("win").style.display = "none";
		document.getElementById("lose").style.display = "inline";
	}
	document.getElementById("total-score").innerHTML = score;
	document.getElementById("game-over").style.display = "block";
}

function pauseUnpause() {
	if (isGameGoing) {
		var pauseButtonImage = document.getElementById("play-pause");
		if (isPaused === false) {
			// Pause Game
			isPaused = true;
			pauseButtonImage.src = "images/play.png";
			document.getElementById("pause-text").style.display = "block";
		} else {
			// Unpause Game
			pauseButtonImage.src = "images/pause.png"
			document.getElementById("pause-text").style.display = "none";
			isPaused = false;
		}
	}
}

function mainMenu() {
	currentLevel = 0;
	if (document.getElementById("level-one").checked) {
		document.getElementById("high-score").innerHTML = localStorage.oneHighScore;
	} else {
		document.getElementById("high-score").innerHTML = localStorage.twoHighScore;
	}
	document.getElementById("game-over").style.display = "none";
	document.getElementById("title-screen").style.display = "block";
	document.getElementById("game-screen").style.display = "none";
}

window.onload = function() {
	canvas = document.getElementById("game-canvas");
	context = canvas.getContext("2d");
	/*-- Listen for click event --*/
	canvas.addEventListener("mousedown", getPosition, false);
	document.getElementById("high-score").innerHTML = localStorage.oneHighScore;
	document.getElementById("start-button").onclick = startGame;
	document.getElementById("play-pause").onclick = pauseUnpause;
	document.getElementById("restart").onclick = startGame;
	document.getElementById("exit").onclick = mainMenu;

	document.getElementById("level-one").onclick = function() {
		document.getElementById("high-score").innerHTML = localStorage.oneHighScore;
	}
	document.getElementById("level-two").onclick = function() {
		document.getElementById("high-score").innerHTML = localStorage.twoHighScore;
	}
};