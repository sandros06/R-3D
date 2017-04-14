

// Variables
var container;
var width, height;

var camera, scene, renderer, controls, stats;
var cube;

var followCamMode = 1;
var previousTime = Date.now();

var orientation = {
  counter: 0,
  betaDeg: 0,
  gammaDeg: 0,
  alphaDeg: 0
};

var motion = {
  counter: 0,
  acceleration: {
    x: 0,
    y: 0,
    z: 0
  },
  rotationRate: {
    betaDeg: 0,
    gammaDeg: 0,
    alphaDeg: 0
  },
  interval: 0
};

var nipple = {
  counter: 0,
  force: 0,
  angleRad: 0
};


// If no webGl detected
//if (!Detector.webgl) Detector.addGetWebGLMessage();

function initContainer() {

  // WebGL container
  container = document.querySelector('#container');
  height = 600; //container.clientWidth;
  width = 800; //container.clientHeight;

  // Camera
  const VIEW_ANGLE = 45;
  const ASPECT = width / height;
  const NEAR = 0.1;
  const FAR = 10000;

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set(0, 10, 100);
  camera.lookAt(0, 0, 0);

  // Scene
  scene = new THREE.Scene();
  scene.add(camera);

  // Grid
  const CUBE_SIDE = 10;
  const SIZE = 30, step = CUBE_SIDE / 2;
  var geometry = new THREE.Geometry();
  var material = new THREE.LineBasicMaterial({color: 'green'});

  for ( var i = - SIZE; i <= SIZE; i += step) {
    geometry.vertices.push(new THREE.Vector3( - SIZE, 0, i ));
    geometry.vertices.push(new THREE.Vector3( SIZE, 0, i ));

    geometry.vertices.push(new THREE.Vector3( i, 0, - SIZE ));
    geometry.vertices.push(new THREE.Vector3( i, 0, SIZE ));

    geometry.vertices.push(new THREE.Vector3( i, - SIZE, 0 ));
    geometry.vertices.push(new THREE.Vector3( i, SIZE, 0 ));

    geometry.vertices.push(new THREE.Vector3( - SIZE, i, 0 ));
    geometry.vertices.push(new THREE.Vector3( SIZE, i, 0 ));
  }

  var line = new THREE.Line( geometry, material, THREE.LinePieces );
  scene.add(line);

  // Cube
  //var geometry = new THREE.BoxGeometry( CUBE_SIDE, CUBE_SIDE, CUBE_SIDE );
  var geometry = new THREE.ConeBufferGeometry( 5, 10, 15 );
  var material = new THREE.MeshPhongMaterial( { 
    ambient: 0x050505, 
    color: 0x0033ff, 
    specular: 0x555555, 
    shininess: 30 } );  
  cube = new THREE.Mesh( geometry, material );
  cube.position.set(0, 10, 10);
	scene.add( cube );

  var cubeAxis = new THREE.AxisHelper(30);
  cube.add(cubeAxis);

  // Lights
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 20, 40 ).normalize();
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer(/*{
    alpha: true,
    antialias: true
  }*/);

  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Stat
  stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild( stats.domElement );

  // Event listener
  //window.addEventListener('resize', onWindowResize, false);
}

/*
function onWindowResize() {
  //width = container.clientWidth;
  //height = container.clientHeight;
  camera.updateProjectionMatrix();
  camera.aspect = width / height;
  renderer.setSize(width, height);
}
*/

function animate() {

  stats.begin();

	update();
  renderer.render(scene, camera);

	stats.end();

  requestAnimationFrame(animate);
}



function update() {
  // CAMERA
  if (followCamMode == 1)
  {
    // follow camera at each frame
    camera.lookAt(cube.position);
  }
  else if (followCamMode == 2)
  {
    // follow came with latency
    var time = Date.now();

    if (time > previousTime + 1000) { // 1 seconds refresh rates
      camera.lookAt(cube.position);
      previousTime = time;
    }
  }
  // else no follow camera

  // Recuperation des data moyennés 
  var result = getSensorData();

  // Graph
  rotLines.x.append(new Date().getTime(), result.motion.acceleration.x);
  rotLines.y.append(new Date().getTime(), result.motion.acceleration.y);
  rotLines.z.append(new Date().getTime(), result.motion.acceleration.z);
 
  // Motion and Orientation
  if (solutionNumber == 1) {

    if (orientation.counter != 0)
    {
      cube.rotation.x = 2 * Math.PI * result.orientation.betaDeg / 360;
      cube.rotation.y = 2 * Math.PI * result.orientation.gammaDeg / 360;
      cube.rotation.z = 2 * Math.PI * result.orientation.alphaDeg / 360;
    }
    
    if (motion.counter != 0)
    {
      cube.translateX(applyFiltre(result.motion.acceleration.x));
      cube.translateY(applyFiltre(result.motion.acceleration.y));
      cube.translateZ(applyFiltre(result.motion.acceleration.z));
    }
  }
  else if (solutionNumber == 2) {
    /* TODO Fusion capteur with kalman*/
    if (orientation.counter != 0)
    {
      cube.rotation.x = 2 * Math.PI * result.orientation.betaDeg / 360;
      cube.rotation.y = 2 * Math.PI * result.orientation.gammaDeg / 360;
      cube.rotation.z = 2 * Math.PI * result.orientation.alphaDeg / 360;
    }
    //NIPPLE
    if (nipple.counter != 0)
    {
      cube.translateX(result.nipple.force*Math.cos(result.nipple.angleRad));
      cube.translateY(result.nipple.force*Math.sin(result.nipple.angleRad));
    }
  }

  resetSensorData();
}


