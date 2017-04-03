var scene, camera, renderer,  composer;
var geometry, material, mesh;
var started = false;
var sphere;
var priorBlockID;
var currentMelody = [];
var unusedPositions = [];
var beatLengths = ["1n", "1n", "2n", "4n", "2n", "4n", "4n", "8n"];
var collectedBlocks = [];
var currentColors = [];
var lastBlockPlayed;
var mute = false;
var clock = new THREE.Clock();
var specialColors = ["0xff1744", "0xf50057", "0xd500f9", "0xff3d00"];
var notes = ["C2", "D#2", "F2", "Ab2", "Ab3", "G3", "C4", "Bb3", "F3", "D4", "Eb4"];
// var chords = [ ["C2", "F2", "Ab2", "C4"], ["Eb3", "G3", "Ab4", "G2"], ["F2", "Bb3", "F3", "D4"], ["G2", "Bb3", "C4", "Eb4"] ];

var chords = [["B1", "F#1", "F#2", "B2", "F#3", "B3", "D3", "A3", "D4", "E4", "A4", "D5"], ["B2", "F#2", "B3", "F#3", "D2", "E2", "A2", "D3", "E3", "A3", "D4"],
["D2", "F#2", "D3", "F#3", "D2", "E2","F#2", "A2", "E3", "A3", "E4" ], ["F#2", "C#2", "F#3", "C#3", "E3", "F#3", "A3", "B3", "C#3", "E4", "A4", "B4", "E5"],
["D1", "A2", "D2", "A3", "E3", "F#3", "G#3", "A3", "B3", "E4", "B4"], ["A2", "E2", "A3", "E3", "F#3", "G#3", "B3", "C#4", "E4", "B4"],
["C#2", "F#2", "C#3", "F#3", "G#3", "A3", "C#4", "A4", "C#5"], ["F#1", "C#2", "F#2", "C#3", "F#3", "G#3", "A3", "B3", "C#4", "F#4"],
["E1", "A1", "E2", "A2", "C#3", "F#3", "G#3", "A3", "B3", "E4", "G#4", "B4", "E5"], ["D1", "A1", "D2", "A2", "F#3", "G#3", "A3", "E4", "A4", "E5"]]
var currentNotes = chords[0];
//cyan, green, lime, amber, deep orange, red, pink, purple, indigo, light blue 
var color_schemes = 
[
[0x006064, "0xe0f7fa", "0xb2ebf2", "0x80deea", "0x44d0e1", "0x26c6da", "0x00bcd4", "0x00acc1", "0x0097a7"], 
[0x1b5e20, "0xe8f5e9", "0xc8e6c9", "0xa5d6a7", "0x81c784", "0x66bb6a", "0x4caf50", "0x43a047", "0x388e3c"],
[0xf57f17, "0xfffde7", "0xfff9c4", "0xfff59d", "0xfff176", "0xffee58", "0xffeb3b", "0xfdd835", "0xfbc02d"], 
[0xff6f00, "0xfff8e1", "0xffecb3", "0xffe082", "0xffd54f", "0xffca28", "0xffc107", "0xffb300", "0xffa000"], 
[0xbf360c, "0xfbe9e7", "0xffccbc", "0xffab91", "0xff8a65", "0xff7043", "0xff5722", "0xf4511e", "0xe64a19"], 
[0xb71c1c, "0xffebee", "0xffcdd2", "0xef9a9a", "0xe57373", "0xef5350", "0xff1744", "0xf44336", "0xd32f2f"], 
[0x880e4f, "0xfce4ec", "0xf8bbd0", "0xf48fb1", "0xf06292", "0xf50057", "0xec407a", "0xe91e63", "0xe91e63"], 
[0x4a148c, "0xf3e5f5", "0xe1bee7", "0xce93d8", "0xba68c8", "0xab47bc", "0xd500f9", "0x9c27b0", "0x7b1fa2"], 
[0x1a237e, "0xe8eaf6", "0xc5cae9", "0x9fa8da", "0x7986cb", "0x5c6bc0", "0x3d5afe", "0x3f51b5", "0x303f9f"], 
[0x01579b, "0xe1f5fe", "0xb3e5fc", "0x81d4fa", "0x4fc3f7", "0x29b6f6", "0x00b0ff", "0x03a9f4", "0x0288d1"]
];
var tick = 0,
    smallestDimension = Math.min( window.innerWidth, window.innerHeight ),
    viewportWidth = smallestDimension,
    viewportHeight = smallestDimension,

    //world width and world height might become object or card width, card height
    worldWidth = 250,
    worldHeight = 250,
    tileWidth = 50,
    tileHeight = 50,
    ran =64,
    spotLight, ambientLight, plane,

    FOV = 200;

