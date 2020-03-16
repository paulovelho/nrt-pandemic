var person = function(){

	this.id = 0;
	this.status = "n"; 
	// n = "normal" | i = "infected" | "d" = "dead"

	this.position = {
		top: 2,
		left: 2
	};



	this.infect = () => {
		console.info("infecting....");
		this.status = "i";
	}





};

person.prototype.toString = function(){
	return "[person "+this.id+" ="+this.status+"|]";
};


