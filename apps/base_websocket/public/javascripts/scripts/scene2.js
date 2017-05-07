// Variables
var container;
var width, height;

var camera, scene, mesh, controls, stats;

initContainer();
animate();

function initContainer(){
    // on initialise le moteur de rendu
    container = document.querySelector('#container');

    // si WebGL ne fonctionne pas sur votre navigateur vous pouvez utiliser le moteur de rendu Canvas à la place
    height = 600; //container.clientWidth;
    width = 800; //container.clientHeight;

    // Camera
    const VIEW_ANGLE = 50;
    const ASPECT = width / height;
    const NEAR = 1;
    const FAR = 10000;

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 0, 1000);

    
    // Scene
    scene = new THREE.Scene();
    scene.add(camera);

    // on créé la sphère et on lui applique une texture sous forme d’image
    var geometry = new THREE.SphereGeometry( 250, 32, 32 );
    var material = new THREE.MeshPhongMaterial();
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // Application des textures
    var textureLoader = new THREE.TextureLoader();
    var texture1 = textureLoader.load('/images/earthmap1k.jpg');
    texture1.minFilter = THREE.LinearFilter;
    var texture2 = textureLoader.load('/images/earthbump1k.jpg');
    texture2.minFilter = THREE.LinearFilter;
    var texture3 = textureLoader.load('/images/earthspec1k.jpg');
    texture3.minFilter = THREE.LinearFilter;

    material.map = texture1;
    material.bumpMap = texture2;
    material.bumpScale = 0.05;
    material.specularMap = texture3;
    material.specular = new THREE.Color('grey');
    

    // Lights
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set(0,10,50).normalize();
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
}

function animate(){
    // on appel la fonction animate() récursivement à chaque frame
    requestAnimationFrame( animate );
    // on fait tourner le cube sur l'axe y
    mesh.rotation.y += 1/32 * 0.2;
    // on effectue le rendu de la scène
    renderer.render( scene, camera );
}