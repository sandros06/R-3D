

// Variables
var container;
var width, height;

var camera, scene, renderer, controls;
var cube;

var followCamMode = 0;
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
  camera.position.x = 0; 
  camera.position.y = 10;
  camera.position.z = 100;
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
	var material =   new THREE.MeshBasicMaterial({ color: 'yellow' });
	var cube = new THREE.Mesh( geometry, material ); 
  cube.position.x = 0;
  cube.position.y = 10;
  cube.position.z = 0;
	scene.add( cube );

  var cubeAxis = new THREE.AxisHelper(30);
  cube.add(cubeAxis);

  // Lights
  const pointLight = new THREE.PointLight(0xFFFFFF);
  //pointLight.position = new THREE.Vector3(10, 50, 100);
  scene.add(pointLight);

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
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);

}

initContainer();
animate();


function update() {

  if(followCamMode == 1)
  {
    // follow camera at each frame
    lookAt(cube.position);
  }
  else if (followCamMode == 2)
  {
    // follow came with latency
    var time = Date.now();

    if (time > previousTime + 1000) { // 1 seconds refresh rates
          lookAt(cube.position);
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
    cube.rotation.x = 2 * Math.PI * event.beta / 360;
    cube.rotation.y = 2 * Math.PI * event.gamma / 360;
    cube.rotation.z = 2 * Math.PI * event.alpha / 360;

    rotLines.x.append(new Date().getTime(), event.beta);
    rotLines.y.append(new Date().getTime(), event.gamma);
    rotLines.z.append(new Date().getTime(), event.alpha);
});


/* todo à déplacer */
var deltat = 0.1;
var vitesse = {};
vitesse.x = 0;
vitesse.y = 0;
vitesse.z = 0;

hub.on("deviceMotion", function (event) {
     //console.log(event)
     if(solutionNumber == 1){

         vitesse.x =  deltat*event.acceleration.x;
         vitesse.y = deltat*event.acceleration.y;
         vitesse.z = deltat*event.acceleration.z;
         cube.position.x = cube.position.x + deltat*vitesse.x;
         cube.position.y = cube.position.y + deltat*vitesse.y;
         cube.position.z = cube.position.z + deltat*vitesse.z;
     }
});

 
hub.on("deviceNipple", function (event) {
     //console.log(event)
     if(solutionNumber == 2){
         vitesse.x =   deltat*50*event.force*Math.cos(event.angleRad);
         vitesse.y =   deltat*50*event.force*Math.sin(event.angleRad);
         cube.position.x = cube.position.x + deltat*vitesse.x;
         cube.position.y = cube.position.y + deltat*vitesse.y;
         console.log(cube.position);
     }
});


/* TODO pour la solution 2 (voir 1) il faudrait que la position soit calculé en dehors de l'event 
soit dans une boucle infini (un event permanent)
car sinon l'objet ne bouge que quand l'event est call

ou alors il faut changer dans mobile_sol2.js l'emition que quand c'est en move mais tout le temps j'ai pas trouvé */

