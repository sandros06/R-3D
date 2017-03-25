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
const meshMaterial = new THREE.MeshLambertMaterial({ color: 0x2C75FF });
const cube = new THREE.Mesh(new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE), meshMaterial);

// Move the Sphere back in Z so we
// can see it.
cube.position.z = -300;

// Finally, add the sphere to the scene.
scene.add(cube);

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
 *
 *      HUB
 *
 */

var hub = io.connect(window.location.origin);
hub.on("deviceOrientation", function (event) {
    cube.rotation.x = 2 * Math.PI * event.beta / 360;
    cube.rotation.y = 2 * Math.PI * event.gamma / 360;
    cube.rotation.z = 2 * Math.PI * event.alpha / 360;
})
hub.on("deviceMotion", function (event) {
    //console.log(event)
})