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
	Animation.prototype.clone = function()
	{
		return new Animation(this.sprites, this.delay);
	};
	
	var imgs         = [];
	var imgShipSmall = 0;
	var imgCannon    = 1;
	
	var anims           = [];
	var animPirateUp    = 0;
	var animPirateRight = 1;
	var animPirateDown  = 2;
	var animPirateLeft  = 3;
	
	var cannonSounds = [];
	
	var getSprites = function(startX, startY, endX, endY, dir)
	{
		var sprites = [];
		for(var y = startY; y <= endY; y++)
			for(var x = startX; x <= endX; x++)
				sprites.push(loadImage(dir + "/sprite" + x + "_" + y + ".png"));
		return sprites;
	}
	var initImages = function()
	{
		//SOURCE: https://i.pinimg.com/564x/a8/51/81/a85181945c60c35174872c3c3e1465ef--ship-map-rpg-map.jpg
		//SOURCE: https://opengameart.org/content/bomb-party
		imgs[imgShipSmall] = loadImage("img/ship1.png");
		imgs[imgCannon]    = loadImage("img/cannon.png");
	};
	var initAnims = function()
	{
		anims[animPirateUp]    = new Animation(getSprites(3,0,3,3,"img/pirate"),10);
		anims[animPirateRight] = new Animation(getSprites(2,0,2,3,"img/pirate"),10);
		anims[animPirateDown]  = new Animation(getSprites(1,0,1,3,"img/pirate"),10);
		anims[animPirateLeft]  = new Animation(getSprites(0,0,0,3,"img/pirate"),10);
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
	initAnims();
	initSounds();
	
	var WanderPS = function(pirate)
	{
		pirate.getVel().x = 0.5;
		this.pirate = pirate;
		this.flee   = 0;
	};
	WanderPS.prototype.display = function()
	{
		this.pirate.displayAnim();
	};
	WanderPS.prototype.update = function()
	{
		if(this.pirate.getX() < 50)
			this.pirate.getVel().x = 0.5;
		else if(this.pirate.getX() > 300)
			this.pirate.getVel().x = -0.5;
		if(this.flee > 0)
			this.flee--;
		else
		{
			var ball = gameState.getHighestBall();
			if(ball !== null)
			{
				var target = ball.getXAtY(this.pirate.getY());
				if(target !== null)
				{
					var futX = this.pirate.getX()+this.pirate.getVel().x*target.getTime();
					if(abs(target.getX()-futX) < (ballSize+this.pirate.getWidth()))
					{
						this.pirate.getVel().x *= -1;
						this.flee = 120;
					}
				}
			}
		}
	};
	WanderPS.prototype.getNextState = function()
	{
		return this;
	};
	
	var StunPS = function(pirate)
	{
		pirate.getVel().x = 0;
		this.pirate = pirate;
		this.blink  = 0;
		this.time   = 0;
	};
	StunPS.prototype.display = function()
	{
		if(this.blink > 15)
			this.pirate.displayAnim();
	};
	StunPS.prototype.update = function()
	{
		this.blink++;
		if(this.blink > 30)
		{
			this.blink = 0;
			this.time++;
		}
	};
	StunPS.prototype.getNextState = function()
	{
		if(this.time > 3)
			return new WanderPS(this.pirate);
		return this;
	};
	
	var Pirate = function(x, y, w, h)
	{
		this.pos       = new PVector(x, y, 0);
		this.vel       = new PVector(0, 0.03, 0);
		this.w         = w;
		this.h         = h;
		this.life      = 3;
		this.state     = new WanderPS(this);
		this.animUp    = anims[animPirateUp].clone();
		this.animRight = anims[animPirateRight].clone();
		this.animDown  = anims[animPirateDown].clone();
		this.animLeft  = anims[animPirateLeft].clone();
		this.anim      = this.animUp;
		this.lastBall  = null;
	};
	Pirate.prototype.getPos    = function() { return this.pos;       };
	Pirate.prototype.getVel    = function() { return this.vel;       };
	Pirate.prototype.getX      = function() { return this.pos.x;     };
	Pirate.prototype.getY      = function() { return this.pos.y;     };
	Pirate.prototype.getWidth  = function() { return this.w;         };
	Pirate.prototype.getHeight = function() { return this.h;         };
	Pirate.prototype.isDead    = function() { return this.life <= 0; };
	Pirate.prototype.displayAnim = function()
	{
		this.anim.display(this.pos.x, this.pos.y, this.w, this.h);
	};
	Pirate.prototype.display = function()
	{
		this.state.display();
	};
	Pirate.prototype.update = function()
	{
		this.state.update();
		this.pos.add(this.vel);
		if(this.vel.x > 0)
			this.anim = this.animRight;
		else if(this.vel.x < 0)
			this.anim = this.animLeft;
		else if(this.vel.y > 0)
			this.anim = this.animDown;
		else
			this.anim = this.animUp;
		this.anim.update();
		this.state = this.state.getNextState();
		
		var ball = gameState.checkBallCollisions(this);
		if(ball !== null && ball !== this.lastBall)
		{
			this.state = new StunPS(this);
			this.life--;
			ball.getVel().x *= -1;
			this.lastBall = ball;
		}
	};
	
	var reloadTime = 180;
	var Cannon = function(x, y)
	{
		this.x      = x;
		this.y      = y;
		this.w      = 32;
		this.h      = 64;
		this.theta  = 0;
		this.reload = reloadTime;
	};
	Cannon.prototype.getX = function() { return this.x; };
	Cannon.prototype.getY = function() { return this.y; };
	Cannon.prototype.display = function()
	{
		pushMatrix();
		noStroke();
		translate(this.x, this.y);
		rotate(this.theta);
		image(imgs[imgCannon],-this.w/2,-this.h/2,this.w,this.h);
		fill(255,0,0);
		rect(-25,10,50,5);
		fill(0,255,0);
		rect(-25,10,(this.reload/reloadTime)*50,5);
		popMatrix();
	};
	Cannon.prototype.update = function()
	{
		if(this.reload < reloadTime)
			this.reload++;
	};
	Cannon.prototype.rotate = function(angle)
	{
		this.theta += angle;
		if(this.theta > deg90)
			this.theta = deg90;
		else if(this.theta < -deg90)
			this.theta = -deg90;
	};
	Cannon.prototype.fire = function()
	{
		if(this.reload < reloadTime)
			return;
		var vel = new PVector(0,-this.h/2,0);
		vel.rotate(this.theta);
		var x = this.x+vel.x;
		var y = this.y+vel.y;
		vel.normalize();
		vel.mult(5);
		gameState.addBall(new Ball(x,y,vel.x,vel.y));
		this.reload = 0;
	};
	
	var Target = function(x, y, time)
	{
		this.x    = x;
		this.y    = y;
		this.time = time;
	};
	Target.prototype.getX    = function() { return this.x;    };
	Target.prototype.getY    = function() { return this.y;    };
	Target.prototype.getTime = function() { return this.time; };
	
	var ballSize = 12;
	var Ball = function(x, y, xVel, yVel)
	{
		this.pos = new PVector(x,    y,    0);
		this.vel = new PVector(xVel, yVel, 0);
	};
	Ball.prototype.getVel = function() { return this.vel;   };
	Ball.prototype.getX   = function() { return this.pos.x; };
	Ball.prototype.getY   = function() { return this.pos.y; };
	Ball.prototype.display = function()
	{
		fill(0,0,0);
		ellipse(this.pos.x,this.pos.y,ballSize,ballSize);
	};
	Ball.prototype.update = function()
	{
		this.pos.add(this.vel);
	};
	Ball.prototype.getXAtY = function(y)
	{
		var yDiff = y-this.pos.y;
		if((yDiff < 0 && this.vel.y > 0) || (yDiff > 0 && this.vel.y < 0))
			return null;
		var time = yDiff/this.vel.y;
		var xDiff = time*this.vel.x;
		return new Target(this.pos.x+xDiff,y,time);
	};
	
	var Player = function(x, y, w, h)
	{
		this.pos = new PVector(x, y, 0);
		this.vel = new PVector(0, 0, 0);
		this.w   = w;
		this.h   = h;
		this.spd = 2;
	};
	Player.prototype.getX = function() { return this.pos.x; };
	Player.prototype.getY = function() { return this.pos.y; };
	Player.prototype.display = function()
	{
		fill(0,0,255);
		ellipse(this.pos.x,this.pos.y,this.w,this.h);
	};
	Player.prototype.update = function()
	{
		this.vel.set(0,0,0);
		if(keyArray[UP])
			this.vel.y -= 1;
		if(keyArray[RIGHT])
			this.vel.x += 1;
		if(keyArray[DOWN])
			this.vel.y += 1;
		if(keyArray[LEFT])
			this.vel.x -= 1;
		this.vel.normalize();
		this.vel.mult(this.spd);
		this.pos.add(this.vel);
		
		var can = gameState.getPlayerCannon();
		if(can !== null)
		{
			if(keyArray[68])
				can.rotate(degToRad);
			if(keyArray[65])
				can.rotate(-degToRad);
			if(keyArray[32])
				can.fire();
		}
	};
	
	var MenuGameState = function()
	{};
	MenuGameState.prototype.display = function()
	{
		background(10,10,100);
		fill(255,255,255);
		textSize(75);
		textAlign(CENTER);
		text("GAME", 200, 200);
		textSize(20);
		text("Space to play", 200, 300);
	};
	MenuGameState.prototype.update = function()
	{};
	MenuGameState.prototype.getNextState = function()
	{
		return keyArray[32] ? new PlayGameState() : this;
	};
	MenuGameState.prototype.clickEvent = function(x, y)
	{};
	
	var PlayGameState = function()
	{
		this.pirates = [new Pirate(50, 25,32,48),
		                new Pirate(75, 50,32,48),
						new Pirate(100,75,32,48),];
		this.cannons = [new Cannon(100,310),
		                new Cannon(200,310),
						new Cannon(300,310)];
		this.balls   = [];
		this.plyr    = new Player(200,350,32,32);
		this.shipY   = 0;
	};
	PlayGameState.prototype.display = function()
	{
		noStroke();
		background(10,10,100);
		image(imgs[imgShipSmall], 0, this.shipY, 400, 150);
		image(imgs[imgShipSmall], 0, 300, 400, 150);
		for(var i = 0; i < this.pirates.length; i++)
			this.pirates[i].display();
		for(var i = 0; i < this.cannons.length; i++)
			this.cannons[i].display();
		for(var i = 0; i < this.balls.length; i++)
			this.balls[i].display();
		this.plyr.display();
	};
	PlayGameState.prototype.update = function()
	{
		if(this.pirates.length === 0)
		{
			gameState = new MenuGameState();
			return;
		}
		if(this.shipY < 50)
			this.shipY += 0.03;
		else
		{
			for(var i = 0; i < this.pirates.length; i++)
			{
				this.pirates[i].getVel().y = 0;
				if(this.pirates[i].getX() > 300)
				{
					gameState = new MenuGameState();
					return;
				}
			}
		}
		for(var i = this.pirates.length-1; i >= 0; i--)
		{
			this.pirates[i].update();
			if(this.pirates[i].isDead())
				this.pirates.splice(i, 1);
		}
		for(var i = 0; i < this.cannons.length; i++)
			this.cannons[i].update();
		var ball;
		for(var i = this.balls.length-1; i >= 0; i--)
		{
			ball = this.balls[i];
			if((ball.getX()<0 || ball.getX()>width) || (ball.getY()<0 || ball.getY()>height))
				this.balls.splice(i,1);
			else
				ball.update();
		}
		this.plyr.update();
	};
	PlayGameState.prototype.getNextState = function()
	{
		return this;
	};
	PlayGameState.prototype.clickEvent = function(x, y)
	{};
	PlayGameState.prototype.addBall = function(ball)
	{
		this.balls.push(ball);
	};
	PlayGameState.prototype.getHighestBall = function()
	{
		var ball = null;
		var maxY = -1;
		for(var i = 0; i < this.balls.length; i++)
		{
			if(this.balls[i].getY() > maxY)
			{
				ball = this.balls[i];
				maxY = ball.getY();
			}
		}
		return ball;
	};
	PlayGameState.prototype.getPlayerCannon = function()
	{
		var can;
		for(var i = 0; i < this.cannons.length; i++)
		{
			can = this.cannons[i];
			if(dist(this.plyr.getX(),this.plyr.getY(),can.getX(),can.getY()) < 32)
				return can;
		}
		return null;
	};
	PlayGameState.prototype.checkBallCollisions = function(pirate)
	{
		var ball;
		var d = ballSize/2+pirate.getWidth();
		for(var i = 0; i < this.balls.length; i++)
		{
			ball = this.balls[i];
			if(dist(ball.getX(),ball.getY(),pirate.getX(),pirate.getY()) < d)
				return ball;
		}
		return null;
	};
	
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