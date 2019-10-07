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
	var imgTileSheet = 0;
	
	var tiles = [];
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
		imgs[imgTileSheet] = loadImage("img/tile_sheet.png");
	};
	
	var initTiles = function()
	{
		background(0,255,0,0);
		image(imgs[imgTileSheet], 0, 0);
		for(var x = 0; x < 16; x++)
			for(var y = 0; y < 6; y++)
				tiles.push(loadImage("img/tile/ship" + x + "_" + y + ".png"));
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
		background(255,0,0);
		for(var i = 0; i < tiles.length; i++)
			image(tiles[i],64*i,200);
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
	{};
	PlayGameState.prototype.display = function()
	{
		//background(255,0,0);
	};
	PlayGameState.prototype.update = function()
	{};
	PlayGameState.prototype.getNextState = function()
	{
		return this;
	};
	PlayGameState.prototype.clickEvent = function(x, y)
	{};
	
	var gameState = new MenuGameState();
	
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