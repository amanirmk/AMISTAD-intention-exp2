/* 
Cynthia Hom
Newly redesigned animation!
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
var numStates = 10; // total number of steps to go is 10. (0 thru 9)
var numAnimationSteps = 7;// frames per state (and also per second!)
// for individual state animations 
var totalFrames = numAnimationSteps * numStates;
var frameNum = 0; // counter
//var stepAnimation = 1; // start at 1 because pics are labeled 1 thru 5


// fields that are updated by getInput method that is written to this file. 
var heroStates = []; //  Will contain states of heros and adversaries (length 10)
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
	}, 1000/numAnimationSteps);// repaint 7 times a second

	// only go up to a certain number of steps
	if (frameNum >= totalFrames)
	{
		clearTimeout(timer);
		step = 0;
		
		// if hero survived say that hero survived!
		if (heroState != "dead") 
		{
			showSurvived();
		}
		return;
	}
	console.log("frameNum is " + frameNum);
	updateCharacters();

	frameNum++;	// step through (1 to 10)
}


function updateCharacters()
{
	stateNum = Math.floor((frameNum)/numAnimationSteps); // 0 through 9. 
	animationNum = frameNum % numAnimationSteps + 1; // from 1 to 7. add 1 because otherwise we would get 0 through 6.

	heroState = getHeroState(heroStates[stateNum]);
	adversaryState = getAdversaryState(adversaryStates[stateNum]);

	// make the animation stop if either are dead
	if ((heroState == "dead" || adversaryState == "dead") && animationNum == 1) // only do this the first time they die, otherwise + 7 wont work.
	{
		// this way the dead image for the hero will actually be shown right away
			// (won't be hidden behind everything)
		if (heroState == "dead"){
			showDied();
		}
		renderFrame(animationNum);
		totalFrames = frameNum + numAnimationSteps; // make animation stop after these next 7 frames.
		return;
	}
	renderFrame(animationNum);// update both photos
}

// update one frame!
function renderFrame(animationNum)
{
	adversaryFolderName = "adversary" + adversaryState;
	heroFolderName = "hero" + heroState;
	hero.src = heroFolderName + "/" + heroFolderName + String(animationNum) + ".PNG";
	adversary.src = adversaryFolderName + "/" + adversaryFolderName + String(animationNum) + ".PNG";
	console.log("adversaryFileName is " + adversaryFolderName + String(animationNum));
	console.log("heroFileName is " + heroFolderName + String(animationNum));
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
adversaryStates = [19.0, 18.0, 17.0, 2.0, 1.0, 0.0, 2.0, -1.0, 0.0, 2.0];
}