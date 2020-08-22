/* 
 * script.js
 *
 * This file is simply a demonstration of a sample animation.
 * When generating an animation from csv data, use template.js instead.
 *
 * @summary Sample script for the AMISTAD-intention-exp2 animation.
 */


var hero = document.getElementById("hero"); // Hero and adversary image elements
var adversary = document.getElementById("adversary");
var youDiedImage = document.getElementById("youDied");
var youSurvivedImage = document.getElementById("youSurvived");

var adversaryState = ""; // Current states
var heroState = "";

var numStates = 10; // Number of states per animation
var numAnimationSteps = 7; // Number of steps per state
var totalFrames = numAnimationSteps * numStates;
var frameNum = 0; // Current frame of the animation

var heroStates = []; // These variables are set by getInput().
var adversaryStates = [];
var attackCycle = 0; 
var hasPerception = false;

init();

/** 
 * Called when file is run 
 */
function init() 
{
	getInput();
	draw();
}

/**
 * Displays the ending screens when an agent dies or survives
 */
function showSurvived() 
{
	console.log("showing survived screen");
	youSurvivedImage.classList.add("lastImage");
}
function showDied()
{
	console.log("showing died screen");
	youDiedImage.classList.add("lastImage");
}

/** 
 * Calls run() once every second. 
 * Stops once either the maximum framecount is reached, or an agent dies.
 */
function draw(){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);
	}, 1000/numAnimationSteps); // Repaints 7 times a second

	// Only go up to a certain number of frames
	if (frameNum >= totalFrames)
	{
		clearTimeout(timer);
		step = 0;
		
		// If hero survived show that hero survived
		if (heroState != "dead") 
		{
			showSurvived();
		}
		return;
	}
	console.log("Frame " + frameNum);
	updateCharacters();

	frameNum++;	// Step through frames (1 through 10)
}

/** 
 * Determines the state of the adversary and hero in the current frame and 
 * updates their images accordingly. 
 * Also stops the animation when agents die.
 */
function updateCharacters()
{
	stateNum = Math.floor((frameNum)/numAnimationSteps); // Generate random number from 0 through 9. 
	animationNum = frameNum % numAnimationSteps + 1; // animationNum goes from 1 to 7. Add 1 because otherwise we would get 0 through 6.

	heroState = getHeroState(heroStates[stateNum]);
	adversaryState = getAdversaryState(adversaryStates[stateNum]);

	// Stop the animation if either hero or adversary are dead
	if ((heroState == "dead" || adversaryState == "dead") && animationNum == 1) // Only do this the first time they die.
	{
		if (heroState == "dead"){ // Show the "died" image right away.
			showDied();
		}
		renderFrame(animationNum);
		totalFrames = frameNum + numAnimationSteps; // Stop animation after the next 7 frames.
		return;
	}
	renderFrame(animationNum); // Update both photos
}

/** 
 * Displays a single frame of the animation.
 * @param {Number} animationNum The frame of the current animation. Range: 1 to 7.
 */
function renderFrame(animationNum)
{
	adversaryFolderName = "adversary" + adversaryState;
	heroFolderName = "hero" + heroState;
	hero.src = heroFolderName + "/" + heroFolderName + String(animationNum) + ".PNG";
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(animationNum) + ".PNG";
}


/** 
 * Takes in a hero state number and converts it to a hero state string. 
 * This is necessary because the csv holds states as numbers, while the 
 * image file names use state strings.
 * @param  {Number} num The hero state number.
 * @return {String} 	The hero state string.
 */
function getHeroState(num)
{
	if (num < 0) {	
		return "dead"; // Heroes are dead if their state is a negative number 
	}else if (num == attackCycle - 1){ 
		return "attack";
	}else if ((0 <= num) && (num < (attackCycle - 1))){ 
		return "InAttackCycle";
	}
	return "idle";
}

/** 
 * Takes in an adversary state number and converts it to an adversary state string. 
 * This is necessary because the csv holds states as numbers, while the 
 * image file names use state strings.
 * @param  {Number} num The adversary state number.
 * @return {String} 	The adversary state string.
 */
function getAdversaryState(num)
{
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

/** 
 * Gets the input for the states of the hero and adversary, and sets default parameters.
 * This method was written to the file by the visualizeRun() method in the python
 * file data.py.
 */
function getInput()
{
	hasPerception = true;
	attackCycle = 3.0;
	heroStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, 1.0, 0.0, 2.0];
	adversaryStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, -1.0, 0.0, 2.0];
}