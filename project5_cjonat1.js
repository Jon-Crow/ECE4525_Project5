var sketchProc = function(processingInstance) 
{
 with (processingInstance) 
 {
	/*
	*/
	//Author:          Jonathan Crow
	//PID:             cjonat1
	//Completion Date: 09/27/2019
	//Assignment:      Project 4
	frameRate(60);
	size(400,400);
	
	/*-------------------------
	Degree to radian conversion
	constants
	-------------------------*/
	var deg0     = 0;
	var deg90    = Math.PI/2;
	var deg180   = Math.PI;
	var deg270   = 3*Math.PI/2;
	var deg360   = 2*Math.PI;
	var degToRad = Math.PI/180;
	
	var keyArray = [];
	
	var keyPressed = function() 
	{
		keyArray[keyCode] = 1;
	};
	var keyReleased = function() 
	{
		keyArray[keyCode] = 0;
	};
	var mouseReleased = function()
	{
		gameState.clickEvent(mouseX, mouseY);
	};
	
	var Animation = function(sprites, delay)
	{
		this.sprites    = sprites;
		this.delay      = delay;
		this.curFrame   = 0;
		this.frameCount = 0;
	};
	Animation.prototype.display = function(x, y, w, h)
	{
		image(this.sprites[this.curFrame],x-w/2,y-h/2,w,h);
	};
	Animation.prototype.update = function()
	{
		this.frameCount++;
		if(this.frameCount >= this.delay)
		{
			this.frameCount = 0;
			this.curFrame++;
			if(this.curFrame >= this.sprites.length)
				this.curFrame = 0;
		}
	};
	
	var imgs         = [];
	var imgShipSmall = 0;
	var imgCannon    = 1;
	
	var cannonSounds = [];
	
	var getSprites = function(startX, startY, endX, endY)
	{
		var sprites = [];
		for(var y = startY; y <= endY; y++)
			for(var x = startX; x <= endX; x++)
				sprites.push(loadImage("img/sprites/sprite" + x + "_" + y + ".png"));
		return sprites;
	}
	var initImages = function()
	{
		//SOURCE: https://i.pinimg.com/564x/a8/51/81/a85181945c60c35174872c3c3e1465ef--ship-map-rpg-map.jpg
		//SOURCE: https://opengameart.org/content/bomb-party
		imgs[imgShipSmall] = loadImage("img/ship1.png");
		imgs[imgCannon]    = loadImage("img/cannon.png");
	};
	
	var initSounds = function()
	{
		//source: https://opengameart.org/content/9-explosion-sounds
		for(var i = 0; i < 9; i++)
			cannonSounds[i] = new Audio("sound/explosion0" + (i+1) + ".wav");
	};
	
	var lastCannon = -1;
	var playRandomCannon = function()
	{
		var cannon;
		do
			cannon = Math.trunc(cannonSounds.length*random());
		while(cannon === lastCannon);
		cannonSounds[cannon].play();
		lastCannon = cannon;
	};
	
	initImages();
	initSounds();
	
	var MenuGameState = function()
	{
		this.play = false;
	};
	MenuGameState.prototype.display = function()
	{
		background(10,10,100);
		image(imgs[imgShipSmall], 50, 50);
	};
	MenuGameState.prototype.update = function()
	{};
	MenuGameState.prototype.getNextState = function()
	{
		return this.play ? new PlayGameState() : this;
	};
	MenuGameState.prototype.clickEvent = function(x, y)
	{
		this.play = true;
	};
	
	var PlayGameState = function()
	{
		this.ship1Pos = new PVector(0, -50, 0);
		this.ship1Vel = new PVector(0, 0,   0);
		this.ship2Pos = new PVector(0, 300, 0);
		this.ship2Vel = new PVector(0, 0,   0);
	};
	PlayGameState.prototype.display = function()
	{
		background(10,10,100);
		image(imgs[imgShipSmall], this.ship1Pos.x, this.ship1Pos.y, 400, 150);
		image(imgs[imgShipSmall], this.ship2Pos.x, this.ship2Pos.y, 400, 150);
	};
	PlayGameState.prototype.update = function()
	{
		this.moveShip(this.ship1Pos, this.ship1Vel, -60, -40);
		this.moveShip(this.ship2Pos, this.ship2Vel, 290, 310);
	};
	PlayGameState.prototype.getNextState = function()
	{
		return this;
	};
	PlayGameState.prototype.clickEvent = function(x, y)
	{};
	PlayGameState.prototype.moveShip = function(pos, vel, minY, maxY)
	{
		pos.add(vel);
		if(pos.x < -10)
			vel.set(0.2,0,0);
		else if(pos.x > 10)
			vel.set(-0.2,0,0);
		else if(pos.y < minY)
			vel.set(0,0.2,0);
		else if(pos.y > maxY)
			vel.set(0,-0.2,0);
		if(random() < 0.01)
		{
			vel.set(0,0.2,0);
			vel.rotate(random()*deg360);
		}
	};
	
	var gameState = new PlayGameState();
	
	var showFPS  = 1;
	var lastTime = 0;
	
	draw = function() 
	{
		gameState.update();
		gameState.display();
		gameState = gameState.getNextState();
		
		//calculates fps
		var time = millis();
		var fps = 1000/(time-lastTime);
		lastTime = time;
		
		fill(0,0,0);
		if(showFPS)
		{
			textSize(10);
			text("FPS: " + fps.toFixed(2), width-50, height-10);
			if(fps < 50)
				console.log("fps dropped to: " + fps);
		}
	};
}};