import './style.css';
import * as THREE from 'three';
import { scene, camera, renderer, ambientLight, ceilingLight, lightPanelMat } from './core/scene';
import { leftSecurityDoor, rightSecurityDoor, doorMaterials, doorSprites, droplet } from './world/office';
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

let clock = new THREE.Clock();

let lastTime = clock.getElapsedTime();
let dropletVelocity = 0;
let secondsUntilNextDrop = 1;

let timeUntilFlickerOff = 1000;
let timeUntilFlickerOn = 100;
let isLightOn = true;

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

  // calculate droplet position
  const now = performance.now();
  const delta = (now - lastTime) / 1000; // seconds since last frame
  lastTime = now;

  secondsUntilNextDrop -= delta;
  if (secondsUntilNextDrop < 0) {
    droplet.position.y += dropletVelocity * delta; // 1.8 world units per second, always
    dropletVelocity -= 30 * delta;    // gravitational constant was to slow for the scale, 30 ended up being the most natural acceleration
    if (droplet.position.y < -5) {
      droplet.position.y = 4.5;
      dropletVelocity = 0;
      secondsUntilNextDrop = Math.random() * 8 + 1;
    }
  }

  const delta_ms = delta * 1000;

  // overhead lights flicker
  if (isLightOn){
    if (timeUntilFlickerOff > 0) {
      timeUntilFlickerOff -= delta_ms;
      if ((now / 5 ) % 2 == 0)
        ceilingLight.intensity = 35;
      else
        ceilingLight.intensity = 30;
    }
    else {
      ceilingLight.intensity = 10;
      isLightOn = false;
      timeUntilFlickerOn = Math.random() * 50 + 10;
    }
  }
  else {
    if (timeUntilFlickerOn > 0) {
      timeUntilFlickerOn -= delta_ms;
    }
    else {
      ceilingLight.intensity = 35;
      ambientLight.intensity = 0.2;
      ceilingLight.color.setHex(0xEEE8D5);
      lightPanelMat.color.setHex(0xb0ab9b);
      isLightOn = true;
      timeUntilFlickerOff = Math.random() * 5000 + 500;

      // small chance that light turns red
      if (Math.random() * 10 < 1) {
        ceilingLight.color.setHex(0xff0000);
        ceilingLight.intensity = 10;
        timeUntilFlickerOff = Math.random() * 50 + 100;
        ambientLight.intensity = 0;
        lightPanelMat.color.setHex(0x000000);
      }
    }
  }
  renderer.render(scene, camera);
}


initAISystem(); // Start animatronic movement logic
initPowerSystem(); // Start power drain logic
initTimeSystem(); // Start time progression and win condition logic
animate();