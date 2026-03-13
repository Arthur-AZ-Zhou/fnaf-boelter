import * as THREE from 'three';
import { camera } from '../core/scene';
import { interactables, leftLightButton, rightLightButton, leftDoorButton, rightDoorButton } from '../world/office';
import { GameState } from '../core/state';
import { CONFIG } from '../core/config';

/**
 * Helper function to update button color based on state (green for ON, grey for OFF)
 * @param mesh: button mesh to update
 * @param isOn: whether the button is active or not
 * @param colorOn: color when active
 * @param colorOff: color when inactive
 */
function updateButtonVisuals(mesh: THREE.Mesh, isOn: boolean, colorOn: number, colorOff: number): void {
  const mat = mesh.material as THREE.MeshBasicMaterial;
  mat.color.setHex(isOn ? colorOn : colorOff);
}

function syncDoorLightButtonVisuals(): void {
  updateButtonVisuals(leftDoorButton, GameState.leftDoorClosed, CONFIG.COLORS.DOOR_BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);
  updateButtonVisuals(rightDoorButton, GameState.rightDoorClosed, CONFIG.COLORS.DOOR_BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);
  updateButtonVisuals(leftLightButton, GameState.leftLightOn, CONFIG.COLORS.BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);
  updateButtonVisuals(rightLightButton, GameState.rightLightOn, CONFIG.COLORS.BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);

  leftDoorBtn.classList.toggle('active-door', GameState.leftDoorClosed);
  rightDoorBtn.classList.toggle('active-door', GameState.rightDoorClosed);
  leftLightBtn.classList.toggle('active-light', GameState.leftLightOn);
  rightLightBtn.classList.toggle('active-light', GameState.rightLightOn);

  const disabled = guard();
  leftDoorBtn.disabled = disabled;
  rightDoorBtn.disabled = disabled;
  leftLightBtn.disabled = disabled;
  rightLightBtn.disabled = disabled;
}

/**
 * RAYCASTING: handle 2D clicks on 3D buttons
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Don't allow interactions if power is out or game is over
  if (GameState.isPowerOut || GameState.isGameOver || GameState.isMonitorUp) return;

  // Must convert mouse position to Normalized Device Coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera); // Cast ray from camera through mouse pos
  const intersects = raycaster.intersectObjects(interactables);

  if (0 < intersects.length) {
    const hitObject = intersects[0].object as THREE.Mesh;
    const btnId = hitObject.userData.id;

    if (btnId === 'left_light') {
      GameState.leftLightOn = !GameState.leftLightOn;

    } else if (btnId === 'right_light') {
      GameState.rightLightOn = !GameState.rightLightOn;
      
    } else if (btnId === 'left_door') {
      GameState.leftDoorClosed = !GameState.leftDoorClosed;

    } else if (btnId === 'right_door') {
      GameState.rightDoorClosed = !GameState.rightDoorClosed;
      
    }

    syncDoorLightButtonVisuals();
  }
});

const camButton = document.getElementById('cam-button') as HTMLButtonElement;

/**
 * Toggle monitor state and updates UI
 */
function toggleMonitorState(): void {
  // Don't allow interactions if power is out or game is over
  if (GameState.isPowerOut || GameState.isGameOver) return;

  GameState.isMonitorUp = !GameState.isMonitorUp;
  
  if (GameState.isMonitorUp) {
    camButton.innerText = "CLOSE MONITOR";
    camButton.style.backgroundColor = "rgba(150, 0, 0, 0.8)"; 
    camButton.style.borderColor = "red";
  } else {
    camButton.innerText = "OPEN MONITOR";
    camButton.style.backgroundColor = ""; 
    camButton.style.borderColor = "";
  }
}

camButton.addEventListener('click', toggleMonitorState);

// ── HTML side-panel door / light buttons ─────────────────────────────────────
const leftDoorBtn  = document.getElementById('left-door-btn')  as HTMLButtonElement;
const leftLightBtn = document.getElementById('left-light-btn') as HTMLButtonElement;
const rightDoorBtn  = document.getElementById('right-door-btn')  as HTMLButtonElement;
const rightLightBtn = document.getElementById('right-light-btn') as HTMLButtonElement;

function guard(): boolean {
  return GameState.isPowerOut || GameState.isGameOver || GameState.isMonitorUp;
}

leftDoorBtn.addEventListener('click', () => {
  if (guard()) return;
  GameState.leftDoorClosed = !GameState.leftDoorClosed;
  syncDoorLightButtonVisuals();
});

leftLightBtn.addEventListener('click', () => {
  if (guard()) return;
  GameState.leftLightOn = !GameState.leftLightOn;
  syncDoorLightButtonVisuals();
});

rightDoorBtn.addEventListener('click', () => {
  if (guard()) return;
  GameState.rightDoorClosed = !GameState.rightDoorClosed;
  syncDoorLightButtonVisuals();
});

rightLightBtn.addEventListener('click', () => {
  if (guard()) return;
  GameState.rightLightOn = !GameState.rightLightOn;
  syncDoorLightButtonVisuals();
});

// Initialize to match current GameState at startup.
syncDoorLightButtonVisuals();

export function syncControlButtonUI(): void {
  syncDoorLightButtonVisuals();
}