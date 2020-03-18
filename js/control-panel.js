
var setupVisible = true;

function quarantineUpdate(val) {
	document.getElementById("quarantine").value = val;
	
	document.getElementById("quarantineLevel").innerHTML = val + "%";
	pandemic.quarantineLevel = val/100;
}
function hospitalUpdate(val) {
	document.getElementById("hospital").value = val;

	document.getElementById("hospitalLevel").innerHTML = val + "%";
	pandemic.hospitalCapacity = val/100;
}
function incubationUpdate(val) {
	document.getElementById("incubation").value = val;

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


function OhNoes() {
	quarantineUpdate(0);
	hospitalUpdate(40);
	incubationUpdate(4)
	pandemic.Initialize();
}

OhNoes();
