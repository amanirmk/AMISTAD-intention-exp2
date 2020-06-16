/* htmlTest.js
Cynthia Hom
Todo:
- implement showing idle/dead, etc. by making those animations too!
- implemement getting info from somewhere - FileReader api?

*/

//var file = new File(["test????"], "htmlTest.txt");
//file.name = "htmlTest.txt"
//var fileReader = new FileReader();
//text = fileReader.readAsText(file)

// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary");
var adversaryState = "";
var heroState = "";

// stuff for frames
var fps = 1; // one frame per second.
var step = 0; 
var maxStep = 9; // total number of steps to go is 10. (0 thru 9)

// for individual state animations
var fpsAnimation = 5;
var stepAnimation = 1; // start at 1 because pics are labeled 1 thru 5
var maxStepAnimation = 5;

// string input --> folder names for image animation!
/*var heroFolders = {
	idle: showIdleHero,
	dead: showDeadHero
}
var adversaryFolders = {
	idle: "adversaryidle"
	dead: "adversarydead",
	mad: "adversarymad",
	unknown: "adversaryunknown",
	attack: "adversaryattack"
}*/ // not needed because we can just concatenate instead!

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
	//text = fileReader.readAsText(file);
	//console.log("reading from file?" + text);
	// change later to actually get input lol,
	
	// set maxStep to the frame in which one of them dies.
	heroStates = ["idle", "idle", "idle", "attack", "attack", "attack", "attack", "dead", "dead", "dead"];
	adversaryStates = ["idle", "idle", "mad", "mad", "attack", "attack", "unknown", "unknown", "dead", "dead"];
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
	updateCharacters(stepNum);
	//updateHero(stepNum);
	//updateAdversary(stepNum);
}

function updateCharacters(stepNum)
{
	console.log("stepNum is " + stepNum);
	console.log("hero state is " + heroStates[stepNum]);
	heroState = heroStates[stepNum];
	adversaryState = adversaryStates[stepNum];
	makeAnimation(); // animate both 
	//heroFunctions[heroStates[stepNum]]();
}

/*function updateAdversary(stepNum)
{
	adversaryState = adversaryStates[stepNum];
	console.log("stepNum is " + stepNum);
	console.log("adversary state is " + state);
	console.log("folder name is " + "adversary" + state)
	makeAdversaryAnimation();
	//adversaryFunctions[adversaryStates[stepNum]]();
}
*/

/** General function to make an animation run! 
@param the folder name of the images in the animation. Folder
MUST contain exactly 5 images, with names consisting of the folder name and the
numbers 1 through 5
Each frame is a second, so these animations have 1/5 of a second each, i.e 1000/5 milliseconds
*/
function makeAnimation()
{
	animationTimer = setTimeout(function(){
		requestAnimationFrame(makeAnimation);  // call this every second
	}, 1000/fpsAnimation);

	// only go up to a certain number of steps
	if (stepAnimation > maxStepAnimation)
	{
		clearTimeout(animationTimer);
		stepAnimation = 1;
	}

	console.log("adversary" + adversaryState);
	adversaryFolderName = "adversary" + adversaryState;
	//console.log("image is " + folderName + "/" + folderName + String(stepAnimation) + ".PNG");
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(stepAnimation) + ".PNG";

	heroFolderName = "hero" + heroState;
	hero.src = heroFolderName + "/" + heroFolderName + String(stepAnimation) + ".PNG";
	
	stepAnimation++;
}

//---------------- animations for specific states -------------------
/*
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
*/
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