// mainGain.gain.exponentialRampToValueAtTime(.1, context.currentTime + 1);
//     mainGain.gain.value = .1;



function muteSound() {
    mute != mute;
    if (mute === true) {
            document.getElementById("mute-button").innerHTML = "UN-MUTE";
    } else {
            document.getElementById("mute-button").innerHTML = "MUTE";
    }
    Tone.Master.mute = !Tone.Master.mute
}

var osc, reverb, feedbackDelay, feedbackDelay2, feedbackDelay3, wider, eq, synthEQ, specialSynth, specialSynth2, synth, polySynth, conga, congaPart, noise, autoFilter;

function start_tone_stuff(){
	osc = "triangle";
// spotLight.intensity = 1;
	reverb = new Tone.Freeverb(.95).toMaster();
	reverb.dampening.value = 3000;
	feedbackDelay = new Tone.FeedbackDelay("6n", .75).toMaster();
	feedbackDelay3 = new Tone.FeedbackDelay("1n", 0.55).toMaster();

	wider = new Tone.StereoWidener (1).connect(reverb);
	feedbackDelay2 = new Tone.PingPongDelay("3n", .25).connect(wider);
	//var stereoFeed = new Tone.StereoFeedbackEffect ().connect(feedbackDelay2);

	eq = new Tone.EQ3(-5, 3, -9).connect(feedbackDelay2);

	synthEQ = new Tone.EQ3(-10, -1, 3).connect(feedbackDelay);

	specialSynth = new Tone.DuoSynth().connect(feedbackDelay3);
	specialSynth.set({
		vibratoAmount:0.75,
		vibratoRate:.25,
		harmonicity:1.95,
		voice0:{
			volume:-5,
			portamento:.2,
			oscillator:{
				type:"sine"
			},
			filterEnvelope:{
				attack:0,
				decay:0,
				sustain:1,
				release:1.5
			},
			envelope:{
				attack:1.5,
				decay:0,
				sustain:5,
				release:5.5
			}
		},
		voice1:{
			volume:-10,
			portamento:.75,
			oscillator:{
				type:"sine"
			},
			filterEnvelope:{
				attack:0.5,
				decay:0,
				sustain:3,
				release:3
			},
			envelope:{
				attack:3.25,
				decay:0,
				sustain:5,
				release:9.5
			}
		}
	})
	specialSynth.volume.value = -25;
	specialSynth2 = new Tone.FMSynth().connect(feedbackDelay3);
	specialSynth2.set({
		harmonicity:1,
		modulationIndex:1.5,
		detune:.25,
		oscillator:{
			type:"sawtooth6"
		},
		envelope:{
			attack:0.53,
			decay:0.01,
			sustain:1,
			release:5.75,
		},
		modulation:{
			type:"square"
		},
		modulationEnvelope:{
			attack:0.5,
			decay:0,
			sustain:1,
			release:5.5
		}
	})
	specialSynth2.volume.value = -25;
	synth = new Tone.FMSynth().connect(feedbackDelay);
	synth.set({
		harmonicity:3,
		modulationIndex:3.5,
		detune:.01,
		oscillator:{
			type:"sine"
		},
		envelope:{
			attack:0.03,
			decay:0.01,
			sustain:1,
			release:0.75,
		},
		modulation:{
			type:"square"
		},
		modulationEnvelope:{
			attack:0.5,
			decay:0,
			sustain:1,
			release:0.5
	}});
	synth.volume.value = -5;
	feedbackDelay.wet.value = .5;

	polySynth = new Tone.PolySynth(4, Tone.MonoSynth).connect(eq);
	polySynth.set({
	    "oscillator" : "PWM",
	    "envelope" : {
	        "attack" : 5,
	        "release" : .5,
	        "attackCurve" : "sine",
	        "releaseCurve" : "exponential"
	    }
	});
	polySynth.volume.value = -50;

	var loop2 = new Tone.Loop(function(time){
	    polySynth.triggerAttackRelease(currentNotes[Math.floor(Math.random() * (currentNotes.length - 5))], "3m");
	}, beatLengths[Math.floor(Math.random() * beatLengths.length)]).start();
	conga = new Tone.MembraneSynth({
	    "pitchDecay" : 0.008,
	    "octaves" : 2,
	    "envelope" : {
	        "attack" : 0.0006,
	        "decay" : 0.5,
	        "sustain" : 0
	    }
	}).connect(feedbackDelay);
	conga.volume.value = -100;
	congaPart = new Tone.Sequence(function(time, pitch){
	    conga.triggerAttack(pitch, time, Math.random()*0.5 + 0.5);
	}, ["D1"], "2n").start(0);

	noise = new Tone.Noise("white").start();
	noise.volume.value = -50;
	//make an autofilter to shape the noise
	autoFilter = new Tone.AutoFilter({
		"frequency" : "7m", 
		"min" : 7000, 
		"max" : 17000
	}).connect(reverb);

	//connect the noise
	noise.connect(autoFilter);
	//start the autofilter LFO
	autoFilter.start()

	Tone.Transport.start("+0.1");
}


