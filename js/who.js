// based on http://bl.ocks.org/atul-github/0019158da5d2f8499f7f

var who = function() {

	this.svg = null;
	this.population = []; // global array representing balls

	// 1 day = 50 ticks
	this.ticksPerDay = 50;
	this.tickCount = 0;

	// data
	this.infected = 0;
	this.dead = 0;
	this.cured = 0;

	// control panel:
	this.mortality = 0.05;
	this.cureChance = 0;
	this.incubationPeriod = 3;
	this.hospitalCapacity = 0;
	this.quarantineLevel = 0;

	// r:
	this.rArr = [];
	this.r0 = 0;

	this.hospitalUse = 0;
	this.running = false;


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

			this.collisionStatus(ball1, ball2);

			ball1.Draw();
			ball2.Draw();
		}
	}

	this.tick = () => {
		this.tickCount ++;
		for (var i = 0; i < this.population.length; ++i) {
			this.population[i].Move();
			for (var j = i + 1; j < this.population.length; ++j) {
				this.ProcessCollision(i, j);
			}
			this.processStatus(this.population[i]);
		}
		this.updateData();
		if(this.infected == 0) return this.over();
		return !this.running; // return true to stop
	}
	this.over = () => {
		reset();
		return true;
	}

	this.stop = () => {
		this.running = false;
		setPlay();
	}
	this.start = () => {
		d3.timer(this.tick, 500);
		this.running = true;
		setPause();
	}
	this.StartStopGame = () => {
		if(this.running) this.stop();
		else this.start();
	}





	// process status
	this.transmit = (sick, healthy) => {
		healthy.infect();
		sick.infectionSpread++;
		this.infected++;
	}

	this.collisionStatus = (p1, p2) => {
		if( p1.status == p2.status ) return true;
		if( p1.canInfect() && p2.status == "n" ){
			this.transmit(p1, p2);
		}
		if( p2.canInfect() && p1.status == "n" ){
			this.transmit(p2, p1);
		}
	}

	this.processStatus = (person) => {
		let ticks = person.ticksSinceStatus;
		if(ticks % 50 != 0) return false; // when to check?

		this.rArr[person.id] = person.infectionSpread;

		if( person.status == "i" ) {
			if( this.progressDisesase(person, ticks) )
				person.sick();
		}
		if( person.status == "s" ) {
			if(ticks < 500) return false;	
			this.hospitalize(person, ticks);
		}
	}
	this.progressDisesase = (person, ticks) => {
		if(this.incubationPeriod == 0) return true;
		let daysSinceDisease = ticks / this.ticksPerDay;
		if( daysSinceDisease < this.incubationPeriod ) {
			return this.probability(0.2);
		}
		if(daysSinceDisease > 4){
			person.status = "a";
			return false;
		}
		let chanceToProgress = 0.5 + daysSinceDisease * 0.1;
		console.info("chance of " + person.id + " to get sick = " + chanceToProgress);
		return this.probability(chanceToProgress);
	}
	this.hospitalize = (person, ticks) => {
		if( this.hospitalUse > 1 ) {
			let chanceToDie = (this.hospitalUse - 1) * 2;
			if(person.privilege) chanceToDie = chanceToDie / 2;
			console.info("chance of " + person.id + " to die = " + chanceToDie);
			if(this.probability(chanceToDie)) {
				this.kill(person);
				return;
			}
		} else {
			let chanceToCure = ( ticks - 500 ) / 100 * this.cureChance;

			if(this.probability(chanceToCure)) {
				if(person.willDie) this.kill(person);
				else this.cure(person)
			}
		}
	}
	this.kill = (person) => {
		this.infected --;
		this.dead ++;
		person.die();
	}
	this.cure = (person) => {
		this.infected --;
		this.cured ++;
		person.cure();
	}





	// data
	this.calculateRZero = () => {
		let zeroArray = Object.values(this.rArr);
		if(zeroArray.length == 0) {
			document.getElementById("rzero").innerHTML = "N/A";
			return;
		}
		let rzero = zeroArray.reduce((a,b) => a + b, 0) / zeroArray.length;
		if(rzero > this.r0) {
			this.r0 = rzero;
			document.getElementById("rzero").innerHTML = rzero.toFixed(2);
		}
	}
	this.updateData = () => {
		document.getElementById("day").innerHTML = Math.round(this.tickCount / this.ticksPerDay);
		document.getElementById("infectCount").innerHTML = this.infected;
		document.getElementById("deathCount").innerHTML = this.dead;
		document.getElementById("cureCount").innerHTML = this.cured;

		this.calculateRZero();

		document.getElementById("mortality").innerHTML = (this.mortality * 100) + "%";
		let hospitalCapacityPerson = 200 * this.hospitalCapacity / 100;
		this.hospitalUse = this.infected / hospitalCapacityPerson / 100;
		document.getElementById("hospitalUse").innerHTML = Math.round(this.hospitalUse * 100) + "%";
	}




	// helpers: 
	this.getRandom = (max) => {
		return Math.floor(Math.random() * Math.floor(max));
	}
	this.probability = (n) => {
		return Math.random() < n;
	}
	this.arrAverage = (arr) => {
		if(arr.length == 0) return 0;
		return arr.map(i => arr[i]).reduce((a,b) => a + b, 0) / arr.length;
	}


	// setup
	this.infectRandom = () => {
		let rand = this.getRandom(199);
		this.population[rand-1].infect();
		this.infected ++;
	}
	this.createPerson = (p) => {
		if(this.probability(this.quarantineLevel)) p.quarantine();
		if(this.probability(this.mortality)) p.willDie = true;
		if(this.probability(this.cureChance/2)) p.privilege = true;
		return p
	}
	this.populate = () => {
		let rowOfBalls = (row) => {
			let minh = (row-1)*59 + 5;
			if(row == 10) minh -= 5;

			let pid = this.population.length - 1;

			for(let i=1; i <= 20; i++) {
				let h = minh + this.getRandom(60);
				let w = (i-1) * 40 + this.getRandom(25);
				let p = new Person(this.svg, w+5, h, 'n' + (i + pid), this.getRandom(360));
				this.population.push(this.createPerson(p));
			}
		}

		for (var i = 1; i <= 10; i++) {
			rowOfBalls(i);
		}

		for (var i = 0; i < this.population.length; ++i) {
			for (var j = i + 1; j < this.population.length; ++j) {
				let ball1 = this.population[i];
				let ball2 = this.population[j];
				if(this.CheckCollision(ball1, ball2)) {
					ball1.posY -= 10;
					ball1.Draw();
				}
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


	this.removeAllBalls = () => {
		for (var i = 0; i < this.population.length; ++i) {
			this.population[i].getBall().remove();
		}
		this.population = [];
	}

	this.reset = () => {
		this.removeAllBalls();
		this.tickCount = 0;
		this.infected = 0;
		this.dead = 0;
		this.cured = 0;
		this.r0 = 0;
		this.rArr = [];

		this.populate();
		this.updateData();
	}

	this.Initialize = () => {
		this.svg = this.createCanvas();
		this.populate();
		this.updateData();

		window.onbeforeunload = function (e) {
			this.stop();
		};

		return this.svg;
	}



}


