/*
 *
 *      SCENE
 *
 */


// Variables
var container;
var width, height;

var camera, scene, renderer, controls, stats;
var objectToMove, cone = null, mesh_earth = null, skyBox = null;
var light = null, line = null;

var kalmanActivated = false, notchFilter = false;

var followCamMode = 0;
var sceneMode = 1 // 1 = cone // 2 = earth 
var previousTime = Date.now();
// Menu variables

var kalmanActivation = true;

function toggleKalman() {
  if(kalmanActivation){
    kalmanActivation = false;
  }else{
    kalmanActivation = true;
  }
}


// Kalman variable
var kalmanBeta = new Kalman();
kalmanBeta.setAngle(0); // Todo angle 
var kalmanGamma = new Kalman();
kalmanGamma.setAngle(0); // Todo angle 
var kalmanAlpha = new Kalman();
kalmanAlpha.setAngle(0); // Todo angle 

// If no webGl detected
//if (!Detector.webgl) Detector.addGetWebGLMessage();

function initEarth() {
  
    // Application des textures 
    var textureLoader = new THREE.TextureLoader();

    var geometry_earth = new THREE.SphereGeometry( 20, 32, 32 );
    var material_earth = new THREE.MeshPhongMaterial();

    material_earth.map = textureLoader.load('/images/earthmap1k.jpg');

    material_earth.bumpMap = textureLoader.load('/images/earthbump1k.jpg');
    material_earth.scale = 0.5; // between 0 and 1

    material_earth.shininess = 25;
    material_earth.specularMap = textureLoader.load('/images/earthspec1k.jpg');
    material_earth.specular = new THREE.Color(0x2f2f2f);

    mesh_earth = new THREE.Mesh( geometry_earth, material_earth);
    scene.add( mesh_earth );

    // Mise en place des nuages
    /*
    var geometry_cloud = new THREE.SphereGeometry( 20, 32, 32);

    var cloudMap = textureLoader.load('./images/earthcloudmap.jpg');
    var cloudAlpha = textureLoader.load('./images/earthcloudmaptrans.jpg');

    console.log( "5" );

    var material_cloud  = new THREE.MeshPhongMaterial({
        map		: cloudMap,
        side        : THREE.DoubleSide,
        opacity     : 0.8,
        transparent : true,
        depthWrite  : false
    });

    var mesh_cloud  = new THREE.Mesh(geometry_cloud, material_cloud);
    mesh_earth.add( mesh_cloud );
    */


    //Etoiles cube
    var imagePrefix = "/images/starfield_";
    var directions  = ["rt", "lf", "up", "dn", "ft", "bk"];
    var imageSuffix = ".jpg";
    var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
    
    var materialArray = [];
    for (var i = 0; i < 6; i++)
    {
      var texture_stars = textureLoader.load(imagePrefix + directions[i] + imageSuffix);
      texture_stars.minFilter = THREE.LinearFilter;

      materialArray.push( new THREE.MeshBasicMaterial({
        map: texture_stars,
        side: THREE.BackSide
      }));
    }
      
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );


    // Lights
    if (light !== null) {
      scene.remove(light);
    }

    if (line !== null) {
      scene.remove(line);
    }

    if (cone !== null) {
      scene.remove(cone);
    }

    ambLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambLight);

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50,100,50).normalize();
    light.castShadow = true;
    scene.add(light);

    camera.lookAt( 0,0,0);
    objectToMove = camera;
}

function initCone () {
  // --> cone
  camera.lookAt(0, 0, 0);

  // Grid
  const CONE_SIDE = 10;
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

  line = new THREE.Line( geometry, material, THREE.LinePieces );
  scene.add(line);

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

  coneAxis = new THREE.AxisHelper(30);
  cone.add(coneAxis);

  // Lights
  if (light !== null) {
    scene.remove(light);
  }

  if (mesh_earth !== null) {
    scene.remove(mesh_earth);
  }

  if (skyBox !== null) {
      scene.remove(skyBox);
    }

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 10, 50 ).normalize();
  light.castShadow = true;
  scene.add(light);

  objectToMove = cone;
}

