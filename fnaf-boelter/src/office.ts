import * as THREE from 'three';
import { scene } from './scene';
import { CONFIG } from './config';


export const interactables: THREE.Object3D[] = []; // Array for raycasting interactable objects (shoot a ray from 2D mouse to 3D button)

/**
 * Helper function to create a doors on left and right side of office
 * @param x: X coords of the door
 * @param rotationY: Rotation about Y-axis in rad
 */
function createDoor(x: number, rotationY: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(4, 8);
  const mat = new THREE.MeshBasicMaterial({ 
    color: CONFIG.COLORS.OFF, // Doorway should be pitch black to start off
    side: THREE.DoubleSide,
  });
  const door = new THREE.Mesh(geo, mat);

  door.position.set(x, -1, 0);
  door.rotation.y = rotationY;
  scene.add(door);

  return door;
}

/**
 * Creates wall buttons for light toggling, adds to interactables for raycasting
 * @param x: X coords of button
 * @param z: Z coords of button
 * @param name: Name of button for state management
 * @returns: Created button mesh
 */
function createWallButton(x: number, z: number, name: string): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.5, 1, 0.2); // Rectangular button shape
  const mat = new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.BUTTON_OFF }); // Initially dark grey
  const btn = new THREE.Mesh(geo, mat);
  
  btn.position.set(x, -1.5, z + 0.5);
  
  // Rotate to face inward since 3D
  if (x < 0) {
    btn.rotation.y = Math.PI / 2;
  } else {
    btn.rotation.y = -Math.PI / 2;
  }

  btn.userData = { id: name, isActive: false }; // ID and status for raycasting
  interactables.push(btn);
  scene.add(btn);
  return btn;
}

const roomGeometry = new THREE.BoxGeometry(20, 10, 20);
const roomMaterial = new THREE.MeshBasicMaterial({ 
  color: CONFIG.COLORS.ROOM_MATERIAL, 
  side: THREE.BackSide // Renders texture on cube's inside
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);

scene.add(room);

export const leftDoor = createDoor(-9.9, Math.PI / 2); // 90 degree angle on left side
export const rightDoor = createDoor(9.9, -Math.PI / 2);
export const leftButton = createWallButton(-9.8, 2, 'left_light');
export const rightButton = createWallButton(9.8, 2, 'right_light');