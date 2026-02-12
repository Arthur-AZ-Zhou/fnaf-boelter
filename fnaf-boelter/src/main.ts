import './style.css';
import * as THREE from 'three';
import { scene, camera, renderer } from './scene';
import { leftDoor, rightDoor, leftSecurityDoor, rightSecurityDoor } from './office';
import './controls';
import { GameState } from './state';
import { CONFIG } from './config';


const camTarget = new THREE.Vector3(0, 0, -10);
const windowHalfX = window.innerWidth / 2;
let mouseX = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) / windowHalfX; // Calc mouse coords to see if we move
});

/**
 * Adds flickering effect to the office lights by randomly adjusting their color intensity
 * @returns base color for flicker
 */
function getFlickerColor(): THREE.Color {
  const baseColor = new THREE.Color(CONFIG.COLORS.ON);
  const noise = (Math.random() - 0.5) * CONFIG.FLICKER_INTENSITY;

  baseColor.r += noise; 
  baseColor.g += noise; 
  baseColor.b += noise;

  return baseColor;
}

/**
 * Helper to smooth move doors
 * @param door: door mesh to move
 * @param isClosed: whether the door should be closed or open
 */
function updateDoorPosition(door: THREE.Mesh, isClosed: boolean) {
  const closedY = -1;
  const openY = 7;
  const targetY = isClosed ? closedY : openY;
  
  // Lerp to move 10% of the way to the target per frame
  door.position.y += (targetY - door.position.y) * 0.1;
}

/**
 * MAIN GAME LOOP, handles rendering and office camera movement
 */
function animate() {
  requestAnimationFrame(animate);

  // Camera Movements
  camTarget.x += (mouseX * CONFIG.SENSITIVITY - camTarget.x) * CONFIG.CAMERA_SPEED;
  camera.lookAt(camTarget);

  const leftMat = leftDoor.material as THREE.MeshBasicMaterial;
  const rightMat = rightDoor.material as THREE.MeshBasicMaterial;

  if (GameState.leftLightOn) {
    leftMat.color = getFlickerColor();
  } else {
    leftMat.color.setHex(CONFIG.COLORS.OFF);
  };

  if (GameState.rightLightOn) {
    rightMat.color = getFlickerColor();
  } else {
    rightMat.color.setHex(CONFIG.COLORS.OFF);
  }

  updateDoorPosition(leftSecurityDoor, GameState.leftDoorClosed);
  updateDoorPosition(rightSecurityDoor, GameState.rightDoorClosed);

  renderer.render(scene, camera);
}

animate();