function resetPosition(){
  if(sceneMode == 1){
    objectToMove.position.set(0,10,10);
    camera.position.set(0, 10, 100);
  }else if(sceneMode == 2){
    objectToMove.position.set(0,10,100);
  }else{
    objectToMove.position.set(0,10,10);
  }
}

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

  // Scene
  scene = new THREE.Scene();
  scene.add(camera);

  // TESTSTTETSTST
  //initEarth();
  initCone();

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
  stats.domElement.style.position   = 'absolute'
  stats.domElement.style.left  = '0px'
  stats.domElement.style.bottom    = '0px'
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
  if (followCamMode == 1 && objectToMove == cone)
  {
    // follow camera at each frame
    camera.lookAt(cone.position);
  }
  else if (followCamMode == 2 && objectToMove == cone)
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
      objectToMove.rotation.x = 2 * Math.PI * result.orientation.betaDeg / 360 - (Math.PI/2);
      objectToMove.rotation.y = 2 * Math.PI * result.orientation.gammaDeg / 360;
      objectToMove.rotation.z = 2 * Math.PI * result.orientation.alphaDeg / 360;

      // GRAPH
      rotLines.x.append(new Date().getTime(), result.orientation.alphaDeg);
      rotLines.y.append(new Date().getTime(), result.orientation.betaDeg);
      rotLines.z.append(new Date().getTime(), result.orientation.gammaDeg);

      var tmpAccX,tmpAccY,tmpAccZ;
      if( notchFilter )
      {
        tmpAccX = applyFiltre(result.motion.acceleration.x);
        tmpAccY = applyFiltre(result.motion.acceleration.y);
        tmpAccZ = applyFiltre(result.motion.acceleration.z);
      }
      else
      {
        tmpAccX = result.motion.acceleration.x;
        tmpAccY = result.motion.acceleration.y;
        tmpAccZ = result.motion.acceleration.z;
      }


      objectToMove.translateX(tmpAccX);
      objectToMove.translateY(tmpAccY);
      objectToMove.translateZ(tmpAccZ);
      // GRAPH
      accLines.x.append(new Date().getTime(), tmpAccX);
      accLines.y.append(new Date().getTime(), tmpAccY);
      accLines.z.append(new Date().getTime(), tmpAccZ);


  } 
  else if (solutionNumber == 2) 
  {
    if( kalmanActivated )
    {
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

      objectToMove.rotation.x = 2 * Math.PI * tmpBetaDeg / 360;
      objectToMove.rotation.y = 2 * Math.PI * tmpGammaDeg / 360;
      objectToMove.rotation.z = 2 * Math.PI * tmpAlphaDeg / 360;
        // GRAPH
      rotLines.x.append(new Date().getTime(), tmpAlphaDeg);
      rotLines.y.append(new Date().getTime(), result.orientation.alphaDeg);
    }
    else 
    {
      objectToMove.rotation.x = 2 * Math.PI * result.orientation.betaDeg / 360;
      objectToMove.rotation.y = 2 * Math.PI * result.orientation.gammaDeg / 360;
      objectToMove.rotation.z = 2 * Math.PI * result.orientation.alphaDeg / 360;
      // GRAPH
      rotLines.x.append(new Date().getTime(), result.orientation.alphaDeg);
      rotLines.y.append(new Date().getTime(), result.orientation.betaDeg);
      rotLines.z.append(new Date().getTime(), result.orientation.gammaDeg);

    }

    

    //NIPPLE
    objectToMove.translateX(result.nipple.force*Math.cos(result.nipple.angleRad));
    objectToMove.translateY(result.nipple.force*Math.sin(result.nipple.angleRad));
    // GRAPH
    accLines.x.append(new Date().getTime(), result.nipple.force*Math.cos(result.nipple.angleRad));
    accLines.y.append(new Date().getTime(), result.nipple.force*Math.sin(result.nipple.angleRad));

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


var graph2 = new SmoothieChart();

graph2.streamTo(document.getElementById('graphCanvas2'));

var accLines = {
  x: new TimeSeries(),
  y: new TimeSeries(),
  z: new TimeSeries()
};

graph2.addTimeSeries(accLines.x, {strokeStyle: '#ff0000'});
graph2.addTimeSeries(accLines.y, {strokeStyle: '#00ff00'});
graph2.addTimeSeries(accLines.z, {strokeStyle: '#0000ff'});

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
 * MENU
 * 
 */
window.setInterval(function(){
    if (solutionNumber == 1){
      $('#kalmanCheck').hide();
      $('#notchFilterCheck').show();
    } else if (solutionNumber == 2){
      $('#kalmanCheck').show();
      $('#notchFilterCheck').hide();
    } else {
      $('#kalmanCheck').hide();
      $('#notchFilterCheck').hide();
    }
}, 100);

$('#kalman').click(function() {
    if (this.checked) {
        kalmanActivated = true;
    } else {
        kalmanActivated = false;
    }
});

$('#notchFilter').click(function() {
    if (this.checked) {
        notchFilter = true;
    } else {
        notchFilter = false;
    }
});

$('#fixe').change(function() {
    if (this.checked) {
        followCamMode = 0;
    }
});

$('#mobile').change(function() {
    if (this.checked) {
        followCamMode = 1;
    }
});

$('#semi-mobile').change(function() {
    if (this.checked) {
        followCamMode = 2;
    }
});

$('#cone').change(function() {
    if (this.checked) {
        sceneMode = 1;
        initCone();
    }
});

$('#earth').change(function() {
    if (this.checked) {
        sceneMode = 2;
        initEarth();
    }
});



$('#reset').on('click', function(event) {
  resetPosition();
});
/*
 *
 *      START CODE
 *
 */

initContainer();
requestAnimationFrame(animate);