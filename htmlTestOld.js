/* htmlTest.js
Cynthia Hom
*/

// get hero and adversary from the html, so we can change their images.
var hero = document.getElementById("hero");
var adversary = document.getElementById("adversary")

// remove later
var testString = document.getElementById("test!")

// string input --> reference to function to show animation
var dict = {
	/*idleHero: function(){
	hero.src = "happyFace.jpg";
	console.log("in showIdleHero!");*/
}
	//"idleAdversary": showIdleAdversary

//var dict = Object()
//dict["idleHero"] = showIdleHero

init();

function init() // like init in python, main, etc. Sets up page.
{
	run(); 
}


function run()
{
	console.log("in run");
	// get input

	// loop through images and show them.
	//adversary.src = "happyFace.jpg"
	//hero.src = "madFace.jpg"
	//testString.color = "rgb(244, 0, 0)";
	adversary.src = "happyFace.jpg";

	setUpDict();

	dict["idleHero"]();
	dict["idleAdversary"]();
	console.log("in run");
}
var var1 = function(){
	hero.src = "happyFace.jpg";
	console.log("in showIdleHero!");
	};
function setUpDict()
{
	dict.idleHero = var1;

}

/*
dict.idleHero = function(){
	hero.src = "happyFace.jpg";
	console.log("in showIdleHero!");
};

dict["idleAdversary"] = function showIdleAdversary()
{
	adversary.src = "madFace.jpg";
};*/