import * as THREE from 'three';
import { camera } from './scene';
import { interactables, leftButton, rightButton } from './office';
import { GameState } from './state';
import { CONFIG } from './config';

/**
 * Helper function to update button color based on state (green for ON, grey for OFF)
 * @param mesh: button mesh to update
 * @param isOn: whether the button is active or not
 */
function updateButtonVisuals(mesh: THREE.Mesh, isOn: boolean) {
  const mat = mesh.material as THREE.MeshBasicMaterial;
  mat.color.setHex(isOn ? CONFIG.COLORS.BUTTON_ON : CONFIG.COLORS.BUTTON_OFF);
}

/**
 * RAYCASTING: handle 2D clicks on 3D buttons
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
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
      updateButtonVisuals(leftButton, GameState.leftLightOn);

    } else if (btnId === 'right_light') {
      GameState.rightLightOn = !GameState.rightLightOn;
      updateButtonVisuals(rightButton, GameState.rightLightOn);
    }
  }
});

const camButton = document.getElementById('cam-button') as HTMLButtonElement;

/**
 * Toggle monitor state and updates UI
 */
function toggleMonitorState(): void {
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