function update_current_notes(xx) {
	console.log(chords[xx]);
	currentNotes = chords[xx];
	currentColors = color_schemes[xx];
}

function init() {
	start_tone_stuff();
    var e = document.createElement("canvas");
    e = document.getElementById("canvas");
    console.log("init called ");
    e.width = 16;
    e.height = 16;
    camera = new THREE.OrthographicCamera( viewportWidth, viewportHeight, viewportWidth, viewportHeight, 1, 1000 );
    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;

    //camera.updateProjectionMatrix();
    // camera.left = window.innerWidth / - 2;
    // camera.right = window.innerWidth / 2;
    // camera.top = window.innerHeight / 2;
    // camera.bottom = window.innerHeight / - 2;
    camera.updateProjectionMatrix();
    scene = new THREE.Scene();
    scene.add(camera);
    renderer = new THREE.WebGLRenderer( {canvas: e,alpha: true, antialias:true} );
    var t = e.getContext("2d");
    e = document.getElementById("canvas");
    //  document.getElementById("mute-button").addEventListener("click", function(e) {
        
    //     muteSound();
        
    // });
    var l = document.getElementById("info")
      , h = document.getElementById("right")
      , g = document.getElementById("address");
    document.getElementById("info-button").addEventListener("click", function(e) {
        return e.preventDefault(),
        l.classList.toggle("hidden"),
        h.classList.toggle("hidden"),
        g.classList.toggle("hidden"),
        !1
    }),
    document.getElementById("close-button").addEventListener("click", function(e) {
        return e.preventDefault(),
        l.classList.toggle("hidden"),
        h.classList.toggle("hidden"),
        g.classList.toggle("hidden"),
        !1
    });
    for (var p = document.getElementById("address-info"), b = document.getElementsByClassName("address-button"), E = 0; E < b.length; E++)
        b[E].addEventListener("click", function(e) {
            return e.preventDefault(),
            p.classList.toggle("hidden"),
            !1
        });
    document.getElementById("close-address-button").addEventListener("click", function(e) {
        return e.preventDefault(),
        p.classList.toggle("hidden"),
        !1
    })
    window.addEventListener("resize", onWindowResize, !1);

//  else
//      renderer = new THREE.CanvasRenderer(); 
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    var renderPass = new THREE.RenderPass(scene, camera);
    composer = new THREE.EffectComposer(renderer);

    composer.addPass(renderPass);

    var bloomPass = new THREE.BloomPass(1,25,5,128);
    composer.addPass(bloomPass);
    bloomPass.clear = true;

    var effectFilm = new THREE.FilmPass(.5, .05, 128, false);
    effectFilm.renderToScreen = true;
    composer.addPass(effectFilm);
    // container = document.getElementById( 'container' );
    // container.appendChild( renderer.domElement );
    var mesh = new THREE.SphereGeometry(300,300,12);
	var vat2 = new THREE.MeshBasicMaterial();
	//vat2.blending = THREE.AdditiveBlending;
	sphere = new THREE.Mesh(mesh, vat2);
	sphere.material.opacity = 0;
	sphere.scale.x = 0.001;
	sphere.scale.y = 0.001;
	sphere.scale.z = 0.001;
    spotLight = new THREE.DirectionalLight( 0x0066f0 ),
    //ambientLight = new THREE.AmbientLight( 0x66f606 )
    cubes = new THREE.Object3D();
    // plane = new THREE.Mesh(
    //     new THREE.PlaneBufferGeometry( worldWidth * 2, worldHeight * 2, 1 ),
    //     new THREE.MeshBasicMaterial({
    //         color: 0x00ffff
    //     })
    // );
    // plane.rotation.z = 180;
    // plane.position.set( 0, 0, -10 );
    // plane.castShadow = false;
    // plane.recieveShadow = false;

    camera.position.set( 0, 0, 90 );
    camera.lookAt( scene.position );

    //spotLight.position.set( 1000, 10, 400 );
    //spotLight.intensity = .1;
    scene.add(sphere);
    scene.add( cubes );
    scene.add( spotLight );
    //scene.add( ambientLight );

    var ran = Math.floor(Math.random() * 50);

    check_for_new_content();
    render();

}

