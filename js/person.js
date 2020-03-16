// Person object
function Person(svg, x, y, id, aoa) {
	this.id = id; // id of ball

	this.posX = x; // cx
	this.posY = y; // cy
	this.svg = svg; // parent SVG
	this.aoa = aoa; // initial angle of attack
	this.data = [this.id]; // allow us to use d3.enter()

	this.weight = 5;
	this.radius = this.weight;

	this.status = "n";
	// n = "normal" | i = "infected" | d = "dead" | c = "cure"
	this.ticksSinceInfection = 0;
	this.moving = true;

	// **** aoa is used only here -- earlier I was using to next move position.
	// Now aoa and speed together is velocity 
	this.vx = Math.cos(this.aoa); // velocity x
	this.vy = Math.sin(this.aoa); // velocity y
	this.initialVx = this.vx;
	this.initialVy = this.vy;
	this.initialPosX = this.posX;
	this.initialPosY = this.posY;

	this.getColor = () => {
		switch(this.status) {
			case "i":
				return "red";
			case "c":
				return "green";
			case "d":
				return "#000";
			case "n":
			default:
				return '#66ccff';
		}
	}

	this.infect = () => {
		this.status = "i";
		this.getBall().style("fill", this.getColor());
	}
	this.cure = () => {
		this.status = "c";
		this.getBall().style("fill", this.getColor());
	}
	this.quarantine = () => {
		this.moving = false;
		this.vx = 0;
		this.vy = 0;
	}
	this.die = () => {
		this.status = "d";
		this.moving = false;
		this.getBall().style("fill", this.getColor());
	}


	// wip
	this.diseaseProgression = () => {
		this.ticksSinceInfection ++;
		if(this.ticksSinceInfection < 500) return false;
		if(this.ticksSinceInfection % 10 != 0) return false; // when to check?
		if(this.ticksSinceInfection > 1200) {
			console.info("killing", this);
			this.die();
			return false;
		}
		let chance = (this.ticksSinceInfection/100 - 45) / 100;
		if(this.probability(chance)) {
			this.cure();
		}

	}



	this.probability = (n) => {
		return Math.random() < n;
	}


	// technical functions:
	this.getBall = () => {
		return this.svg.selectAll('#' + this.id).data(this.data);
	}

	this.Draw = () => {
		var ball = this.getBall();
		ball.enter()
			.append("circle")
			.attr({"id" : this.id, 'class' : 'ball', 'r' : this.radius, 'weight' : this.weight})
			.style("fill", this.getColor())
			.on("click", () => {
				console.info("clicked on ", this);
			});
		ball.attr("cx", this.posX).attr("cy", this.posY);
	}

	this.Move = function () {
//		this.diseaseProgression();
		if(!this.moving) {
			return true;
		}
		this.posX += this.vx;
		this.posY += this.vy;

		if (parseInt(this.svg.attr('width')) <= (this.posX + this.radius)) {
			this.posX = parseInt(svg.attr('width')) - this.radius - 1;
			this.aoa = Math.PI - this.aoa;
			this.vx = -this.vx;
		}

		if ( this.posX < this.radius) {
			this.posX = this.radius+1;
			this.aoa = Math.PI - this.aoa;
			this.vx = -this.vx;
		}

		if (parseInt(this.svg.attr('height')) < (this.posY + this.radius)) {
			this.posY = parseInt(svg.attr('height')) - this.radius - 1;
			this.aoa = 2 * Math.PI - this.aoa;
			this.vy = -this.vy;
		}

		if (this.posY < this.radius) {
			this.posY = this.radius+1;
			this.aoa = 2 * Math.PI - this.aoa;
			this.vy = -this.vy;
		}

		// **** NOT USING AOA except during initilization. Just left this for future reference ***** 
		if (this.aoa > 2 * Math.PI)
			this.aoa = this.aoa - 2 * Math.PI;
		if (this.aoa < 0)
			this.aoa = 2 * Math.PI + this.aoa;

		this.Draw();
	}
}

