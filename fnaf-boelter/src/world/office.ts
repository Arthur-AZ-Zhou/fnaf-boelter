import * as THREE from 'three';
import { scene } from '../core/scene';
import { CONFIG } from '../core/config';


export const interactables: THREE.Object3D[] = []; // Array for raycasting interactable objects (shoot a ray from 2D mouse to 3D button)

// Load textures for office doors and hallways for lights
const textureLoader = new THREE.TextureLoader();
const leftHallTex = textureLoader.load('/rooms/left_hall_door.jpg');
const rightHallTex = textureLoader.load('/rooms/right_hall_door.jpg');
const careyDoorTex = textureLoader.load('/sprites/carey_leftdoor.png');
const joeDoorTex = textureLoader.load('/sprites/joe_rightdoor.png');

export const doorMaterials = {
  leftBg: new THREE.MeshBasicMaterial({ map: leftHallTex, color: CONFIG.COLORS.OFF }),
  rightBg: new THREE.MeshBasicMaterial({ map: rightHallTex, color: CONFIG.COLORS.OFF }),
  leftSprite: new THREE.MeshBasicMaterial({ map: careyDoorTex, color: CONFIG.COLORS.OFF, transparent: true }),
  rightSprite: new THREE.MeshBasicMaterial({ map: joeDoorTex, color: CONFIG.COLORS.OFF, transparent: true })
};

export const doorSprites = {
  left: new THREE.Mesh(new THREE.PlaneGeometry(7, 11), doorMaterials.leftSprite),
  right: new THREE.Mesh(new THREE.PlaneGeometry(7, 11), doorMaterials.rightSprite)
};

/**
 * Helper function to create a doors on left and right side of office
 * @param x: X coords of the door
 * @param rotationY: Rotation about Y-axis in rad
 * @param side: 'left' or 'right' for carey and joe respectively
 * @return: Group containing both the hallway background and animatronic sprite, so they can be toggled together when light is turned on
 */
function createDoor(x: number, rotationY: number, side: 'left' | 'right'): THREE.Group {
  const group = new THREE.Group();
  
  group.position.set(x, -1, 0);
  group.rotation.y = rotationY;

  const bgGeo = new THREE.PlaneGeometry(4, 8);
  const bgMat = side === 'left' ? doorMaterials.leftBg : doorMaterials.rightBg;
  const bgMesh = new THREE.Mesh(bgGeo, bgMat);
  group.add(bgMesh);

  const spriteMesh = side === 'left' ? doorSprites.left : doorSprites.right;
  spriteMesh.position.z = 0.05; 

  group.add(spriteMesh);
  scene.add(group);
  return group;
}

/**
 * Helper function to create security doors on left and right side of office that
 * close down when button is pressed, blocking the doorway.
 * @param x: X coords of the door
 * @param rotationY: Rotation about Y-axis in rad
 * @return: Created door mesh
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
 * @return: Created button mesh
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

// No need to export leftDoor and rightDoor as they are now part of the doorSprites object, which is exported for animation in camera system
const leftDoor = createDoor(-9.9, Math.PI / 2, 'left'); // 90 degree angle on left side
const rightDoor = createDoor(9.9, -Math.PI / 2, 'right');
export const leftSecurityDoor = createSecurityDoor(-9.6, Math.PI / 2);
export const rightSecurityDoor = createSecurityDoor(9.6, -Math.PI / 2);

export const leftLightButton = createWallButton(-9.8, -1.5, 2.5, 'left_light', CONFIG.COLORS.BUTTON_OFF);
export const rightLightButton = createWallButton(9.8, -1.5, 2.5, 'right_light', CONFIG.COLORS.BUTTON_OFF);
export const leftDoorButton  = createWallButton(-9.8, 0, 2.5, 'left_door', CONFIG.COLORS.BUTTON_OFF);
export const rightDoorButton  = createWallButton(9.8, 0, 2.5, 'right_door', CONFIG.COLORS.BUTTON_OFF);