function trigger_light(x, hasPitch, scale) {
    var block_info = collectedBlocks[blockSeq][2][x];
    update_transaction_display(block_info);
    
    var ran_cube = cubes.children[ (cubes.children.length - 1) -  x];
    var justCol = block_info[2].slice(7, block_info[2].length);
    var new_col = interpret_cube_color(justCol);
    ran_cube.material.color.setHex( new_col);
    if (hasPitch){
        ran_cube.material.opacity= 1;
        tween1 = new TWEEN.Tween( ran_cube.material )
            .to( {opacity: 0 }, 12000 )
            .repeat( 0 )
            .easing( createStepFunction(64) )
            .start()
    } else {
        ran_cube.material.opacity= .1;
        tween1 = new TWEEN.Tween( ran_cube.material )
            .to( {opacity: 0 }, 12000 )
            .repeat( 0 )
            .easing(  createStepFunction(12)  )
            .start()
    }
}

function createStepFunction(numSteps) {
	return function(k) {
		return (Math.floor(k * numSteps) / numSteps);
	}
}

function interpret_amount_beat(val) {
	if (val < .25) {
		return "8n";
	} else if ((val >= .25) && (val < 1)) {
		return "4n";
	} else if ((val >= 1) && (val < 10)) {
		return "2n";
	} else if ((val >= 10) && (val < 100)) {
		return "1n";
	} else if ((val >= 100) && (val < 1000)) {
		return "2m";
	}else if ((val >= 1000)) {
		return "1m";
	}
}

function interpret_amount_vel(val) {
	if (val < .25) {
		return .3;
	} else if ((val >= .25) && (val < 1)) {
		return .4;
	} else if ((val >= 1) && (val < 10)) {
		return .5;
	} else if ((val >= 10) && (val < 100)) {
		return .65;
	} else if ((val >= 100) && (val < 1000)) {
		return .8;
	}else if ((val >= 1000)) {
		return .9;
	}
} 

function interpret_hash(hash) {
    //notes = ["A3", "Bb3", "C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5", "Eb5", "G5"]
    num_hash = hash.replace(/\D/g,'');
    num = mode(add(num_hash));
    return notes[num]
}

