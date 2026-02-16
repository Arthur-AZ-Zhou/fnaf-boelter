import './style.css';
import * as THREE from 'three';
import { scene, camera, renderer } from './core/scene';
import { leftSecurityDoor, rightSecurityDoor, doorMaterials, doorSprites } from './world/office';
import './systems/controls';
import { GameState } from './core/state';
import { CONFIG } from './core/config';
import { updateCameraSystem } from './systems/cameraSystem';
import { initAISystem } from './systems/aiSystem';
import { initPowerSystem } from './systems/powerSystem';
import { initTimeSystem } from './systems/timeSystem';


const camTarget = new THREE.Vector3(0, 0, -10);
const windowHalfX = window.innerWidth / 2;
let mouseX = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) / windowHalfX; // Calc mouse coords to see if we move
});

/**
 * Adds flickering effect to the office lights by randomly adjusting their color intensity
 * @return: base color for flicker
 */
function getFlickerColor(): THREE.Color {
  const baseColor = new THREE.Color(CONFIG.COLORS.LIGHT_ON);
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
function updateDoorPosition(door: THREE.Mesh, isClosed: boolean): void {
  const closedY = -1;
  const openY = 7;
  const targetY = isClosed ? closedY : openY;
  
  // Lerp to move 10% of the way to the target per frame
  door.position.y += (targetY - door.position.y) * 0.1;
}

/**
 * MAIN GAME LOOP, handles rendering and office camera movement
 */
function animate(): void {
  requestAnimationFrame(animate);

  // Camera Movements
  camTarget.x += (mouseX * CONFIG.SENSITIVITY - camTarget.x) * CONFIG.CAMERA_SPEED;
  camera.lookAt(camTarget);

  // Update Cameras
  updateCameraSystem(); // Handle monitor animation and static effect

  if (GameState.leftLightOn) {
    const flicker = getFlickerColor();
    const darkFlicker = flicker.clone().multiplyScalar(0.4);

    doorMaterials.leftBg.color = darkFlicker;
    doorMaterials.leftSprite.color = flicker;
    
    // Only shoe Carey if he is at door
    doorSprites.left.visible = (GameState.careyLocation === 'LEFT_DOOR');
  } else {
    doorMaterials.leftBg.color.setHex(CONFIG.COLORS.OFF);
    doorMaterials.leftSprite.color.setHex(CONFIG.COLORS.OFF);
    doorSprites.left.visible = false;
  };

  if (GameState.rightLightOn) {
    const flicker = getFlickerColor();
    const darkFlicker = flicker.clone().multiplyScalar(0.4);

    doorMaterials.rightBg.color = darkFlicker;
    doorMaterials.rightSprite.color = flicker;
    
    doorSprites.right.visible = (GameState.joeLocation === 'RIGHT_DOOR');
  } else {
    doorMaterials.rightBg.color.setHex(CONFIG.COLORS.OFF);
    doorMaterials.rightSprite.color.setHex(CONFIG.COLORS.OFF);
    doorSprites.right.visible = false;
  }

  updateDoorPosition(leftSecurityDoor, GameState.leftDoorClosed);
  updateDoorPosition(rightSecurityDoor, GameState.rightDoorClosed);

  renderer.render(scene, camera);
}


initAISystem(); // Start animatronic movement logic
initPowerSystem(); // Start power drain logic
initTimeSystem(); // Start time progression and win condition logic
animate();