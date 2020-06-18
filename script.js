/* htmlTest.js
Cynthia Hom
Todo:
- Need to figure out how to not show background image at first and then show it afterwards
- Solution ideaS?
	- use style.display = none
	- use style.visibility = hidden
	- important! allows the css to override things.
- Otherwise, maybe finda  way to bring the normal backgorund image to the front instead????
*/


// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary");
var gameOverImage = document.querySelector("div");
var background = document.getElementById("background");
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
var heroStates = []; // fields to use later. Will contain states of heros and adversaries
var adversaryStates = [];
var attackCycle = 0; // for both hero and adversary
var hasPerception = false;

init();

/** Called when file is run */
function init() 
{
	getInput();
	draw();
	//gameOverImage.style.display = 'block';
	//endSim();
}

function endSim() // draw the end simulation screen
{
	gameOverImage.classList.add("gameOver"); // add to the class list
	//gameOverImage.display = "inline";
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
		step = 0;
		if (heroState == "dead" || adversaryState == "dead") // if either are dead, then put the image to say theya re dead.
		{
			endSim();
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
	adversaryState = getAdversaryState(adversaryStates[step]);
	makeAnimation();// animate both 
	if (heroState == "dead" || adversaryState == "dead")
	{
		step = maxStep;
	}
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

	console.log("adversary" + adversaryState);
	adversaryFolderName = "adversary" + adversaryState;
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