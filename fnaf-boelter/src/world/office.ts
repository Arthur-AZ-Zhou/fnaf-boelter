import * as THREE from 'three';
import { scene } from '../core/scene';
import { CONFIG } from '../core/config';


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
 * Helper function to create security doors on left and right side of office that
 * close down when button is pressed, blocking the doorway.
 * @param x: X coords of the door
 * @param rotationY: Rotation about Y-axis in rad
 */
function createSecurityDoor(x: number, rotationY: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(4, 8, 0.5);
  const mat = new THREE.MeshStandardMaterial({ // Thick metal slab mat for door
    color: CONFIG.COLORS.CLOSED_DOOR,
    roughness: 0.7,
    metalness: 0.5
  });
  const door = new THREE.Mesh(geo, mat);

  door.position.set(x, 7, 0);
  door.rotation.y = rotationY;

  scene.add(door);
  return door;
}

/**
 * Creates wall buttons for light toggling, adds to interactables for raycasting
 * @param x: X coords of button
 * @param y: Y coords of button
 * @param z: Z coords of button
 * @param name: Name of button for state management
 * @param color: Color of button (on or off)
 * @returns: Created button mesh
 */
function createWallButton(x: number, y: number, z: number, name: string, color: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.5, 1, 0.2); // Rectangular button shape
  const mat = new THREE.MeshBasicMaterial({ color: color }); // Button should always start as OFF
  const btn = new THREE.Mesh(geo, mat);
  
  btn.position.set(x, y, z);
  
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

const roomGeometry = new THREE.BoxGeometry(20, 10, 17.5);
const roomMaterial = new THREE.MeshStandardMaterial({ 
  color: CONFIG.COLORS.ROOM_MATERIAL, 
  side: THREE.BackSide, // Renders texture on cube's inside
  roughness: 0.8,
  metalness: 0.1,
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);

scene.add(room);

export const leftDoor = createDoor(-9.9, Math.PI / 2); // 90 degree angle on left side
export const rightDoor = createDoor(9.9, -Math.PI / 2);
export const leftSecurityDoor = createSecurityDoor(-9.6, Math.PI / 2);
export const rightSecurityDoor = createSecurityDoor(9.6, -Math.PI / 2);

export const leftLightButton = createWallButton(-9.8, -1.5, 2.5, 'left_light', CONFIG.COLORS.BUTTON_OFF);
export const rightLightButton = createWallButton(9.8, -1.5, 2.5, 'right_light', CONFIG.COLORS.BUTTON_OFF);
export const leftDoorButton  = createWallButton(-9.8, 0, 2.5, 'left_door', CONFIG.COLORS.BUTTON_OFF);
export const rightDoorButton  = createWallButton(9.8, 0, 2.5, 'right_door', CONFIG.COLORS.BUTTON_OFF);