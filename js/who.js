angular
.module("nrt-pandemic")
.controller("whoController",
function($scope, $rootScope, $interval, $sce){
	
	// variables:
	$scope.size = 62;
	$scope.censo = 62 * 62;

	$scope.map = [];

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
	$scope.populate = () => {
		createNewMap();
		for (var i = 5; i > 0; i--) {
			infectRandom();
		}
	}
	var createNewMap = () => {
		for (var i = 0; i < $scope.size; i++) {
			$scope.map[i] = [];
			for (var j = 0; j < $scope.size; j++) {
				let p = new person();
				$scope.map[i][j] = p;
			}
		}
		$scope.map[61][42].infect();
	}
	var infectRandom = () => {
		let random = selectRandom();
		$scope.map[random.i][random.j].infect();
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






	// move:
	$scope.animate = null;
	var moveAnimate = (moveTo, stepFn) => {
		$($scope.moves).animate(moveTo, {
			duration: 1000,
			step: stepFn,
			done: () => {
				console.info($scope.map);
			}
		});
	}
	var moveAnimateCol = function() {
		console.info("up to ", this);
		$(".col-even").css("transform", `translateY(${this.coleven}px)`); 
		$(".col-odd").css("transform", `translateY(${this.colodd}px)`);
	}
	var moveAnimateRow = function() {
		console.info("side to ", this);
		$(".row-even").css("transform", `translateX(${this.roweven}px)`); 
		$(".row-odd").css("transform", `translateX(${this.rowodd}px)`); 
	}

	$scope.movedown = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.coleven -= $scope.moveTranslation;
		end.colodd += $scope.moveTranslation;
		moveAnimate(end, moveAnimateCol);
	}
	$scope.moveup = () => {
		let end = JSON.parse(JSON.stringify($scope.moves));
		end.coleven += $scope.moveTranslation;
		end.colodd -= $scope.moveTranslation;
		moveAnimate(end, moveAnimateCol);
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
		return {
			i: Math.floor(Math.random() * Math.floor($scope.size)),
			j: Math.floor(Math.random() * Math.floor($scope.size))
		};
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


