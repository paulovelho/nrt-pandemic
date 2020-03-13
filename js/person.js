var person = function(){

	this.blockHeight = 20;

	this.id = 0;
	this.status = "n"; 
	// n = "normal" | i = "infected" | "d" = "dead"



	this.infect = () => {
		console.info("infecting....");
		this.status = "i";
	}





};

person.prototype.toString = function(){
	return "[person "+this.id+" ="+this.status+"|]";
};


