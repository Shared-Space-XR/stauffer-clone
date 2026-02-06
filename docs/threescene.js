
import * as THREE from "https://cdn.jsdelivr.net/gh/mesquite-mocap/mesquite.cc@latest/build-static/three.module.js";
import Stats from "https://cdn.jsdelivr.net/gh/mesquite-mocap/mesquite.cc@latest/build-static/stats.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/gh/mesquite-mocap/mesquite.cc@latest/build-static/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/gh/mesquite-mocap/mesquite.cc/build/GLTFLoader.js";


// create the scene
scene = new THREE.Scene();
// create the camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3);
// create the renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
// add orbit controls
// Remove OrbitControls for first-person mouse look

// --- MOUSE LOOK ---
let isPointerLocked = false;
let yaw = 0;
// Request pointer lock on click
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});
// Listen for pointer lock changes
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});
// Mouse move to rotate player (yaw)
document.addEventListener('mousemove', (e) => {
  if (isPointerLocked) {
    yaw -= e.movementX * 0.002;
    player.rotation.y = yaw;
  }
});

// add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// --- PLAYER SETUP ---
const player = new THREE.Object3D();
player.position.set(0, 1.6, 0); // start at center, y=eye height
scene.add(player);

// Attach camera to player
player.add(camera);
camera.position.set(0, 0, 0); // camera at player origin


// Floor boundary: rectangle matching floor.glb
const FLOOR_WIDTH = 8; // x direction
const FLOOR_DEPTH = 44; // z direction
const FLOOR_MIN_X = -FLOOR_WIDTH / 2;
const FLOOR_MAX_X = FLOOR_WIDTH / 2;
const FLOOR_MIN_Z = -FLOOR_DEPTH / 2;
const FLOOR_MAX_Z = FLOOR_DEPTH / 2;
function isInsideFloorBoundary(x, z) {
  return (
    x >= FLOOR_MIN_X && x <= FLOOR_MAX_X &&
    z >= FLOOR_MIN_Z && z <= FLOOR_MAX_Z
  );
}


// --- VISUALIZE RECTANGULAR FLOOR BOUNDARY ---
function addFloorBoundary() {
  const boundaryGeometry = new THREE.BufferGeometry();
  const y = 0.01; // slightly above floor
  const vertices = [
    FLOOR_MIN_X, y, FLOOR_MIN_Z,
    FLOOR_MAX_X, y, FLOOR_MIN_Z,
    FLOOR_MAX_X, y, FLOOR_MAX_Z,
    FLOOR_MIN_X, y, FLOOR_MAX_Z,
    FLOOR_MIN_X, y, FLOOR_MIN_Z // close the loop
  ];
  boundaryGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const boundaryMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
  const boundaryLine = new THREE.Line(boundaryGeometry, boundaryMaterial);
  scene.add(boundaryLine);
}
addFloorBoundary();

// Movement state
const move = { forward: false, backward: false, left: false, right: false };
const moveSpeed = 0.2;
const turnSpeed = 0.04;

// Keyboard controls
function onKeyDown(e) {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': move.forward = true; break;
    case 'KeyS': case 'ArrowDown': move.backward = true; break;
    case 'KeyA': case 'ArrowLeft': move.left = true; break;
    case 'KeyD': case 'ArrowRight': move.right = true; break;
  }
}
function onKeyUp(e) {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': move.forward = false; break;
    case 'KeyS': case 'ArrowDown': move.backward = false; break;
    case 'KeyA': case 'ArrowLeft': move.left = false; break;
    case 'KeyD': case 'ArrowRight': move.right = false; break;
  }
}
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
// add directional light
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 1, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

 directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, -1, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);



 directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 1, -5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);


 directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, -1, -5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// load the floor file
const loader = new GLTFLoader();
loader.load(floorGLB, function (gltf) {
  const model = gltf.scene;
  model.scale.set(50, 50, 50);

  // rotate 90 degs in y
  model.rotation.y = Math.PI / 2;
  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
}, undefined, function (error) {
  console.error(error);
});

// load ceiling file
loader.load(ceilingGLB, function (gltf) {
  const model = gltf.scene;
  model.scale.set(28, 28, 28);

  model.rotation.y = Math.PI / 2;
  model.position.y = 7.5; 
  model.position.z = -12;
    model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
}, undefined, function (error) {
  console.error(error);
});


// load end0 file
loader.load(end0GLB, function (gltf) {
  const model = gltf.scene;
  model.scale.set(9, 9, 9);

 // model.rotation.y = Math.PI / 2;
  model.position.y = 2.5; 
  model.position.z = -25; 
  //model.rotation.z = Math.PI; // flip upside down
  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
}, undefined, function (error) {
  console.error(error);
});


// load end1 file
loader.load(end1GLB, function (gltf) {
  const model = gltf.scene;
  model.scale.set(8, 8, 8);

 // model.rotation.y = Math.PI / 2;
  model.position.y = 6; 
  model.position.z = 25; 
  //model.rotation.z = Math.PI; // flip upside down
  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
}, undefined, function (error) {
  console.error(error);
});


const clock = new THREE.Clock();

function updatePlayer(delta) {
  let moveStep = 0;
  if (move.forward) moveStep -= moveSpeed * delta * 60;
  if (move.backward) moveStep += moveSpeed * delta * 60;
  // Move forward/backward in facing direction
  if (moveStep !== 0) {
    const nextX = player.position.x + Math.sin(player.rotation.y) * moveStep;
    const nextZ = player.position.z + Math.cos(player.rotation.y) * moveStep;
    if (isInsideFloorBoundary(nextX, nextZ)) {
      player.position.x = nextX;
      player.position.z = nextZ;
    }
  }
  // Turn left/right
  if (move.left) player.rotation.y += turnSpeed * delta * 60;
  if (move.right) player.rotation.y -= turnSpeed * delta * 60;
}

function animate() {
  const delta = clock.getDelta();
  updatePlayer(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();




