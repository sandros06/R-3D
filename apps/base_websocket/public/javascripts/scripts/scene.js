

// Variables
var container;
var width, height;

var camera, scene, renderer, controls;
var cube;

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
  camera.position = new THREE.Vector3(0, 0, 0);
  camera.lookAt(0, 0, -1);

  // Scene
  scene = new THREE.Scene();
  scene.add(camera);

  // Objects
  const CUBE_SIDE = 60;
  var geometry = new THREE.BoxGeometry( CUBE_SIDE, CUBE_SIDE, CUBE_SIDE );
	var material =   new THREE.MeshLambertMaterial({ color: 0xFDEE00 });
	var cube = new THREE.Mesh( geometry, material );

  cube.position.z = -300;
	scene.add( cube );

  var cubeAxis = new THREE.AxisHelper(80);
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
  // TODO
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

hub.on("deviceMotion", function (event) {
     //console.log(event)
});
