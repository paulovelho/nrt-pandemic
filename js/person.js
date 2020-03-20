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
	// n = "normal" | i = "infected" | a = "assintomatico" | "s" = "sick" | d = "dead" | c = "cure"
	this.bumps = 0;
	this.infectionSpread = 0;
	this.ticksSinceStatus = 0;
	this.moving = true;
	this.selected = false;

	this.willDie = false;
	this.privilege = false;

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
			case "a":
				return "#F9F";
			case "s":
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
	this.getStatusStr = () => {
		switch(this.status) {
			case "i":
				return "infectado";
			case "a":
				return "assintomático";
			case "s":
				return "doente";
			case "c":
				return "curado";
			case "d":
				return "morto";
			case "n":
				if(this.moving) {
					return "vivo e zanzando";
				} else {
					return "vivo e parado";
				}
			default:
				return '#66ccff';
		}
	}

	this.canInfect = () => {
		return ( this.status == "i" || this.status == "s" );
	}
	this.infect = () => {
		this.status = "i";
		this.getBall().style("fill", this.getColor());
		this.ticksSinceStatus = 0;
	}
	this.sick = () => {
		this.status = "s";
		this.getBall().style("fill", this.getColor());
		this.ticksSinceStatus = 0;
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


	// technical functions:
	this.getBall = () => {
		return this.svg.selectAll('#' + this.id).data(this.data);
	}

	this.getInfo = () => {
		let tickInfo = ";"
		if(this.status == "i" || this.status == "s") {
			tickInfo = ` há ${Math.round(this.ticksSinceStatus / pandemic.ticksPerDay)} dias`;
		}
		return `<b>indivíduo ${this.id}</b><br/>
			<i style="color: ${this.getColor()}">${this.getStatusStr()}</i>${tickInfo}<br/>
			${this.bumps} encontros >> ${this.infectionSpread} contágios transmitidos`;
	}
	this.showInfo = () => {
		document.getElementById("data-debug").innerHTML = this.getInfo();
	}
	this.clickFn = () => {
		pandemic.ballClick();
		this.selected = true;
		this.Draw();
	}
	this.unSelect = () => {
		this.selected = false;
		let ball = this.getBall();
		ball.style("stroke-width", 0);
		return this;
	}

	this.Draw = () => {
		var ball = this.getBall();
		let ballClass = this.selected ? 'ball-selected' : 'ball';
		ball.enter()
			.append("circle")
			.attr({
				'id': this.id, 
				'r': this.radius, 
				'weight': this.weight,
				'class': ballClass
			})
			.style("fill", this.getColor())
			.on("click", this.clickFn);
		if(this.selected) {
			ball.style("stroke-width", 2).style("stroke", "blue");
			this.showInfo();
		}
		ball.attr("cx", this.posX).attr("cy", this.posY);
	}

	this.Move = function () {
		if(this.status == "i" || this.status == "s") this.ticksSinceStatus ++;
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


