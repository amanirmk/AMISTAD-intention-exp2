/* htmlTest.js
Cynthia Hom
Todo:
- implement showing idle/dead, etc. by making those animations too!
- implemement getting info from somewhere - FileReader api?
*/

var file = new File(["test????"], "htmlTest.txt");
//file.name = "htmlTest.txt"
var fileReader = new FileReader();
//text = fileReader.readAsText(file)

// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary");

// stuff for animation.
var fps = 1; // one frame per second.
var step = 0; 
var maxStep = 9; // total number of steps to go is 10. (0 thru 9)

// string input --> function for showing animation!
var heroFunctions = {
	idle: showIdleHero,
	dead: showDeadHero
}
var adversaryFunctions = {
	idle: showIdleAdversary,
	dead: showDeadAdversary,
	mad: showMadAdversary
}

var heroStates = []; // fields to use later. Will contain states of heros and adversaries
var adversaryStates = [];
var attackCycle = 3; // for both hero and adversary

init();

/** Called when file is run */
function init() 
{
	getInput();
	draw();
}

/** Get the list of states for both hero and adversary */
function getInput(){
	//testing stuff!
	text = fileReader.readAsText(file);
	console.log("reading from file?" + text);
	// change later to actually get input lol,
	heroStates = ["dead", "idle", "dead", "idle", "dead", "idle", "dead", "idle", "dead", "idle"];
	adversaryStates = ["idle", "mad", "idle", "mad", "idle", "mad", "idle", "mad", "idle", "mad"];
}

/** Calls run() once every second.*/
function draw(){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);  // call this every second
	}, 1000/fps);

	// only go up to a certain number of steps
	if (step >= maxStep)
	{
		clearTimeout(timer);
	}

	run(step); 

	step++;	// step through (1 to 10)
}


function run(stepNum)
{
	console.log("step is " + step);
	// get input
	updateHero(stepNum);
	updateAdversary(stepNum);
}

function updateHero(stepNum)
{
	console.log("stepNum is " + stepNum);
	console.log("hero state is " + heroStates[stepNum]);
	heroFunctions[heroStates[stepNum]]();
}

function updateAdversary(stepNum)
{
	console.log("stepNum is " + stepNum);
	console.log("adversary state is " + adversaryStates[stepNum]);
	adversaryFunctions[adversaryStates[stepNum]]();
}




//---------------- animations for specific states -------------------

function showIdleHero(){
	hero.src = "happyFace.jpg";
}

function showDeadHero()
{
	hero.src = "deadFace.jpg";
}

function showIdleAdversary()
{
	adversary.src = "happyFace.jpg";
}

function showDeadAdversary()
{
	adversary.src = "deadFace.jpg";
}

function showMadAdversary()
{
	adversary.src = "madFace.jpg";
}

//---------------- parsing input -------------------
/** getHeroState(): state number --> state string.*/
function getHeroState(num)
{
	if (num < 0) {		// dead if negative number 
		return "dead";
	}else if (num == attackCycle - 1){ // attack at 2
		return "attack";
	}
	return "idle";
}

/** getAdversaryState(): state number --> state string.*/
function getAdversaryState(num)
{
	if (num < 0) {
		return "dead";
	}else if(num == 0){
		return "attack";
	}
	else if ((0 < num) && (num < attackCycle))
	{
		return "mad";
	}
	return "idle";
}

