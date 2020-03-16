angular
.module("nrt-pandemic")
.controller("whoController",
function($scope, $rootScope, $interval, $sce){
	
	// variables:
	$scope.size = 62;
	let limit = $scope.size -1;
	$scope.censo = 62 * 62;

	$scope.population = [];

	$scope.moveTranslation = 12;
	$scope.moves = {
		colodd: 0,
		coleven: 0,
		rowodd: 0,
		roweven: 0
	};

	// interaction events
//	$scope.$on("play-pause", function(){ $scope.playpause(); });



	// setup:
	$scope.resetMove = () => {
		$scope.moves = {
			colodd: 0,
			coleven: 0,
			rowodd: 0,
			roweven: 0
		};
	}
	$scope.populate = () => {
		let pid = 1;
		let row = 0;
		let col = 0;
		for (var i = 0; i <= $scope.censo; i++) {
			let p = new person();
			p.id = pid;
			$scope.population.push(p);
			pid ++;
		}
		for (var i = 5; i > 0; i--) {
			infectRandom();
		}
	}
	var infectRandom = () => {
		let random = selectRandom();
		$scope.population[random].infect();
	}


	// tick
	var resetMove = () => {
		$scope.moves = {
			colodd: 0,
			coleven: 0,
			rowodd: 0,
			roweven: 0
		};
	}
	var checkBottom = (col) => {
		let last_person = $scope.map[limit][col];

		for(let i = limit; i > 0; i--) {
			$scope.map[i][col] = $scope.map[i-1][col];
		}
		$scope.map[0][col] = last_person;

		col = col + 2;
		if(col <= limit) return checkBottom(col);
		return true;
	}
	var checkTop = (col) => {
		let first_person = $scope.map[0][col];

		for(let i = 0; i < limit; i++) {
			$scope.map[i+1][col] = $scope.map[i][col];
		}
		$scope.map[limit][col] = first_person;

		col = col + 2;
		if(col <= limit) return checkTop(col);
		return true;
	}

	var tickDone = () => {
		$scope.$apply();
	}





	// move:
	$scope.animate = null;
	var moveAnimate = (moveTo, stepFn, doneFn = null) => {
		$($scope.moves).animate(moveTo, {
			duration: 1000,
			step: stepFn,
			done: doneFn
		});
	}
	var moveAnimateCol = function() {
		$(".col-even").css("transform", `translateY(${this.coleven}px)`); 
		$(".col-odd").css("transform", `translateY(${this.colodd}px)`);
	}
	var moveAnimateRow = function() {
		$(".row-even").css("transform", `translateX(${this.roweven}px)`); 
		$(".row-odd").css("transform", `translateX(${this.rowodd}px)`); 
	}

	$scope.movedown = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.coleven -= $scope.moveTranslation;
		end.colodd += $scope.moveTranslation;
		moveAnimate(end, moveAnimateCol, () => {
			console.info("done");
			checkTop(0);
			checkBottom(1);
			tickDone();
		});
	}
	$scope.moveup = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.coleven += $scope.moveTranslation;
		end.colodd -= $scope.moveTranslation;
		moveAnimate(end, moveAnimateCol, () => {
			console.info("done");
//			checkBottom(0);
			checkTop(1);
			tickDone();
		});
	}
	$scope.moveleft = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.roweven -= $scope.moveTranslation;
		end.rowodd += $scope.moveTranslation;
		moveAnimate(end, moveAnimateRow);
	}
	$scope.moveright = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.roweven += $scope.moveTranslation;
		end.roeodd -= $scope.moveTranslation;
		moveAnimate(end, moveAnimateRow);
	}





	// utils
	var selectRandom = () => {
		return Math.floor(Math.random() * Math.floor($scope.censo));
	}
	var selectRandomPos = () => {
		return {
			i: Math.floor(Math.random() * Math.floor($scope.size)),
			j: Math.floor(Math.random() * Math.floor($scope.size))
		};
	}





	// helper
	var printMap = () => {
		for (var i = 0; i <= limit; i++) {
			for (var j = 0; j <= limit; j++) {
				console.info(`map[${i}][${j}] `, $scope.map[i][j]);
			}
		}
	}




	$scope.play = () => {
		$scope.movedown();
	}

	var initialize = () => {
		console.info("initialize");
		$scope.populate();
	};
	initialize();

});


