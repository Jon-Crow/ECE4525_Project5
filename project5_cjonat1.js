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
	
	var imgs       = [];
	var imgCannon  = 0;
	var imgWheel   = 1;
	var imgBall    = 2;
	var imgFeather = 3;
	var imgMoon    = 4;
	var imgNest    = 5;
	
	var anims         = [];
	var animRight     = 0;
	var animLeft      = 1;
	var animStand     = 2;
	var animFall      = 3;
	var animBirdLeft  = 4;
	var animBirdRight = 5;
	
	var cannonSounds = [];
	var birdSound;
	
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
		//source: https://opengameart.org/content/basic-cannon-hd
		//source: https://opengameart.org/content/free-game-items-pack-2
		//source: https://opengameart.org/content/base-character-spritesheet-16x16
		//source: https://opengameart.org/content/lpc-birds
		//source: https://opengameart.org/content/moon
		//source: https://image.shutterstock.com/image-vector/birds-nest-woven-small-twigs-260nw-1092213965.jpg
		imgs[imgCannon]  = loadImage("img/cannon.png");
		imgs[imgWheel]   = loadImage("img/wheel.png");
		imgs[imgBall]    = loadImage("img/cannon_ball.png");
		imgs[imgFeather] = loadImage("img/feather.png");
		imgs[imgMoon]    = loadImage("img/moon.png");
		imgs[imgNest]    = loadImage("img/nest.png");
		
		anims[animRight]     = new Animation(getSprites(0,1,3,1), 15);
		anims[animLeft]      = new Animation(getSprites(0,0,3,0), 15);
		anims[animStand]     = new Animation(getSprites(0,2,0,2), 15);
		anims[animFall]      = new Animation(getSprites(1,2,2,2), 15);
		anims[animBirdLeft]  = new Animation(getSprites(0,3,3,3), 8);
		anims[animBirdRight] = new Animation(getSprites(0,4,3,4), 8);
	};
	
	var initSounds = function()
	{
		//source: https://opengameart.org/content/9-explosion-sounds
		for(var i = 0; i < 9; i++)
			cannonSounds[i] = new Audio("sound/explosion0" + (i+1) + ".wav");
		//source: https://opengameart.org/content/crow-caw
		birdSound = new Audio("sound/bird.wav");
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
	
	var grav = 0.1;
	
	var WalkPS = function(plyr)
	{
		this.plyr = plyr;
		this.anim = anims[animStand];
	};
	WalkPS.prototype.display = function()
	{
		this.anim.display(this.plyr.getX(),this.plyr.getY(),this.plyr.getSize(),this.plyr.getSize());
	};
	WalkPS.prototype.update = function()
	{
		this.plat = gameState.plyrOnPlat();
		if(this.plat !== null)
			this.plyr.getPos().y = this.plat.getY()-this.plyr.getR();
		var move = 0;
		if(keyArray[RIGHT])
			move += this.plyr.getSpeed();
		if(keyArray[LEFT])
			move -= this.plyr.getSpeed();
		this.plyr.getPos().x += move;
		
		if(move < 0)
			this.anim = anims[animLeft];
		else if(move > 0)
			this.anim = anims[animRight];
		else
			this.anim = anims[animStand];
		this.anim.update();
	};
	WalkPS.prototype.getNextState = function()
	{
		if(this.plat !== null)
		{
			if(keyArray[UP])
				return new CannonPS(this.plyr);
			if(keyArray[DOWN])
				return new FallPS(this.plyr);
			return this;
		}
		var fall = new FallPS(this.plyr);
		var xVel = 0;
		if(keyArray[RIGHT]) xVel += this.plyr.getSpeed();
		if(keyArray[LEFT])  xVel -= this.plyr.getSpeed();
		fall.addVel(new PVector(xVel/2,0,0));
		return fall;
	};
	
	var FallPS = function(plyr)
	{
		this.plyr       = plyr;
		this.vel        = new PVector(0,0,0);
		this.acc        = new PVector(0,grav,0);
		this.frameCount = 30;
		this.anim       = anims[animFall];
		this.ballDelay  = 0;
		this.prevDown   = keyArray[DOWN];
	};
	FallPS.prototype.addVel = function(v)
	{
		this.vel.add(v);
	};
	FallPS.prototype.display = function()
	{
		this.anim.display(this.plyr.getX(),this.plyr.getY(),this.plyr.getSize(),this.plyr.getSize());
	};
	FallPS.prototype.update = function()
	{
		if(this.vel.y > 0)
		{
			this.acc.x = 0;
			if(keyArray[LEFT])
				this.acc.x -= 0.075;
			if(keyArray[RIGHT])
				this.acc.x += 0.075;
		}
		this.vel.add(this.acc);
		this.plyr.getPos().add(this.vel);
		if(this.plyr.getX() < this.plyr.getR() || this.plyr.getX() > width-this.plyr.getR())
			this.vel.x = -this.vel.x;
		
		if((keyArray[DOWN] && !this.prevDown) && this.ballDelay <= 0 && this.plyr.getBalls() > 0)
		{
			gameState.addBall(this.plyr.getX(),this.plyr.getY());
			this.plyr.useBall();
			this.ballDelay = 60;
		}
		this.prevDown = keyArray[DOWN];
		
		if(this.frameCount > 0)
			this.frameCount--;
		if(this.ballDelay > 0)
			this.ballDelay--;
		
		this.anim.update();
	};
	FallPS.prototype.getNextState = function()
	{
		if(this.vel.y < 0 || this.frameCount > 0)
			return this;
		return gameState.plyrOnPlat() ? new WalkPS(this.plyr) : this;
	};
	
	var CannonPS = function(plyr)
	{
		this.plyr     = plyr;
		this.theta    = -deg90;
		this.maxPower = 7.5;
		this.power    = 1;
	};
	CannonPS.prototype.display = function()
	{
		pushMatrix();
		translate(this.plyr.getX(),this.plyr.getY()-10);
		rotate(this.theta);
		var size = this.plyr.getSize();
		image(imgs[imgCannon],-size,-size,size*2,size*2);
		popMatrix();
		image(imgs[imgWheel],this.plyr.getX()-size/2,this.plyr.getY()-size/2,size,size);
		fill(255,0,0,150);
		rect(this.plyr.getX()-25,this.plyr.getY(),50,10);
		fill(0,255,0,150);
		rect(this.plyr.getX()-25,this.plyr.getY(),(this.power/this.maxPower)*50,10);
	};
	CannonPS.prototype.update = function()
	{
		if(keyArray[LEFT])  this.theta -= degToRad;
		if(keyArray[RIGHT]) this.theta += degToRad;
		if(this.theta < -deg180)
			this.theta = -deg180;
		else if(this.theta > deg0)
			this.theta = deg0;
		if(this.power > this.maxPower)
			this.power = this.maxPower;
		else
			this.power += 0.1;
	};
	CannonPS.prototype.getNextState = function()
	{
		if(keyArray[UP])
			return this;
		var fall = new FallPS(this.plyr);
		var v = new PVector(this.power,0);
		v.rotate(this.theta);
		fall.addVel(v);
		playRandomCannon();
		gameState.getParticles().explodeSmoke(this.plyr.getX(),this.plyr.getY());
		return fall;
	};
	
	var Player = function(x, y, size)
	{
		this.pos   = new PVector(x,y,0);
		this.size  = size;
		this.r     = size/2;
		this.speed = 1.5;
		this.state = new WalkPS(this);
		this.balls = 10;
	};
	Player.prototype.getX     = function(){ return this.pos.x; };
	Player.prototype.getY     = function(){ return this.pos.y; };
	Player.prototype.getPos   = function(){ return this.pos;   };
	Player.prototype.getSize  = function(){ return this.size;  };
	Player.prototype.getR     = function(){ return this.r;     };
	Player.prototype.getSpeed = function(){ return this.speed; };
	Player.prototype.getBalls = function(){ return this.balls; };
	Player.prototype.useBall  = function(){ return this.balls--; };
	Player.prototype.display = function()
	{
		this.state.display();
	};
	Player.prototype.update = function()
	{
		this.state.update();
		this.state = this.state.getNextState();
	};
	
	var chaseDist = 150;
	
	var WanderBS = function(bird)
	{
		this.bird = bird;
		this.vel  = new PVector(0.5,0,0);
	};
	WanderBS.prototype.display = function()
	{
		if(this.vel.x > 0)
			anims[animBirdRight].display(this.bird.getX(),this.bird.getY(),this.bird.getSize(),this.bird.getSize());
		else
			anims[animBirdLeft].display(this.bird.getX(),this.bird.getY(),this.bird.getSize(),this.bird.getSize());
	};
	WanderBS.prototype.update = function()
	{
		this.bird.getPos().add(this.vel);
		if(this.bird.getX() > width || this.bird.getX() < 0)
			this.vel.x = -this.vel.x;
	};
	WanderBS.prototype.getNextState = function()
	{
		var plyr = gameState.getPlayer();
		var d = dist(plyr.getX(),plyr.getY(),this.bird.getX(),this.bird.getY());
		if(d <= chaseDist)
		{
			birdSound.play();
			return new ChaseBS(this.bird);
		}
		return this;
	};
	
	var ChaseBS = function(bird)
	{
		this.bird = bird;
		this.vel  = new PVector(0,0,0);
	};
	ChaseBS.prototype.display = function()
	{
		if(this.vel.x > 0)
			anims[animBirdRight].display(this.bird.getX(),this.bird.getY(),this.bird.getSize(),this.bird.getSize());
		else
			anims[animBirdLeft].display(this.bird.getX(),this.bird.getY(),this.bird.getSize(),this.bird.getSize());
	};
	ChaseBS.prototype.update = function()
	{
		var plyr = gameState.getPlayer();
		this.vel.set(plyr.getX()-this.bird.getX(),plyr.getY()-this.bird.getY(),0);
		this.vel.normalize();
		this.vel.mult(0.5);
		this.bird.getPos().add(this.vel);
	};
	ChaseBS.prototype.getNextState = function()
	{
		var plyr = gameState.getPlayer();
		var d = dist(plyr.getX(),plyr.getY(),this.bird.getX(),this.bird.getY());
		if(d < 16)
			gameState.endGame();
		return d > chaseDist ? new WanderBS(this.bird) : this;
	};
	
	var Bird = function(x, y, size)
	{
		this.pos   = new PVector(x, y, 0);
		this.size  = size;
		this.r     = size/2;
		this.state = new WanderBS(this);
	};
	Bird.prototype.getX    = function() { return this.pos.x; };
	Bird.prototype.getY    = function() { return this.pos.y; };
	Bird.prototype.getPos  = function() { return this.pos;   };
	Bird.prototype.getSize = function() { return this.size;  };
	Bird.prototype.getR    = function() { return this.r;     };
	Bird.prototype.display = function()
	{
		this.state.display();
	};
	Bird.prototype.update = function()
	{
		this.state.update();
		this.state = this.state.getNextState();
	};
	
	var Nest = function(x, y, size)
	{
		this.x    = x;
		this.y    = y;
		this.size = size;
		this.r    = size/2;
		this.egg  = true;
	};
	Nest.prototype.display = function()
	{
		if(this.egg)
		{
			fill(255,255,175);
			ellipse(this.x,this.y,this.size*0.6,this.size*0.75);
		}
		image(imgs[imgNest],this.x-this.r,this.y-this.r,this.size,this.size);
	};
	Nest.prototype.update = function()
	{
		if(this.egg)
		{
			var plyr = gameState.getPlayer();
			var d = dist(this.x,this.y,plyr.getX(),plyr.getY());
			if(d <= 16)
			{
				this.egg = false;
				gameState.addScore(100);
			}
		}
	};
	
	var Feather = function(x, y)
	{
		this.pos     = new PVector(x,y,0);
		this.vel     = new PVector(5);
		this.explode = true;
		this.life    = 300;
		this.vel.rotate(deg360*random());
	};
	Feather.prototype.display = function()
	{
		image(imgs[imgFeather],this.pos.x-16,this.pos.y-16,32,32);
	};
	Feather.prototype.update = function()
	{
		this.life--;
		this.pos.add(this.vel);
		if(this.explode)
		{
			this.vel.mult(0.85);
			if(this.vel.mag() < 0.75)
			{
				this.vel.set(-0.5+random(),0.2,0);
				this.changeFrames = 60+60*random();
				this.explode = false;
			}
		}
		else
		{
			this.changeFrames--;
			if(this.changeFrames <= 0)
			{
				this.changeFrames = 60+60*random();
				this.vel.x = -this.vel.x;
			}
		}
	};
	Feather.prototype.shouldRemove = function()
	{
		return this.life <= 0;
	};
	
	var Smoke = function(x, y, xMin, xMax, yMin, yMax)
	{
		this.pos  = new PVector(x, y, 0);
		this.vel  = new PVector(xMin+(xMax-xMin)*random(),yMin+(yMax-yMin)*random(),0);
		this.life = 120;
	};
	Smoke.prototype.display = function()
	{
		fill(100,100,100,255*(this.life/120));
		ellipse(this.pos.x,this.pos.y,20,20);
	};
	Smoke.prototype.update = function()
	{
		this.life--;
		this.pos.add(this.vel);
	};
	Smoke.prototype.shouldRemove = function()
	{
		return this.life <= 0;
	};
	
	var Cloud = function(x, y)
	{
		this.x     = x;
		this.y     = y;
		this.xs    = [];
		this.ys    = [];
		this.sizes = [];
		var count = 10+5*random();
		for(var i = 0; i < count; i++)
		{
			this.xs[i]    = x+(-30+60*random());
			this.ys[i]    = y+(-5 +10*random());
			this.sizes[i] = 20+10*random();
		}
	};
	Cloud.prototype.getX = function() { return this.x; };
	Cloud.prototype.getY = function() { return this.y; };
	Cloud.prototype.display = function()
	{
		fill(255,255,255);
		for(var i = 0; i < this.sizes.length; i++)
			ellipse(this.xs[i],this.ys[i],this.sizes[i],this.sizes[i]);
	};
	Cloud.prototype.move = function(x, y)
	{
		this.x += x;
		this.y += y;
		for(var i = 0; i < this.xs.length; i++)
		{
			this.xs[i] += x;
			this.ys[i] += y;
		}
	};
	
	var Star = function(x, y)
	{
		this.x    = x;
		this.y    = y;
		this.size = 2+3*random();
	};
	Star.prototype.display = function()
	{
		fill(255,255,100);
		ellipse(this.x, this.y, this.size, this.size);
	};
	
	var Ball = function(x, y, size)
	{
		this.pos    = new PVector(x,y,0);
		this.vel    = new PVector(0,0.5,0);
		this.size   = size;
		this.r      = size/2;
	};
	Ball.prototype.getX     = function() { return this.pos.x;       };
	Ball.prototype.getY     = function() { return this.pos.y;       };
	Ball.prototype.getPos   = function() { return this.pos;         };
	Ball.prototype.getSize  = function() { return this.size;        };
	Ball.prototype.getR     = function() { return this.r;           };
	Ball.prototype.isMoving = function() { return this.vel.y !== 0; };
	Ball.prototype.bounce = function()
	{
		var newVel = -this.vel.y*0.75;
		if(abs(newVel) < 0.75)
			newVel = 0;
		this.vel.y = newVel;
	};
	Ball.prototype.display = function()
	{
		image(imgs[imgBall],this.pos.x-this.r,this.pos.y-this.r,this.size,this.size);
	};
	Ball.prototype.update = function()
	{
		this.vel.add(0,grav,0);
		this.pos.add(this.vel);
	};
	
	var Platform = function(x, y, w, h)
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	};
	Platform.prototype.getX = function() { return this.x; };
	Platform.prototype.getY = function() { return this.y; };
	Platform.prototype.display = function()
	{
		fill(150,0,0);
		rect(this.x,this.y,this.w,this.h);
	};
	Platform.prototype.update = function()
	{};
	Platform.prototype.collidesWithCircle = function(cx, cy, r)
	{
		if(cy > this.y)
			return false;
		var edgeX = cx
		var edgeY = cy;
		if(cx < this.x)             edgeX = this.x;
		else if(cx > this.x+this.w) edgeX = this.x+this.w;
		if(cy < this.y)             edgeY = this.y;
		else if(cy > this.y+this.h) edgeY = this.y+this.h;
		
		var d = dist(cx, cy, edgeX, edgeY);
		return d <= r;
	};
	
	var ParticleSystem = function()
	{
		this.parts = [];
	};
	ParticleSystem.prototype.display = function()
	{
		for(var i = 0; i < this.parts.length; i++)
			this.parts[i].display();
	};
	ParticleSystem.prototype.update = function()
	{
		for(var i = this.parts.length-1; i >= 0; i--)
		{
			this.parts[i].update();
			if(this.parts[i].shouldRemove())
				this.parts.splice(i,1);
		}
	};
	ParticleSystem.prototype.addParticle = function(part)
	{
		this.parts.push(part);
	};
	ParticleSystem.prototype.explodeFeathers = function(x, y)
	{
		for(var i = 0; i < 5; i++)
			this.parts.push(new Feather(x, y));
	};
	ParticleSystem.prototype.explodeSmoke = function(x, y)
	{
		for(var i = 0; i < 8; i++)
			this.parts.push(new Smoke(x, y, -1, 1, -0.2, -0.1));
		for(var i = 0; i < 15; i++)
			this.parts.push(new Smoke(x, y, -0.1, 0.1, -2, -0.1));
	};
	
	var PlayGameState = function()
	{
		this.plyr     = new Player(200,325,32);
		this.balls    = [];
		this.parts    = new ParticleSystem();
		this.mapY     = -150;
		this.gameOver = false;
		this.score    = 0;
		this.addBackground();
		this.addPlatforms();
		this.addBirds();
		//this.birds = [];
	};
	PlayGameState.prototype.getParticles = function() { return this.parts; };
	PlayGameState.prototype.display = function()
	{
		noStroke();
		fill(this.getSkyColor());
		rect(0,0,width,height);
		pushMatrix();
		translate(0,this.mapY,0);
		for(var i = 0; i < this.bgs.length; i++)
			this.bgs[i].display();
		image(imgs[imgMoon],0,-1800,400,400);
		
		for(var i = 0; i < this.nests.length; i++)
			this.nests[i].display();
		
		this.plyr.display();
		
		for(var i = 0; i < this.plats.length; i++)
			this.plats[i].display();
		
		for(var i = 0; i < this.birds.length; i++)
			this.birds[i].display();
		
		this.parts.display();
		
		for(var i = 0; i < this.balls.length; i++)
			this.balls[i].display();
		popMatrix();

		if((this.plyr.getY()-this.plyr.getR()) < -this.mapY)
		{
			stroke(255,255,255);
			strokeWeight(5);
			line(this.plyr.getX(),0,this.plyr.getX(),25);
		}
		
		fill(255,255,255);
		textSize(30);
		textAlign(LEFT);
		text("Score: " + this.score, 10,25);
	};
	PlayGameState.prototype.update = function()
	{
		this.plyr.update();
		this.mapY = max(this.mapY+0.2, 200-this.plyr.getY());
		for(var i = 0; i < this.birds.length; i++)
			this.birds[i].update();
		
		this.parts.update();
		
		for(var i = 0; i < this.nests.length; i++)
			this.nests[i].update();
		
		for(var i = this.balls.length-1; i >= 0; i--)
		{
			if(this.updateBall(this.balls[i]))
				this.balls.splice(i, 1);
		}
		anims[animBirdLeft].update();
		anims[animBirdRight].update();
	};
	PlayGameState.prototype.getNextState = function()
	{
		if((this.plyr.getY() > height-this.mapY) || this.gameOver)
			return new EndGameState();
		if(this.plyr.getY() < -1400)
			return new WinGameState(this.score);
		return this;
	};
	PlayGameState.prototype.clickEvent = function(x, y)
	{};
	PlayGameState.prototype.addScore = function(score)
	{
		this.score += score;
	};
	PlayGameState.prototype.endGame = function()
	{
		this.gameOver = true;
	};
	PlayGameState.prototype.updateBall = function(ball)
	{
		if(!ball.isMoving())
			return;
		ball.update();
		for(var p = 0; p < this.plats.length; p++)
		{
			if(this.plats[p].collidesWithCircle(ball.getX(),ball.getY(),ball.getR()))
			{
				ball.getPos().y = this.plats[p].getY()-ball.getR();
				ball.bounce();
				return false;
			}
		}
		for(var b = 0; b < this.birds.length; b++)
		{
			if(dist(ball.getX(),ball.getY(),this.birds[b].getX(),this.birds[b].getY()) <= 32)
			{
				var xDist = abs(ball.getX()-this.birds[b].getX()),
				    yDist = abs(ball.getY()-this.birds[b].getY());
				console.log(xDist + ", " + yDist);
				if(yDist > xDist)
				{
					this.parts.explodeFeathers(this.birds[b].getX(),this.birds[b].getY());
					this.birds.splice(b,1);
					this.addScore(200);
					return false;
				}
				return true;
			}
		}
	};
	PlayGameState.prototype.addBall = function(x, y)
	{
		this.balls.push(new Ball(x, y, 16));
	};
	PlayGameState.prototype.plyrOnPlat = function()
	{
		for(var i = 0; i < this.plats.length; i++)
		{
			if(this.plats[i].collidesWithCircle(this.plyr.getX(),this.plyr.getY(),this.plyr.getR()))
				return this.plats[i];
		}
		return null;
	};
	PlayGameState.prototype.addBackground = function()
	{
		this.bgs = [];
		for(var i = 0; i < 5; i++)
		{
			this.bgs.push(new Cloud(200*random(),-500+200*i));
			this.bgs.push(new Cloud(200+200*random(),-400+200*i));
		}
		for(var i = 0; i < 50; i++)
			this.bgs.push(new Star(400*random(),-1400+600*random()));
	};
	PlayGameState.prototype.addPlatforms = function()
	{
		this.plats = [new Platform(-10,height-20,width+20,50)];
		this.nests = [];
		var nestsLeft = 5;
		for(var i = 16; i >= 1; i--)
		{
			var w = width/4+(width/4)*random();
			this.plats[i] = new Platform((width-w)*random(),height-100*i,w,10);
			if(i === nestsLeft || random() < 0.25)
				this.nests.push(new Nest(this.plats[i].getX()+w/2,this.plats[i].getY()-16,32));
		}
	};
	PlayGameState.prototype.addBirds = function()
	{
		this.birds = [];
		for(var i = 0; i < 7; i++)
		{
			this.birds[i] = new Bird(100+200*random(),50-250*i,48);
		}
	};
	PlayGameState.prototype.getSkyColor = function()
	{
		var perc = this.mapY/1000;
		return color(100*(1-perc),100*(1-perc),255*(1-perc));
	};
	PlayGameState.prototype.getPlayer = function() { return this.plyr; };
	
	var EndGameState = function()
	{
		this.txtSize = 20;
		this.txtGrow = true;
		this.clouds  = [];
		for(var i = 0; i < 5; i++)
			this.clouds[i] = new Cloud(width*random(),height*random());
	};
	EndGameState.prototype.display = function()
	{
		noStroke();
		fill(150,150,255);
		rect(0,0,width,height);
		for(var i = 0; i < this.clouds.length; i++)
			this.clouds[i].display();
		anims[animFall].display(width/2,height/2,32,32);
		
		fill(255,0,0);
		textAlign(CENTER);
		textSize(this.txtSize);
		text("You Lose!", 200, 100);
		textSize(15);
		text("click anywhere to continue...", 200, 300);
	};
	EndGameState.prototype.update = function()
	{
		for(var i = this.clouds.length-1; i >= 0; i--)
		{
			this.clouds[i].move(0,-10);
			if(this.clouds[i].getY() < -10)
			{
				var newX = 200*random();
				if(this.clouds[i].getX() > width/2)
					newX = -newX;
				this.clouds[i].move(newX, height+100*random());
			}
		}
		anims[animFall].update();
		this.txtSize += (this.txtGrow ? 1 : -1);
		if(this.txtSize > 50)
			this.txtGrow = false;
		else if(this.txtSize < 20)
			this.txtGrow = true;
	};
	EndGameState.prototype.getNextState = function()
	{
		return this;
	};
	EndGameState.prototype.clickEvent = function(x, y)
	{
		gameState = new MenuGameState();
	};
	
	var WinGameState = function(score)
	{
		this.score     = score;
		this.moonAngle = 0;
		this.starXs    = [];
		this.starYs    = [];
		for(var i = 0; i < 100; i++)
		{
			this.starXs[i] = width*random();
			this.starYs[i] = height*random();
		}
	};
	WinGameState.prototype.display = function()
	{
		fill(0,0,0);
		rect(0,0,width,height);
		
		fill(255,255,0);
		for(var i = 0; i < this.starXs.length; i++)
			ellipse(this.starXs[i],this.starYs[i],3,3);
		
		pushMatrix();
		translate(width/2,height);
		rotate(this.moonAngle);
		image(imgs[imgMoon], -200, -200, 400, 400);
		popMatrix();
		anims[animRight].display(200,200,64,64);
		
		fill(255,255,255);
		textSize(50);
		textAlign(CENTER);
		text("You Win!", 200, 50);
		textSize(25);
		text("Final score: " + this.score, 200, 100);
		textSize(10);
		text("Click anywhere to continue...", 200, 150);
	};
	WinGameState.prototype.update = function()
	{
		this.moonAngle -= 0.5*degToRad;
		anims[animRight].update();
	};
	WinGameState.prototype.getNextState = function()
	{
		return this;
	};
	WinGameState.prototype.clickEvent = function(x, y)
	{
		gameState = new MenuGameState();
	};
	
	var TutGameState = function()
	{
		this.platX = width;
		this.plyrX = 300;
		this.birdX = 100;
		this.msgI  = 0;
		this.msgs  = [
		"The world has been invaded by evil birds! Get outta there!",
		"Make it to the moon safely, while stealing as many of their eggs as you can!",
		"Use the left and right arrow keys when on a platform to walk from side to side",
		"Hold the up arrow to enter your cannon. When in the cannon, use the left and right arrow keys to aim. To fire, release the up arrow.",
		"When in the air, use the left and right arrow keys to accelerate in a direction (but only once you start falling!). When in the air, you can use the down arrow to drop a cannon ball and kill birds!"
		];
	};
	TutGameState.prototype.display = function()
	{
		noStroke();
		fill(150,150,255);
		rect(0,0,width,height);
		fill(150,0,0);
		rect(0,200,width,200);
		rect(this.platX, 50, 150, 10);
		anims[animRight].display(this.plyrX,200,32,32);
		anims[animBirdRight].display(this.birdX,150,48,48);
		
		if(this.msgI < this.msgs.length)
		{
			fill(0,0,0,150);
			rect(50,225,300,150);
			fill(255,255,255);
			textSize(15);
			textAlign(LEFT);
			text(this.msgs[this.msgI], 60, 235, 280, 130);
			textSize(10);
			text("Click anywhere to continue...", 60, 365);
		}
	};
	TutGameState.prototype.update = function()
	{
		if(this.msgI < this.msgs.length)
		{
			this.platX -= 10;
			if(this.platX < -150)
				this.platX = width;
		}
		else
		{
			this.plyrX += 5;
			this.birdX += 5;
		}
		anims[animRight].update();
		anims[animRight].update();
		anims[animBirdRight].update();
	};
	TutGameState.prototype.getNextState = function()
	{
		if(this.birdX > width+20)
			return new MenuGameState();
		return this;
	};
	TutGameState.prototype.clickEvent = function(x, y)
	{
		this.msgI++;
	};
	
	var MenuGameState = function()
	{
		this.plyr      = new Player(200,-100,32);
		this.plat      = new Platform(-25,350,450,100);
		this.startPlat = new Platform(25,100,125,10);
		this.tutPlat   = new Platform(width-150,100,125,10);
		this.parts     = new ParticleSystem();
		this.clouds    = [new Cloud(50,225), new Cloud(200,150), new Cloud(350,250)];
		this.trans     = 0;
	};
	MenuGameState.prototype.getParticles = function() { return this.parts; };
	MenuGameState.prototype.display = function()
	{
		if(this.trans === 0)
		{
			noStroke();
			fill(150,150,255);
			rect(0,0,width,height);
			for(var i = 0; i < this.clouds.length; i++)
				this.clouds[i].display();
			this.plat.display();
			this.startPlat.display();
			this.tutPlat.display();
			
			fill(255,255,255);
			textSize(25);
			textAlign(LEFT);
			text("Start Game", this.startPlat.getX(), this.startPlat.getY()-20);
			text("Tutorial", this.tutPlat.getX(), this.tutPlat.getY()-20);
			
			this.plyr.display();
			this.parts.display();
		}
		else
			image(imgs[imgMoon],width/2-this.trans/2,height/2-this.trans/2,this.trans,this.trans);
	};
	MenuGameState.prototype.update = function()
	{
		if(this.trans === 0)
		{
			this.plyr.update();
			this.parts.update();
			if(this.plyr.getY() > (height+this.plyr.getR()))
				this.plyr.getPos().y = -this.plyr.getR();
			
			if(this.plyrOnPlat() === this.startPlat)
			{
				this.trans = 1;
				this.nextState = new PlayGameState();
			}
			else if(this.plyrOnPlat() === this.tutPlat)
			{
				this.trans = 1;
				this.nextState = new TutGameState();
			}
		}
		else
		{
			this.trans += 10;
		}
	};
	MenuGameState.prototype.getNextState = function()
	{
		if(this.trans > width*2)
			return this.nextState;
		return this;
	};
	MenuGameState.prototype.clickEvent = function(x, y)
	{};
	MenuGameState.prototype.plyrOnPlat = function()
	{
		if(this.plat.collidesWithCircle(this.plyr.getX(),this.plyr.getY(),this.plyr.getR()))
			return this.plat;
		if(this.startPlat.collidesWithCircle(this.plyr.getX(),this.plyr.getY(),this.plyr.getR()))
			return this.startPlat;
		if(this.tutPlat.collidesWithCircle(this.plyr.getX(),this.plyr.getY(),this.plyr.getR()))
			return this.tutPlat;
		return null;
	};
	MenuGameState.prototype.addBall = function()
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