import * as THREE from 'three';
import './style.css';

/**
 * CONFIG: constants for settings
 */
const CONFIG = {
  FOV: 75,
  CAMERA_SPEED: 0.05,
  SENSITIVITY: 15
};

/**
 * SCENE SETUP: set office and camera basics
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * OFFICE ASSETS: feel free to add more
 */
const roomGeometry = new THREE.BoxGeometry(20, 10, 20);
const roomMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x444444, 
  side: THREE.BackSide // Renders texture on cube's inside
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);

scene.add(room);

/**
 * Helper function to create a doors on left and right side of office
 * @param x: X coords of the door
 * @param rotationY: Rotation about Y-axis in rad
 */
function createDoor(x: number, rotationY: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(4, 8);
  const mat = new THREE.MeshBasicMaterial({ 
    color: 0x111111, 
    side: THREE.DoubleSide,
  });
  const door = new THREE.Mesh(geo, mat);

  door.position.set(x, -1, 0);
  door.rotation.y = rotationY;
  return door;
}

const leftDoor = createDoor(-9.9, Math.PI / 2); // 90 degree angle on left side
const rightDoor = createDoor(9.9, -Math.PI / 2);

scene.add(leftDoor);
scene.add(rightDoor);

/**
 * STATE LOGIC: handle states regarding cameras/lights/doors
 */
let isMonitorUp = false;
const camButton = document.getElementById('cam-button') as HTMLButtonElement;

/**
 * Toggle monitor state and updates UI
 */
function toggleMonitorState(): void {
  isMonitorUp = !isMonitorUp;
  
  if (isMonitorUp) {
    camButton.innerText = "CLOSE MONITOR";
    camButton.style.backgroundColor = "rgba(150, 0, 0, 0.8)"; 
    camButton.style.borderColor = "red";
  } else {
    camButton.innerText = "OPEN MONITOR";
    camButton.style.backgroundColor = ""; 
    camButton.style.borderColor = "";
  }
}

camButton.addEventListener('click', toggleMonitorState); // Event listener for the camera

/**
 * ANIMATION LOOP: scroll and look around office
 */
const camTarget = new THREE.Vector3(0, 0, -10);
const windowHalfX = window.innerWidth / 2;
let mouseX = 0;

camera.position.set(0, 0, 5); // Move camera back so to see doors

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) / windowHalfX; // Calc mouse coords to see if we move
});

/**
 * MAIN GAME LOOP, handles rendering and office camera movement
 */
function animate() {
  requestAnimationFrame(animate);
  camTarget.x += (mouseX * CONFIG.SENSITIVITY - camTarget.x) * CONFIG.CAMERA_SPEED;
  
  camera.lookAt(camTarget);
  renderer.render(scene, camera);
}

animate();

// If window resizes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});