function interpret_amount_note(val){
	if (val < .25) {
		return currentNotes[currentNotes.length - 1];
	} else if ((val >= .25) && (val < 1)) {
		return currentNotes[currentNotes.length - 2];
	} else if ((val >= 1) && (val < 10)) {
		return currentNotes[currentNotes.length - 3];
	} else if ((val >= 10) && (val < 100)) {
		return currentNotes[currentNotes.length - 4];
	} else if ((val >= 100) && (val < 500)) {
		return currentNotes[currentNotes.length - 5];
	} else if ((val >= 500) && (val < 1000)) {
		return currentNotes[currentNotes.length - 6];
	}else if ((val >= 1000) && (val < 5000)) {
		return currentNotes[currentNotes.length - 7];
	}else if ((val >= 5000) && (val < 10000)) {
		return currentNotes[currentNotes.length - 8];
	}else if ((val >= 10000)) {
		return currentNotes[currentNotes.length - 9];
	}
}

function interpret_cube_color(val){
	if (val < .25) {
		return currentColors[0];
	} else if ((val >= .25) && (val < 1)) {
		return currentColors[1];
	} else if ((val >= 1) && (val < 10)) {
		return currentColors[2];
	} else if ((val >= 10) && (val < 100)) {
		return currentColors[3];
	} else if ((val >= 100) && (val < 500)) {
		return currentColors[4];
	} else if ((val >= 500) && (val < 1000)) {
		return currentColors[5];
	}else if ((val >= 1000) && (val < 5000)) {
		return currentColors[6];
	}else if ((val >= 5000) && (val < 10000)) {
		return currentColors[7];
	}else if ((val >= 10000)) {
		return currentColors[8];
	}
}

function interpret_amount_scale(val){
	if (val < .25) {
		return 1.1;
	} else if ((val >= .25) && (val < 1)) {
		return 3;
	} else if ((val >= 1) && (val < 50)) {
		return 9;
	} else if ((val >= 50) && (val < 1000)) {
		return 12;
	} else if ((val >= 1000)) {
		return 22;
	}
}

function write_to_dic(mel, beats, info, vel, scale) {
    arr = [];
    arr.push(mel);
    arr.push(beats);
    arr.push(info);
    arr.push(vel);
    arr.push(scale);
    collectedBlocks.push(arr);
}

function define_content(transactions, empty) {
    var newMelody = [];
    var newBeats = [];
    var newVelocity = [];
    var newScale = [];
    var transactionInfo = [];
    if (transactions.length > 127) {
        transactions.length = 127;
    } 
    if (empty) {
    	var one_info = [];
		one_info.push(this_tx.block_id);
        one_info.push(this_tx.hash);
        one_info.push("Empty block...");
        transactionInfo.push(one_info);
    } else {
    	for (var xx = 0; xx < transactions.length; xx++ ) {
	        var one_info = [];
	        this_tx = transactions[xx];
	        if (this_tx.recipient == 0xE6B1471020BD32E1Ad024771Ba4bEc405bc917f8) {
	        	Tone.Transport.scheduleOnce(trigger_special_notes, ("+1m"));
	        }
	        var amount = this_tx.amount / 1000000000000000000;
	        one_info.push(this_tx.block_id);
	        one_info.push(this_tx.hash);
	        one_info.push("AMOUNT: " + amount.toFixed(4));
	        transactionInfo.push(one_info);
	        if (amount == 0) {
	            newMelody.push('C7');
	            newBeats.push("4n");
	            newVelocity.push(0);
	            //newMelody.push(["4n", null]);
	        } else {
	            newBeats.push(interpret_amount_beat(amount));
	            //newMelody.push(interpret_hash(this_tx.hash));
	            newMelody.push(interpret_amount_note(amount));
	            console.log(interpret_amount_note(amount) + " , " + amount);
	            newVelocity.push(interpret_amount_vel(amount));
	            newScale.push(interpret_amount_scale(amount));
	        }
    	}
    }
    write_to_dic(newMelody, newBeats, transactionInfo, newVelocity, newScale);
}

