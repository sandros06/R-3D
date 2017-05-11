// Variables
var container;
var width, height;

var camera, scene, mesh, controls, stats, light;

initContainer();

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
    
    // Application des textures  
    var textureLoader = new THREE.TextureLoader();
    var texture1 = textureLoader.load('/images/earthmap1k.jpg');
    texture1.minFilter = THREE.LinearFilter;
    var texture2 = textureLoader.load('/images/earthbump1k.jpg');
    texture2.minFilter = THREE.LinearFilter;
    var texture3 = textureLoader.load('/images/earthspec1k.jpg');
    texture3.minFilter = THREE.LinearFilter;
    var texture_stars = textureLoader.load('images/galaxy_starfield.png');
    texture_stars.minFilter = THREE.LinearFilter;
    var texture_cloud = textureLoader.load('images/fair_clouds_8k.jpg');
    texture_cloud.minFilter = THREE.LinearFilter;


    // on créé la sphère pour la terre
    var geometry_earth = new THREE.SphereGeometry( 200, 32, 32 );
    var material_earth = new THREE.MeshPhongMaterial({
        map : texture1,
        bumpMap : texture2,
        bumpScale : 0.5,
        specularMap : texture3,
        specular : new THREE.Color('grey')
    });
    mesh_earth = new THREE.Mesh( geometry_earth, material_earth);
    scene.add( mesh_earth );


    // Mise en place des étoiles
    var geometry_stars  = new THREE.SphereGeometry( 650, 32, 32);
    // create the material, using a texture of startfield
    var material_stars  = new THREE.MeshBasicMaterial({
        map : texture_stars,
        side : THREE.BackSide
    });
    // create the mesh based on geometry and material
    var mesh_stars  = new THREE.Mesh(geometry_stars, material_stars);
    scene.add( mesh_stars );

    // Mise en place des nuages
    /*
    var geometry_cloud = new THREE.SphereGeometry( 203, 32, 32);
    var material_cloud  = new THREE.MeshPhongMaterial({
        map : texture_cloud,
        transparent : true,
        opacity : 0.5
    });
    var mesh_cloud  = new THREE.Mesh(geometry_cloud, material_cloud);
    scene.add( mesh_cloud );
    */

    // Lights
    light = new THREE.AmbientLight(0xffffff);
    //light = new THREE.DirectionalLight(0xffffff, 1);

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

    control = new function () {
        this.rotSpeed = 0.005;
        this.scale = 1;
    };
    addControls(control);
    // call the render function
    render();
}

function addControls(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'rotSpeed', -0.1, 0.1);
}


function render() {
    renderer.render(scene, camera);

    // on fait tourner le cube sur l'axe y
    //mesh.rotation.y += 1/32 * 0.2;

    var x = camera.position.x;
    var z = camera.position.z;

    camera.position.x = x * Math.cos(control.rotSpeed) + z * Math.sin(control.rotSpeed);
    camera.position.z = z * Math.cos(control.rotSpeed) - x * Math.sin(control.rotSpeed);

    light.position.x = - x * Math.cos(control.rotSpeed) + z * Math.sin(control.rotSpeed);
    light.position.z = z * Math.cos(control.rotSpeed) - x * Math.sin(control.rotSpeed);
    
    camera.lookAt(scene.position);
    requestAnimationFrame(render);
}

