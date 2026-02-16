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

/**
 * RAYCASTING: handle 2D clicks on 3D buttons
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Don't allow interactions if power is out or game is over
  if (GameState.isPowerOut || GameState.isGameOver) return;

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
      updateButtonVisuals(leftLightButton, GameState.leftLightOn, CONFIG.COLORS.BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);

    } else if (btnId === 'right_light') {
      GameState.rightLightOn = !GameState.rightLightOn;
      updateButtonVisuals(rightLightButton, GameState.rightLightOn, CONFIG.COLORS.BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);
      
    } else if (btnId === 'left_door') {
      GameState.leftDoorClosed = !GameState.leftDoorClosed;
      updateButtonVisuals(leftDoorButton, GameState.leftDoorClosed, CONFIG.COLORS.DOOR_BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);

    } else if (btnId === 'right_door') {
      GameState.rightDoorClosed = !GameState.rightDoorClosed;
      updateButtonVisuals(rightDoorButton, GameState.rightDoorClosed, CONFIG.COLORS.DOOR_BUTTON_ON, CONFIG.COLORS.BUTTON_OFF);
      
    }
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