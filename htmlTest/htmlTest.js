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
//var adversaryState = "";
//var heroState = "";
var heroStringStates = [] // 1-D arrays, hold states for one run.
var adversaryStringStates = [] 
var hasPerception = false;
var attackCycle = 0;

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
var simNum = 0;

init();

/** Called when file is run */
function init() 
{
	getInput(); // this will be appended to the file!!
	run();
}

/** Runs the first few simulations. Number of simulations specified by numRuns*/
function run()
{
	runTimer = setTimeout(function(){
		requestAnimationFrame(run);  // call this every maxStep seconds. Add 1 because step goes from 0 to maxStep.
	}, 1000 * (setMaxStepAndStringArrays() + 1) + 1); 

	if (simNum >= numSims) // simNum starts at 0
	{
		clearTimeout(runTimer);
		simNum = 0; // reset simNum
		console.log("PROGRAM FINISHED");
		return;
	}
	//maxStep = getMaxStep();
	console.log("maxStep is " + maxStep)
  	attackCycle = attackCycleArray[simNum];
  	hasPerception = hasPerceptionArray[simNum] == 4.;
	draw();
	simNum++;
	//console.log("simNum is " + simNum);
	//console.log("numSims is " + numSims);
}

function setMaxStepAndStringArrays()
{
	// update state arrays (string --> int) ONLY for one run of simulation.
	heroStringStates = genStringArray(heroStates[simNum], getHeroState);
	adversaryStringStates = genStringArray(adversaryStates[simNum], getAdversaryState);
	
	// find index to stop simulating at.
	stopIndexHero = heroStringStates.indexOf("dead");
	stopIndexAdversary = adversaryStringStates.indexOf("dead");
	if (stopIndexHero == -1 && stopIndexAdversary != -1){
		maxStep = stopIndexAdversary;
	}else if (stopIndexAdversary == -1 && stopIndexHero != -1){
		maxStep = stopIndexHero;
	}else if (stopIndexAdversary != -1 && stopIndexHero != -1){
		maxStep = Math.max(stopIndexHero, stopIndexAdversary);
	}
	return maxStep
}

/** stateFunct: the function to use to convert int-> string*/
function genStringArray(stateArrIn, stateFunct){
	var stringArray = []
	for(let index = 0; index < stateArrIn.length; index++)
	{
		stringArray.push(stateFunct(stateArrIn[index]));
	}
	return stringArray;
}

/** Draws a single simulation*/
function draw(){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);  // call this every second
	}, 1000/fps + 2);

	// only go up to a certain number of steps
	if (step > maxStep)
	{
		clearTimeout(timer);
		console.log("SIMULATION " + simNum + " FINISHED at step " + step + " and maxStep " + maxStep);
		step = 0;
		return;
	}
	console.log("inside draw, step is " + step + " simNum is " + simNum + " stepAnimation is " + stepAnimation);
	stepAnimation = 1;
	updateCharacters();

	step++;	// step through (1 to 10)
}

/** updates characters for a given frame of a given simulation.*/
function updateCharacters()
{
	//console.log("in update characters, simNum is " + simNum);

	//heroState = getHeroState(heroStates[simNum][step]);
	//adversaryState = getAdversaryState(adversaryStates[simNum][step]);

	//console.log("hero state is " + heroState);
	//console.log("adversary state is " + adversaryState);

	makeAnimation(); // animate both

	// stop animation if either died
	//if (heroState == "dead" || adversaryState == "dead")
	//{
		//step = maxStep;
	//}
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
		console.log("ANIMATION " + step + " COMPLETE")
		stepAnimation = 1;
		return;
	}
	//console.log("stepAnimation is " + stepAnimation);
	//console.log("maxStepAnimation is " + maxStepAnimation);
	//console.log("setting images, adversary is " + adversaryState);
	console.log("inside makeAnimation, step is " + step + " maxStep is " + maxStep)
	adversaryFolderName = "adversary" + adversaryStringStates[step];
	//console.log("image is " + folderName + "/" + folderName + String(stepAnimation) + ".PNG");
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(stepAnimation) + ".PNG";

	heroFolderName = "hero" + heroStringStates[step];
	hero.src = heroFolderName + "/" + heroFolderName + String(stepAnimation) + ".PNG";
	
	stepAnimation++;
}



//---------------- interpreting input -------------------
/** getHeroState(): state number --> state string.*/
function getHeroState(num)
{
	//console.log("heroStateNum is " + num);
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
	//console.log("adversaryStateNum is " + num);
	if (num < 0) {
		return "dead";
	}else if (!hasPerception){
		return "unknown";
	}else if(num == 0){
		return "attack";
	}else if ((0 < num) && (num < attackCycle))
	{
		return "mad";
	}
	return "idle";
}

function getInput(){
hasPerceptionArray = [4., 4., 4., 4., 4., 4., 4., 4., 4., 4.];
attackCycleArray = [3., 3., 3., 3., 3., 3., 3., 3., 3., 3.];
heroStates = [[ 19.,  18.,  17.,  16.,  15.,  14.,   2.,   1.,   0.,   2.],
 [ 19.,  18.,  -1.,  16.,  15.,  14.,  13.,  12.,  11.,  10.],
 [ 19.,  18.,  17.,  16.,  15.,   2.,   1.,   0.,   2.,   1.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,  13.,  12.,  11.,   2.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,  13.,  12.,  11.,  10.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,  13.,   2.,   1.,   0.],
 [ 19.,  18.,  17.,   2.,   1.,   0.,   2.,   1.,   0.,   2.],
 [ 19.,  18.,  17.,   2.,   1.,   0.,   2.,   1.,   0.,   2.],
 [ 19.,  18.,  17.,  16.,   2.,   1., -30., -30., -30., -60.],
 [ 19.,  18.,  17.,   2.,   1.,   0.,   2.,   1.,   0.,   2.]];
adversaryStates = [[ 19.,  18.,  17.,  16.,  15.,   2.,   1., -30., -30., -30.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,  13.,  12.,  11.,  10.],
 [ 19.,  18.,  17.,  -1.,  15.,   1., -30., -30., -30., -60.],
 [ 19.,  18.,  -1.,  16.,  15.,  14.,  13.,  12.,   2.,   1.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,  13.,  12.,  11.,  10.],
 [ 19.,  18.,  17.,  16.,  15.,  14.,   2.,   1., -30., -30.],
 [ 19.,  18.,   2.,   1., -30., -30., -30., -30., -30., -30.],
 [ 19.,  18.,   2.,   1., -30., -30., -30., -30., -30., -30.],
 [ 19.,  18.,  17.,   2.,   1.,   0.,   2.,   1.,   0.,   2.],
 [ 19.,  18.,   2.,   1.,   0.,   2.,   1., -30., -30., -30.]];
numSims = 3;
}