function createGrid(content) {
	var framedWidth = (window.innerWidth) * .9; //frame amount
    var transaxx = content[0].length;
    var fixedWidthOfOneUnit = framedWidth / transaxx;
    if (fixedWidthOfOneUnit > 150) {
    	fixedWidthOfOneUnit = 150;
    }
    var totalWidth =  fixedWidthOfOneUnit * transaxx;
    //var offset = (framedWidth - totalWidth) / transaxx;
    var the_floor = ((totalWidth) * .5) - (fixedWidthOfOneUnit * .5); 

    var geometry = new THREE.BoxGeometry(fixedWidthOfOneUnit, window.innerHeight, 50);
    for (var x = transaxx - 1; x > -1; x--) { 
        material = new THREE.MeshBasicMaterial({
                    });
        material.color.setHex (0x00ffff);
        material.transparent = true;
        material.opacity = 0;
        var cube = new THREE.Mesh(geometry, material);
        //cube.scale.y = worldHeight;
        cube.scale.z = 1;
        cube.position.x = the_floor - (fixedWidthOfOneUnit * x);
        cube.position.y = 0;
        cube.position.z = cube.geometry.parameters.depth / 2 * cube.scale.z;
        cubes.add(cube);
    }
}


$(document).ready(function(){
	var $start = document.querySelector('#play_button');
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent)) {
		//init();
		$(".play_button").show();
		$(".play_button").click(function(){
			StartAudioContext(Tone.context, $start, () => { 
				$start.remove()
				console.debug('AUDIO READY') 
			})
			init();
		})
		console.log("mobile started");			
	} else {
		$(".play_button").hide();
		console.log(" is not mobile ");
		init();	
	}

});

function render() {
    var delta = clock.getDelta();
    renderer.clear();
    composer.render(delta);
    requestAnimationFrame( render );
    TWEEN.update();
}

function onWindowResize() {

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function get_data() {
    var url = "https://etherchain.org/api/blocks/count"

    var ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    ajax.send(null);
    ajax.onreadystatechange = function () {

         if (ajax.readyState == 4 && (ajax.status == 200)) {          
            var Data = JSON.parse(ajax.responseText);
            
            curBlockID = Data.data[0].count
            priorBlockID = curBlockID
            lastBlockPlayed = curBlockID - 1;
            get_first_block(curBlockID)
        } else {

        }
    }
}

get_data();

function get_first_block(block_num) {
    var url = "https://etherchain.org/api/block/" + block_num + "/tx"
    var ajax =new XMLHttpRequest()
    ajax.open("GET", url, true)
    ajax.send(null)
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && (ajax.status == 200)) {    
            var block = JSON.parse(ajax.responseText);
            if (block.data.length == 0) {
                get_first_block(block_num - 1);
            } else {
                define_content(block.data, false);
                priorBlockID = block_num;
                //priorBlockID = block_num
            }
        } else {        
        }
    }
}

function get_new_block(block_num) {
	//console.log(block_num);
    var url = "https://etherchain.org/api/block/" + block_num + "/tx"
    var ajax =new XMLHttpRequest()
    ajax.open("GET", url, true)
    ajax.send(null)
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && (ajax.status == 200)) {
                        
            var block = JSON.parse(ajax.responseText);
            if (block.data.length === 0) {
                define_content(block.data, true);
                //play empty block chord
                //change color or something
            } else {
                define_content(block.data, false);
                //priorBlockID = block_num
            }
        } else {         
        }
    }
}

function update_data() {
    var url = "https://etherchain.org/api/blocks/count";
    var ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    ajax.send(null);
    ajax.onreadystatechange = function () {
         if (ajax.readyState == 4 && (ajax.status == 200)) {
            var Data = JSON.parse(ajax.responseText);
            curBlockID = Data.data[0].count;
            if (curBlockID != priorBlockID) {
            	for (var bb = (curBlockID-priorBlockID) - 1; bb > -1; bb-- ) {
            		get_new_block(curBlockID - bb);	
            	}
				priorBlockID = curBlockID;
                //fill new block with transaction
            } 
        } 
    }
}


