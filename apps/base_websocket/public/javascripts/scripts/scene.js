 /*
 *
 *      SCENE
 *      from https://aerotwist.com/tutorials/getting-started-with-three-js/
 */


// Set the scene size.
const WIDTH = 800;
const HEIGHT = 600;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Get the DOM element to attach to
const container =
    document.querySelector('#container');



// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer(/*{ alpha: true, antialias: true  }*/);
//renderer.setClearColor(0xffffff, 0);
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

const scene = new THREE.Scene();

// Add the camera to the scene.
scene.add(camera);

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);


// Set up the plane vars
//const PLANE_W = 50;
//const PLANE_H = 20;
const CUBE_SIDE = 60;

// Create a new mesh with
// plane geometry - we will cover
// create the plane's material

//const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000, side: THREE.DoubleSide });
//const plane = new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), planeMaterial);
const meshMaterial = new THREE.MeshLambertMaterial({ color: 0xFDEE00 });
const cube = new THREE.Mesh(new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE), meshMaterial);

// Move the Sphere back in Z so we
// can see it.
cube.position.z = -300;

// Finally, add the sphere to the scene.
scene.add(cube);
var cubeAxis = new THREE.AxisHelper(80);
cube.add(cubeAxis);



// create a point light
const pointLight = new THREE.PointLight(0xFFFFFF);

// set its position
//pointLight.position.x = 10;
//pointLight.position.y = 50;
//pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);


function update() {
    // Draw!
    renderer.render(scene, camera);

    // Schedule the next frame.
    requestAnimationFrame(update);
}

// Schedule the first frame.
requestAnimationFrame(update);


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
