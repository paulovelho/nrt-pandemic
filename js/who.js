// based on http://bl.ocks.org/atul-github/0019158da5d2f8499f7f

var who = function() {

	this.svg = null;
	this.population = []; // global array representing balls

	this.infected = 1;


	this.CheckCollision = (ball1, ball2) => {
		var absx = Math.abs(parseFloat(ball2.posX) - parseFloat(ball1.posX));
		var absy = Math.abs(parseFloat(ball2.posY) - parseFloat(ball1.posY));

		// find distance between two balls.
		var distance = (absx * absx) + (absy * absy);
		distance = Math.sqrt(distance);
		// check if distance is less than sum of two radius - if yes, collision
		if (distance < (parseFloat(ball1.radius) + parseFloat(ball2.radius))) {
			return true;
		}
		return false;
	}


	this.transmit = (sick, healthy) => {
		healthy.infect();
		this.infected++;
	}

	this.processStatus = (p1, p2) => {
		if( p1.status == p2.status ) return true;
		if( p1.status == "i" && p2.status == "n" ){
			this.transmit(p1, p2);
		}
		if( p2.status == "i" && p1.status == "n" ){
			this.transmit(p2, p1);
		}
		document.getElementById("infectCount").innerHTML = this.infected;
	}

	this.StaticCollision = (static, moving) => {
		if(moving.vy > moving.vx){
			moving.aoa = 2 * Math.PI - moving.aoa;
		} else {
			moving.aoa = Math.PI - moving.aoa;
		}
//		moving.aoa = Math.PI - moving.aoa;
		moving.vx = -moving.vx;
		moving.vy = -moving.vy;
	}
	this.MovingCollision = (ball1, ball2) => {
		// calculate new velocity of each ball.
		var vx1 = (2 * ball2.weight * ball2.vx) / (ball1.weight + ball2.weight);
		var vy1 = (2 * ball2.weight * ball2.vy) / (ball1.weight + ball2.weight);
		var vx2 = (2 * ball1.weight * ball1.vx) / (ball1.weight + ball2.weight);
		var vy2 = (2 * ball1.weight * ball1.vy) / (ball1.weight + ball2.weight);

		//set velocities for both balls
		ball1.vx = vx1;
		ball1.vy = vy1;
		ball2.vx = vx2;
		ball2.vy = vy2;
	}

	// courtsey thanks to several internet sites for formulas
	// detect collision, find intersecting point and set new speed+direction for each ball based on weight (weight=radius)
	this.ProcessCollision = (ball1, ball2) => {

		if (ball2 <= ball1)
			return;
		if (ball1 >= (this.population.length-1) || ball2 >= this.population.length )
			return;

		ball1 = this.population[ball1];
		ball2 = this.population[ball2];

		if ( this.CheckCollision(ball1, ball2) ) {
			if(!ball1.moving) {
				this.StaticCollision(ball1, ball2);
			} else if (!ball2.moving) {
				this.StaticCollision(ball2, ball1);
			} else {
				this.MovingCollision(ball1, ball2);
			}

			//ensure one ball is not inside others. distant apart till not colliding
			while (this.CheckCollision(ball1, ball2)) {
				ball1.posX += ball1.vx;
				ball1.posY += ball1.vy;

				ball2.posX += ball2.vx;
				ball2.posY += ball2.vy;
			}

			this.processStatus(ball1, ball2);

			ball1.Draw();
			ball2.Draw();
		}
	}

	this.startStopFlag = null;
	this.tick = () => {
		for (var i = 0; i < this.population.length; ++i) {
			this.population[i].Move();
			for (var j = i + 1; j < this.population.length; ++j) {
				this.ProcessCollision(i, j);
			}
		}
		if (this.startStopFlag == null)
			return true;
		else
			return false;
	}

	this.StartStopGame = () => {
		if (this.startStopFlag == null) {
			d3.timer(this.tick, 500);
			this.startStopFlag = 1;
		} else {
			this.startStopFlag = null;
		}
	}




	// helpers: 
	this.getRandom = (max) => {
		return Math.floor(Math.random() * Math.floor(max));
	}
	this.probability = (n) => {
		return Math.random() < n;
	}


	// setup
	this.infectRandom = () => {
		let rand = this.getRandom(199);
		this.population[rand-1].infect();
	}

	this.populate = () => {
		const rowOfBalls = (row) => {
			let minh = (row-1)*59 + 5;
			if(row == 10) minh -= 5;

			let pid = this.population.length - 1;

			for(let i=1; i <= 20; i++) {
				let h = minh + this.getRandom(60);
				let w = (i-1) * 40 + this.getRandom(25);
				let p = new Person(this.svg, w+5, h, 'n' + (i + pid), this.getRandom(360));
				if(this.probability(0.50)) p.quarantine();
				this.population.push(p);
			}
		}

		for (var i = 1; i <= 10; i++) {
			rowOfBalls(i);
		}

		for (var i = 0; i < this.population.length; ++i) {
			for (var j = i + 1; j < this.population.length; ++j) {
				this.ProcessCollision(i, j);
			}
		}

		this.infectRandom();

		for (var i = 0; i < this.population.length; ++i) {
			this.population[i].Draw();
		}
	}
	this.createCanvas = () => {
		const containerId = "drawArea";
		var height = document.getElementById(containerId).clientHeight;
		var width = document.getElementById(containerId).clientWidth;
		gContainerId = containerId;
		gCanvasId = containerId + '_canvas';
		gTopGroupId = containerId + '_topGroup';
		return d3.select("#" + containerId).append("svg")
			.attr("id", gCanvasId)
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("id", gTopGroupId)
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.style("fill", "none");
	}
	this.keyboard = () => {
		// I always like to handle ESC key
		d3.select('body')
				.on('keydown', () =>  {
					if (this.population.length == 0)
						return;
					console.log(d3.event);
					switch(d3.event.keyCode) {
						case 27: // ESC
							this.StartStopGame();
						case 32: // SPACE
							this.StartStopGame();
						case 16: // SHIFT
							this.tick();
					}
				});
	}

	this.Initialize = () => {
		this.svg = this.createCanvas();

		this.populate();
		this.keyboard();
		return this.svg;
	}



}