//setInterval(update_data(), delay)
var blockSeq = 0;
var xCount = 0;
function scheduleNext(){
    //play note
    if (xCount == 0 ) {
    	var col = new THREE.Color(currentColors[0]);
    	renderer.setClearColor(col, .25);
    }
	var n = collectedBlocks[blockSeq][0][xCount];
	var b = collectedBlocks[blockSeq][1][xCount];
	var v = collectedBlocks[blockSeq][3][xCount];
	var s = collectedBlocks[blockSeq][4][xCount];
	if (n !== "C7") {
		console.log(n, b, v);
		play_note(n,b,v);
		trigger_light(xCount, true,s); 
	} else {
		trigger_light(xCount, false, 1);
	}
	
	if (xCount  < collectedBlocks[blockSeq][0].length-1) {
		//schedule the next event relative to the current time by prefixing "+"
		Tone.Transport.scheduleOnce(scheduleNext, ("+" + b));
		xCount++;
	} else {
		blockSeq++;
		check_for_new_content();
	}
}

var newN = -1;
function countToTen() {
	newN++;
	if (newN >= chords.length) {
		newN = 0;
	}
}

function check_for_new_content() {
	if (collectedBlocks[blockSeq] !== undefined) {
		if (collectedBlocks[blockSeq][0].length > 0) {
			
			countToTen();
			update_current_notes(newN);
			xCount = 0;
			createGrid(collectedBlocks[blockSeq]);
			
			Tone.Transport.scheduleOnce(scheduleNext, ("+1m"));
		} else {
			update_transaction_display(collectedBlocks[blockSeq][2][0]);
			blockSeq++;	
			Tone.Transport.scheduleOnce(check_for_new_content, ("+1m"));
		}
	} else {
		Tone.Transport.scheduleOnce(check_for_new_content, ("+1m"));
	}
}

function play_note(n, b) {
	var note = new Tone.Event(function(b, pitch){
		synth.triggerAttackRelease(pitch, "4n", b, .5);
	}, n).start();
}

function create_melody() {
    interpret_hash(this_tx.hash);
}



setInterval(function() {
    update_data();
}, 30000);

var fade = false;
setInterval(function(){
	fade_drums();
}, 120000);


function fade_drums() {
	if (fade) {
		conga.volume.rampTo(-100, 4);
    } else {
    	conga.volume.rampTo(-20, 4);    
    }
    fade = !fade;
}

function update_transaction_display(block_info){
    document.getElementById("currentAmount").innerHTML = block_info[2];
    //document.getElementById("currentTransaction").innerHTML = "TRANSACTION ID: " + block_info[1];
    document.getElementById("currentBlock").innerHTML = "BLOCK: " + block_info[0];   
}


var mode = function mode(arr) {
    return arr.reduce(function(current, item) {
        var val = current.numMapping[item] = (current.numMapping[item] || 0) + 1;
        if (val > current.greatestFreq) {
            current.greatestFreq = val;
            current.mode = item;
        }
        return current;
    }, {mode: null, greatestFreq: -Infinity, numMapping: {}}, arr).mode;
};

function add(string) {
    string = string.split('');                 //split into individual characters
    var nums = [];                               //have a storage ready
    for (var i = 0; i < string.length; i++) {  //iterate through
        nums[i] =  parseInt(string[i],10);         //convert from string to int
    }
    return nums;                                //return when done
}

function SetToZero() {
	sphere.scale.x = 0.001;
	sphere.scale.y = 0.001;
	sphere.scale.z = 0.001;
	sphere.material.opacity = 0;
}


function trigger_special_notes () {
	var specialNote = new Tone.Event(function(time, pitch){
		specialSynth.triggerAttackRelease(pitch, "1m");
	}, currentNotes[7]).start();
	var specialNote2 = new Tone.Event(function(time, pitch) {
		specialSynth2.triggerAttackRelease(pitch, "1m");
	}, currentNotes[4]).start();
	sphere.material.opacity = .5;
	tween4 = new TWEEN.Tween( sphere.material )
            .to( {opacity: 0 }, 12000 )
            .repeat( 0 )
            .easing( createStepFunction(64) )
            .start()
	sphere.material.color.setHex(specialColors[Math.floor(Math.random() * specialColors.length)]);
    tween3 = new TWEEN.Tween( sphere.scale )
    .to( {x: 5, y: 5 }, 9000 )
    .repeat( 0 )
    .onComplete(SetToZero)
    .easing( createStepFunction(30) )
    .start()
}