// Fait la moyenne des data sommé par le hub 
// TODO verif les divisions par 0 et enlevé en haut les if ici
function getSensorData()
{
  var result = { 
    motion : {
      acceleration : {
        x        : motion.acceleration.x / motion.counter,
        y        : motion.acceleration.y / motion.counter,
        z        : motion.acceleration.z / motion.counter      
      },
      rotationRate: {
        betaDeg  : motion.rotationRate.betaDeg / motion.counter,
        gammaDeg : motion.rotationRate.gammaDeg / motion.counter,
        alphaDeg : motion.rotationRate.alphaDeg / motion.counter
      },
      interval : motion.interval
    },
    orientation : {
      betaDeg  : orientation.betaDeg / orientation.counter,
      gammaDeg : orientation.gammaDeg/ orientation.counter,
      alphaDeg : orientation.alphaDeg/ orientation.counter
    },
    nipple : {
      force    : nipple.force    / nipple.counter,
      angleRad : nipple.angleRad / nipple.counter
    }
  };
  return result;          
}

function resetSensorData()
{
  motion.counter               = 0;
  motion.acceleration.x        = 0;
  motion.acceleration.y        = 0;
  motion.acceleration.z        = 0;
  motion.rotationRate.betaDeg  = 0;
  motion.rotationRate.gammaDeg = 0;
  motion.rotationRate.alphaDeg = 0;
  motion.interval              = 0;

  orientation.counter  = 0;
  orientation.betaDeg  = 0;
  orientation.gammaDeg = 0;
  orientation.alphaDeg = 0;

  nipple.counter  = 0;
  nipple.force    = 0;
  nipple.angleRad = 0;
}

/*
 *      GRAPH
 */

var graph = new SmoothieChart();

graph.streamTo(document.getElementById('graphCanvas'));

var rotLines = {
  x: new TimeSeries(),
  y: new TimeSeries(),
  z: new TimeSeries()
};

graph.addTimeSeries(rotLines.x, {strokeStyle: '#ff0000'});
graph.addTimeSeries(rotLines.y, {strokeStyle: '#00ff00'});
graph.addTimeSeries(rotLines.z, {strokeStyle: '#0000ff'});


/*
 *
 *      Filtre
 *
 */
var config_filtre = {};
config_filtre["current"] = "filtreBorne"
config_filtre["filtre_borne"] = {};
config_filtre["filtre_borne"]["inf"] = -2;
config_filtre["filtre_borne"]["sup"] = 2; // à priori égal
function filtreBorne(value){
  if(value > config_filtre["filtre_borne"]["sup"]){
    return value - config_filtre["filtre_borne"]["sup"];
  }else if(value < config_filtre["filtre_borne"]["inf"]){
    return value - config_filtre["filtre_borne"]["inf"];
  }else {
    return 0;
  }
}


function applyFiltre(value){
  if(config_filtre["current"]){
    return filtreBorne(value);
  }else{
    return value;
  }
}

/*
 *
 *      HUB
 *
 */

// Get the DOM element to attach to


var hub = io.connect(window.location.origin);
var solutionNumber = 0;

hub.on("solution", function (event)  {
    $(document).trigger("add-alerts", {
      message: "La solution "+event.number + " a été activé",
      priority: "info"
    });
    solutionNumber = event.number;
});



// Pour eviter la désync
function callMobile() {
    hub.emit("callMobile",{
      needSolution : true
    });
    console.log("No device detected");

if(solutionNumber == 0){
      setTimeout(callMobile, 6000);  
  }
}

if(solutionNumber == 0){  
  callMobile();
}
hub.on("pingScene", function (event)  {
  if(event.return){
    $(document).trigger("add-alerts", {
      message: "Connexion établi avec le mobile",
      priority: "info"
    });

    hub.emit("pingMobile", {
      msg : "ok"
    });
  }
});




hub.on("noSupported", function (event)  {
  $(document).trigger("add-alerts", {
    message: "Le navigateur ne supporte pas le capteur suivant "+event.type,
    priority: "error"
  });
});


hub.on("deviceMotion", function (event) {
  motion.counter               += 1;
  motion.acceleration.x        += event.acceleration.x;
  motion.acceleration.y        += event.acceleration.y;
  motion.acceleration.z        += event.acceleration.z;
  motion.rotationRate.betaDeg  += event.rotationRate.beta;
  motion.rotationRate.gammaDeg += event.rotationRate.gamma;
  motion.rotationRate.alphaDeg += event.rotationRate.alpha;
  motion.interval              += event.interval;
});

hub.on("deviceOrientation", function (event) {
  orientation.counter  += 1;
  orientation.betaDeg  += event.beta;
  orientation.gammaDeg += event.gamma;
  orientation.alphaDeg += event.alpha;
});



hub.on("deviceNipple", function (event) {
  nipple.counter  += 1;
  nipple.force    += event.force;
  nipple.angleRad += event.angleRad;
});



/*
 *
 *      START CODE
 *
 */
initContainer();
requestAnimationFrame(animate);
