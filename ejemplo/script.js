console.clear();

// Get the core elements
var container = document.getElementsByClassName("container");
var tube = document.getElementsByClassName("tube");
var clone = document.getElementsByClassName("clone");
var finalWrap = document.getElementsByClassName("final__wrap");

// Create the cloned nodes, append and add classes for required HTML structure - WARNING: Ugly code below 💩
var finalClone = clone[0].cloneNode(true); // clone the clean node and append to final__wrap
finalWrap[0].appendChild(finalClone).classList.add("final");

for (var i = 0; i < 2; i++) {
	var newClone = clone[0].cloneNode(true); // clone the header
	var lineClass = "line"+(i+2); // create class name to append
	tube[0].appendChild(newClone); // append the clone
	clone[i].classList.add("line"); // add cline lass
	clone[i+1].classList.add(lineClass); // add incremented line class
}
clone[0].classList.add("line1"); // add line1 class to the first node

// Yuk! Now for the fun stuff…

// Show it to me!
TweenMax.set('.container', {
	visibility: 'visible'
});

// Get cloned elements
var lines = document.getElementsByClassName("line");
var line1 = document.getElementsByClassName("line1");
var line2 = document.getElementsByClassName("line2");
var line3 = document.getElementsByClassName("line3");
var final = document.getElementsByClassName("final");

// split the text characters
var splitLine1 = new SplitText(line1, { type:" chars", charsClass:"char" });
var splitLine2 = new SplitText(line2, { type:" chars", charsClass:"char" });
var splitLine3 = new SplitText(line3, { type:" chars", charsClass:"char" });
var splitFinal = new SplitText(final, { type:" chars", charsClass:"char" });

// Set up vars
var animTime = 0.9; // baseline animation time for each stagger
var width = document.documentElement.clientWidth; // viewport width
var height = document.documentElement.clientHeight; // viewport height
var depth = -width/8; // rotation depth based on viewport width
var tOrigin = "50% 50% "+depth; // transform origin as a factor of viewport width to allow for different device widths


// Init 3D perspective
TweenMax.set([lines, final], { perspective:700, transformStyle:"preserve-3d"});

// Animate Timeline
var linesTL = new TimelineMax();
linesTL.staggerFromTo(splitLine1.chars, animTime, { rotationX: -90  }, { rotationX: 90, ease:Linear.easeNone, transformOrigin: tOrigin }, 0.08)
	.staggerFromTo(splitLine2.chars, animTime, { rotationX: -90 }, { rotationX: 90, ease:Linear.easeNone, transformOrigin: tOrigin }, 0.08, 0.45)
	.staggerFromTo(splitLine3.chars, animTime, { rotationX: -90 }, { rotationX: 90, ease:Linear.easeNone, transformOrigin: tOrigin }, 0.08, 0.9)
	.staggerFromTo(splitFinal.chars, animTime*1.8, { rotationX: -90, alpha: 0 }, { rotationX: 0, alpha: 1, ease:Expo.easeOut, transformOrigin: tOrigin }, 0.06, 1.6)
	.fromTo(final, animTime*5, { y:height/6 }, { y:-height/6 , ease:Power4.easeOut }, 2.0 )

// Rotate final text on mouse move
window.addEventListener("mousemove", onMouseMove);

function onMouseMove(e) {
	var sxPos = (e.pageX / width*100 - 50)*2 ;
	var syPos = (e.pageY / height*100 - 50)*2;
	TweenMax.to(finalWrap, 3, {
		rotationY: 0.04 * sxPos,
		rotationX: -0.04 * syPos,
		transformOrigin: "center center -800",
		ease: Expo.easeOut
	});
}

// linesTL.pause();
// var progressTL = new TimelineMax();
// progressTL.fromTo(linesTL, animTime*8, { progress: 0 }, { progress: 1, ease: Sine.easeOut })
	

/*  ==========================================================================
    Greensock Dev Tools
    ========================================================================== */  

	//instantiate GSDevTools with default settings
	GSDevTools.create( );

/*  ==========================================================================
    FPS GUI stats.js
    ========================================================================== */  

// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()