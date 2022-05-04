import * as THREE from 'three';
import { DDSLoader } from '/threejs/jsm/loaders/DDSLoader.js';
import { MTLLoader } from '/threejs/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '/threejs/jsm/loaders/OBJLoader.js';

const width = 640;
const height = 480;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild( renderer.domElement );

camera.position.z = 5;

var object, texture, objectLoaded = false;


function animate() {
    requestAnimationFrame(animate);

    if(objectLoaded) {
        object.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
};

function onProgress(xhr){}
function onError(){}

var manager = new THREE.LoadingManager();
manager.addHandler(/\.dds$/i, new DDSLoader());

var light = new THREE.HemisphereLight(0xffffff, 0x000000);
light.position.set(0, 50, 0);
scene.add(light);

new MTLLoader(manager)
.setPath("model/")
.load("rio.mtl", function(materials){

    materials.preload();

    new OBJLoader(manager)
    .setMaterials(materials)
    .setPath("model/")
    .load("rio.obj", function(obj){

        object = obj;
        object.scale.x = 0.03;
        object.scale.y = 0.03;
        object.scale.z = 0.03;

        object.position.y = -1;

        scene.add(object);
        objectLoaded = true;
    });
});

animate();