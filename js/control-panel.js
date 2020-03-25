
var setupVisible = true;

function quarantineUpdate(val) {
	document.getElementById("quarantine").value = val;
	document.getElementById("btn-play").disabled = true;
	
	document.getElementById("quarantineLevel").innerHTML = val + "%";
	pandemic.quarantineLevel = val/100;
}
function hospitalUpdate(val) {
	document.getElementById("hospital").value = val;
	document.getElementById("btn-play").disabled = true;

	document.getElementById("hospitalLevel").innerHTML = val + "%";
	pandemic.hospitalCapacity = val/100;
}
function incubationUpdate(val) {
	document.getElementById("incubation").value = val;
	document.getElementById("btn-play").disabled = true;

	document.getElementById("incubationLevel").innerHTML = val + " dias";
	pandemic.incubationPeriod = val;
}

function disabled(val) {
	document.getElementById("quarantine").disabled = val;
	document.getElementById("hospital").disabled = val;
	document.getElementById("incubation").disabled = val;
	document.getElementById("btn-reset").disabled = val;
	document.getElementById("btn-play").disabled = !val;
	setupVisible = !val;
}


function setPause() {
	document.getElementById("btn-play").innerHTML = "&#9208; Chega, por favor, chega!";
	document.getElementById("btn-reset").innerHTML = "&#9724; Alterar setup";
	document.getElementById("btn-reset").disabled = true;
}
function setPlay() {
	document.getElementById("btn-play").innerHTML = "&#9658; Vai!";
	document.getElementById("btn-reset").disabled = false;
}


function playPause() {
	console.info("play pause..");
	pandemic.StartStopGame();
	if(setupVisible) {
		disabled(true);
	}
}
function reset() {
	if(!setupVisible) {
		document.getElementById("btn-reset").innerHTML = "&#8635; Novo teste";
		disabled(false);
	} else {
		setPlay();
		document.getElementById("btn-play").disabled = false;
		pandemic.reset();
	}
}


function Corona() {
	quarantineUpdate(0);
	hospitalUpdate(40);
	incubationUpdate(6);
	pandemic.mortality = 0.05;
	pandemic.timeToDie = 7;
	pandemic.contaminationChance = 1;
	pandemic.name = "Covid-19";
}
function H1N1() {
	quarantineUpdate(0);
	hospitalUpdate(40);
	incubationUpdate(2);
	pandemic.mortality = 0.01;
	pandemic.timeToDie = 7;
	pandemic.contaminationChance = 0.8;
	pandemic.name = "H1N1 (2009)";
}
function Ebola() {
	reset();
	quarantineUpdate(0);
	hospitalUpdate(40);
	incubationUpdate(0)
	pandemic.mortality = 0.30;
	pandemic.timeToDie = 7;
	pandemic.contaminationChance = 0.4;
	pandemic.name = "Ebola (2014)";
}


function OhNoes() {
	let disease = getParameterByName("case");
	switch(disease) {
		case "h1n1":
			H1N1();
			break;
		case "ebola":
			Ebola();
			break;
		case "covid":
		default:
			Corona();
			break;
	} 
	pandemic.Initialize();
	window.setTimeout(() => {
		document.getElementById("btn-play").disabled = false;
	}, 500);
}


function getParameterByName(name) {
	let url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

OhNoes();
