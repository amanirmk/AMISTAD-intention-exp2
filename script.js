/* 
Cynthia Hom
Template for the js script for the animation!
Note: actual template name should be template.js. This is just called script.js
so that it will run with hard coded inputs for testing PURPOSES ONLY
Need to test on really large csv files 

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
	console.log("showing survived screen");
	youSurvivedImage.classList.add("lastImage"); // add to the class list
}
function showDied()
{
	console.log("showing died screen");
	youDiedImage.classList.add("lastImage");
}

/** Calls run() once every second.*/
function draw(){
	timer = setTimeout(function(){
		requestAnimationFrame(draw);  // call this every second
	}, 1000/fps);//1000/fps); // account for rounding

	// only go up to a certain number of steps
	if (step > maxStep)
	{
		clearTimeout(timer);
		step = 0;
		// show ending screen!
		/*if (heroState == "dead") 
		{
			showDied();
		}else {
			showSurvived();
		}*/
		if (adversaryState == "dead") 
		{
			showSurvived();
		}
		return;
	}
	console.log("running a step");
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
	/*if (heroState == "dead" || adversaryState == "dead")
	{
		step = maxStep;
		// this way the dead image for the hero will actually be shown right away
			// (won't be hidden behind everything)
		if (heroState == "dead"){
			showDied();
		}
	}*/

	if (heroState == "dead" || adversaryState == "dead")
	{
		//step = maxStep;
		// this way the dead image for the hero will actually be shown right away
			// (won't be hidden behind everything)
		if (heroState == "dead"){
			showDied();
			makeAnimation();
		}else{
			makeAnimation();
		}
		step = maxStep;
		return;
	}
	console.log("should not be here after surviavl/dying!");
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
	console.log("changing frame");
	adversaryFolderName = "adversary" + adversaryState;
	heroFolderName = "hero" + heroState;
	hero.src = heroFolderName + "/" + heroFolderName + String(stepAnimation) + ".PNG";
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(stepAnimation) + ".PNG";
	console.log("adversaryFileName is " + adversaryFolderName + String(stepAnimation));
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
}function getInput(){
hasPerception = true;
attackCycle = 3.0;
/*heroStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, -2.0, -1.0, 0.0, 2.0];
adversaryStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 1.0, -5.0, 2.0, 1.0]; // frame lag test*/
/*heroStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, 1.0, 0.0, 2.0];
adversaryStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, -5.0, 2.0, 1.0]; */// hero survives

heroStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, 1.0, 0.0, 2.0];
adversaryStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, -5.0, 2.0, 1.0];
}