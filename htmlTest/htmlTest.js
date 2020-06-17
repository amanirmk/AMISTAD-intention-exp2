/* htmlTest.js
Cynthia Hom
Todo:
- Fix getAdversaryState
- TEST EVERYTHING!!! esp. getting the state from the num, making sure the appended
getInput() works
*/


// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary");
var adversaryState = "";
var heroState = "";
var hasPerception = false;

// stuff for frames
var fps = 1; // one frame per second.
var step = 0; 
var maxStep = 9; // total number of steps to go is 10. (0 thru 9)

// for individual state animations
var fpsAnimation = 5;
var stepAnimation = 1; // start at 1 because pics are labeled 1 thru 5
var maxStepAnimation = 5;


// inputs from getInput():
var heroStates = []; // fields to use later. Will contain states of heros and adversaries
var adversaryStates = [];
var attackCycleArray = []; // how long attack cycle is for a given run.
var hasPerceptionArray = [];
var numSims = 0; // number of simulations to go through

init();

/** Called when file is run */
function init() 
{
	getInput(); // this will be appended to the file!!
	run(numSims);
}

/** Runs the first few simulations. Number of simulations specified by numRuns*/
function run(numRuns)
{
	for (let simNum = 0; simNum < numRuns; simNum++) {
  		draw(simNum);
	}
}

/** Draws a single simulation*/
function draw(simNum){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);  // call this every second
	}, 1000/fps);

	// only go up to a certain number of steps
	if (step >= maxStep)
	{
		clearTimeout(timer);
	}

	updateCharacters(simNum, step)

	step++;	// step through (1 to 10)
}

/** updates characters for a given frame of a given simulation.*/
function updateCharacters(simNum, stepNum)
{
	console.log("stepNum is " + stepNum);
	console.log("hero state is " + heroStates[simNum][stepNum]);
	heroState = getHeroState(heroStates[simNum][stepNum]);
	adversaryState = getAdversaryState(adversaryStates[simNum][stepNum]);
	makeAnimation(); // animate both 
	//heroFunctions[heroStates[stepNum]]();
}

/** General function to make one frame of animation!
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



//---------------- interpreting input -------------------
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

