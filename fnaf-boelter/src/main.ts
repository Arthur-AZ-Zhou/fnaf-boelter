import './style.css';
import * as THREE from 'three';
import { scene, camera, renderer } from './scene';
import { leftDoor, rightDoor } from './office';
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

  renderer.render(scene, camera);
}

animate();

