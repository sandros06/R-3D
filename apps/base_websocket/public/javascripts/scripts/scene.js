

// Variables
var container;
var width, height;

var camera, scene, renderer, controls, stats;
var cube;

var followCamMode = 1;
var previousTime = Date.now();

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
  var geometry = new THREE.BoxGeometry( CUBE_SIDE, CUBE_SIDE, CUBE_SIDE );
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

initContainer();
requestAnimationFrame(animate);



function update() {

  if(followCamMode == 1)
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

hub.on("deviceOrientation", function (event) {
    if(solutionNumber == 1){
        cube.rotation.x = 2 * Math.PI * event.beta / 360;
        cube.rotation.y = 2 * Math.PI * event.gamma / 360;
        cube.rotation.z = 2 * Math.PI * event.alpha / 360;
    }else if(solutionNumber == 2){
        /* TODO Fusion capteur */
        cube.rotation.x = 2 * Math.PI * event.beta / 360;
        cube.rotation.y = 2 * Math.PI * event.gamma / 360;
        cube.rotation.z = 2 * Math.PI * event.alpha / 360;
    }

});


/* todo à déplacer */
var deltat = 0.01;
var vitesse = {};
var acceleration = {};

vitesse.x = 0;
vitesse.y = 0;
vitesse.z = 0;
acceleration.x = 0;
acceleration.y = 0;
acceleration.z = 0;


hub.on("deviceMotion", function (event) {

     if(solutionNumber == 1){
        deltat = event.interval/1000;
        acceleration.x = event.acceleration.x;
        acceleration.y = event.acceleration.y;
        acceleration.z = event.acceleration.z
     }

});


hub.on("deviceNipple", function (event) {
     if(solutionNumber == 2){
        /* todo add cube.rotation for move in 3d scene */
        acceleration.x =  event.force*Math.cos(event.angleRad);
        acceleration.y =  event.force*Math.sin(event.angleRad);
     }
});


function start() {
    /* euler integration */
    vitesse.x = vitesse.x  + deltat*acceleration.x;
    vitesse.y = vitesse.y  + deltat*acceleration.y;
    vitesse.z = vitesse.z  + deltat*acceleration.z;
    cube.position.x = cube.position.x + deltat*vitesse.x;
    cube.position.y = cube.position.y + deltat*vitesse.y;
    cube.position.z = cube.position.z + deltat*vitesse.z;     

    rotLines.x.append(new Date().getTime(), acceleration.x);
    rotLines.y.append(new Date().getTime(), acceleration.y);
    rotLines.z.append(new Date().getTime(), acceleration.z);

    setTimeout(start, deltat*1000);  
}

// boot up the first call
start();