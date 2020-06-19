/* 
Cynthia Hom
Template for the js script for the animation!
*/


// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary");
var youDiedImage = document.getElementById("youDied");
var youSurvivedImage = document.getElementById("youSurvived");

// current state in string
var adversaryState = "";
var heroState = "";

// for switching between states of agent
var fps = 1; // one frame per second.
var step = 0; 
var maxStep = 9; // total number of steps to go is 10. (0 thru 9)

// for individual state animations
var fpsAnimation = 7;
var stepAnimation = 1; // start at 1 because pics are labeled 1 thru 5
var maxStepAnimation = 7;

// fields that are updated by getInput method that is written to this file. 
var heroStates = []; //  Will contain states of heros and adversaries
var adversaryStates = [];
var attackCycle = 0; // for both hero and adversary
var hasPerception = false;

init();

/** Called when file is run */
function init() 
{
	getInput();
	draw();
}

// draw the screen for when an agent dies or survives!
function showSurvived() 
{
	youSurvivedImage.classList.add("lastImage"); // add to the class list
}
function showDied()
{
	youDiedImage.classList.add("lastImage");
}

/** Calls run() once every second.*/
function draw(){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);  // call this every second
	}, 1000/fps);

	// only go up to a certain number of steps
	if (step > maxStep)
	{
		clearTimeout(timer);
		step = 0;
		// show ending screen!
		if (heroState == "dead") 
		{
			showDied();
		}else {
			showSurvived();
		}
		return;
	}

	run(step); 

	step++;	// step through (1 to 10)
}


function run()
{
	console.log("step is " + step);
	// get input
	updateCharacters(step);
}



function updateCharacters()
{
	console.log("hero state is " + heroStates[step]);
	heroState = getHeroState(heroStates[step]);
	console.log("hero state (string) is " + heroState);
	adversaryState = getAdversaryState(adversaryStates[step]);
	//makeAnimation();// animate both 
	if (heroState == "dead" || adversaryState == "dead")
	{
		step = maxStep;
	}
	makeAnimation();// animate both 
}

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
		return;
	}

	adversaryFolderName = "adversary" + adversaryState;
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(stepAnimation) + ".PNG";

	heroFolderName = "hero" + heroState;
	hero.src = heroFolderName + "/" + heroFolderName + String(stepAnimation) + ".PNG";
	//console.log("adversaryFolderName is " + adversaryFolderName);
	console.log("heroFolderName is " + heroFolderName);

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
	}else if ((0 <= num) && (num < (attackCycle - 1))){ // prep to attack from 0 to 1
		return "InAttackCycle";
	}
	return "idle";
}

/** getAdversaryState(): state number --> state string.*/
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