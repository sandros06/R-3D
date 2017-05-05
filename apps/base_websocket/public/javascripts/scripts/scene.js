/*
 *
 *      SCENE
 *
 */

// Variables
var container;
var width, height;

var camera, scene, renderer, controls, stats;
var cone;

var followCamMode = 1;
var previousTime = Date.now();

// Kalman variable
var kalmanBeta = new Kalman();
kalmanBeta.setAngle(0); // Todo angle 
var kalmanGamma = new Kalman();
kalmanGamma.setAngle(0); // Todo angle 
var kalmanAlpha = new Kalman();
kalmanAlpha.setAngle(0); // Todo angle 

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


  const CONE_SIDE = 10;
  // Grid
  const SIZE = 30, step = CONE_SIDE / 2;

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
  

  // Plane
  /*
  var geometry = new THREE.PlaneGeometry( 50, 50 );
  var material = new THREE.MeshBasicMaterial( {
    color: 0xffff00, 
    side: THREE.DoubleSide
  } );

  var plane = new THREE.Mesh( geometry, material );
  plane.receiveShadow = true;

  scene.add( plane );
  */

  // Cone
  var geometry = new THREE.ConeBufferGeometry( CONE_SIDE / 2, CONE_SIDE, CONE_SIDE * 1.5 );
  var material = new THREE.MeshPhongMaterial( { 
    ambient: 0x050505, 
    color: 0x0033ff, 
    specular: 0x555555, 
    shininess: 30 } );  

  cone = new THREE.Mesh( geometry, material );
  cone.receiveShadow = true;
  cone.position.set(0, 10, 10);
	scene.add( cone );


  var coneAxis = new THREE.AxisHelper(30);
  cone.add(coneAxis);

  // Lights
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 10, 50 ).normalize();
  light.castShadow = true;
  //light.target = plane;
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer( {
    alpha: false,
    antialias: true
  } );

  renderer.receiveShadow = true;
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
    camera.lookAt(cone.position);
  }
  else if (followCamMode == 2)
  {
    // follow came with latency
    var time = Date.now();

    if (time > previousTime + 1000) { // 1 seconds refresh rates
      camera.lookAt(cone.position);
      previousTime = time;
    }
  }
  // else no follow camera

  // Recuperation des data moyennés 
  var result = getSensorData();
 
  // Motion and Orientation
  if (solutionNumber == 1) 
  {
      cone.rotation.x = 2 * Math.PI * result.orientation.betaDeg / 360 - (Math.PI/2);
      cone.rotation.y = 2 * Math.PI * result.orientation.gammaDeg / 360;
      cone.rotation.z = 2 * Math.PI * result.orientation.alphaDeg / 360;

      cone.translateX(applyFiltre(result.motion.acceleration.x));
      cone.translateY(applyFiltre(result.motion.acceleration.y));
      cone.translateZ(applyFiltre(result.motion.acceleration.z));
  } 
  else if (solutionNumber == 2) 
  {
    // TODO  à delete après que sa marche
    var tmpBetaDeg,tmpGammaDeg,tmpAlphaDeg = 0;
    var angle1 = 355;
    var angle2 = 5;
    if(result.orientation.betaDeg - 90 >= angle1 || result.orientation.betaDeg - 90 <= angle2){
      tmpBetaDeg = result.orientation.betaDeg - 90;
      kalmanBeta.setAngle(result.orientation.betaDeg - 90);
    }else{
      tmpBetaDeg = kalmanBeta.getAngle(result.orientation.betaDeg - 90);
    }
    if(result.orientation.gammaDeg >= angle1 || result.orientation.gammaDeg <= angle2){
      tmpGammaDeg =result.orientation.gammaDeg;
      kalmanGamma.setAngle(result.orientation.gammaDeg);
    }else{
      tmpGammaDeg =kalmanGamma.getAngle(result.orientation.gammaDeg);
    }
    if(result.orientation.alphaDeg >= angle1 || result.orientation.alphaDeg <= angle2){  
      tmpAlphaDeg =result.orientation.alphaDeg;
      kalmanAlpha.setAngle(result.orientation.alphaDeg);
    }else{
      tmpAlphaDeg =kalmanAlpha.getAngle(result.orientation.alphaDeg);
    }

    // GRAPH
    rotLines.x.append(new Date().getTime(), tmpAlphaDeg);
    rotLines.y.append(new Date().getTime(), result.orientation.alphaDeg);

    cone.rotation.x = 2 * Math.PI * tmpBetaDeg / 360;
    cone.rotation.y = 2 * Math.PI * tmpGammaDeg / 360;
    cone.rotation.z = 2 * Math.PI * tmpAlphaDeg / 360;

    //NIPPLE
    cone.translateX(result.nipple.force*Math.cos(result.nipple.angleRad));
    cone.translateY(result.nipple.force*Math.sin(result.nipple.angleRad));
  }

  resetSensorData();
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
 *      START CODE
 *
 */

initContainer();
requestAnimationFrame(animate);