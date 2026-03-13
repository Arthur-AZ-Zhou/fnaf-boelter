import * as THREE from 'three';
import { scene } from '../core/scene';
import { CONFIG } from '../core/config';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export const interactables: THREE.Object3D[] = []; // Array for raycasting interactable objects (shoot a ray from 2D mouse to 3D button)

function loadModel(path: string, position: THREE.Vector3, scale: THREE.Vector3, 
  rotationDegrees = new THREE.Vector3(0, 0, 0), isSolid = false): Promise<THREE.Group> {
  return new Promise((resolve) => {
export const solidObjects: THREE.Object3D[] = [];

  loader.load(path, (gltf) => {
    const model = gltf.scene;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    model.position.copy(position);
    model.scale.copy(scale);
    model.rotation.set(
      THREE.MathUtils.degToRad(rotationDegrees.x),
      THREE.MathUtils.degToRad(rotationDegrees.y),
      THREE.MathUtils.degToRad(rotationDegrees.z)
    );

    scene.add(model);
      resolve(model);
    });
  });
}

    if (isSolid) {
      solidObjects.push(model);
    }
  });
}

loadModel('/models/desk.glb',
  new THREE.Vector3(0, -5, -7),
  new THREE.Vector3(5, 4.5, 4.5),
  new THREE.Vector3(0, 0, 0),
  true
);

export const computer = await loadModel('/models/pc.glb',
  new THREE.Vector3(0, -1.1, -7),
  new THREE.Vector3(1.5, 1.5, 1.5),
  new THREE.Vector3(0, 0, 0),
  true
);

loadModel('/models/filing_cabinet.glb',
  new THREE.Vector3(6.5, -3.1, -7),
  new THREE.Vector3(2, 2, 2),
  new THREE.Vector3(0, 0, 0),
  true
);

loadModel('/models/pipes.glb',
  new THREE.Vector3(0, 4.5, -7.5),
  new THREE.Vector3(1.7, 1.7, 1.7)
);

loadModel('/models/chair.glb',
  new THREE.Vector3(.3, -4.2, -5.2),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, 95, 0),
  true
);

loadModel('/models/chair.glb',
  new THREE.Vector3(-8, -4.2, -4.2),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, -20, 0)
);

loadModel('/models/chair.glb',
  new THREE.Vector3(-8, -4.2, 6.2),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, 8, 0)
);

loadModel('/models/chair.glb',
  new THREE.Vector3(-7.9, -3.9, 6.1),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, 9, 0)
);

loadModel('/models/chair.glb',
  new THREE.Vector3(-7.6, -3.5, 5.9),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(2, 15, 2)
);

loadModel('/models/whiteboard.glb',
  new THREE.Vector3(3, -1.55, 6.2),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(0, 8, 0)
);

loadModel('/models/clock.glb',
  new THREE.Vector3(-4.6, 2.7, -8.8),
  new THREE.Vector3(2, 2, 2),
  new THREE.Vector3(0, 0, 0)
);

export const hour_hand = await loadModel('/models/hour_hand.glb',
  new THREE.Vector3(-4.6, 2.7, -8.8),
  new THREE.Vector3(2, 2, 2),
  new THREE.Vector3(0, 0, 0)
);

export const minute_hand = await loadModel('/models/minute_hand.glb',
  new THREE.Vector3(-4.6, 2.7, -8.8),
  new THREE.Vector3(2, 2, 2),
  new THREE.Vector3(0, 0, 0)
);


// Load textures for office doors and hallways for lights
const textureLoader = new THREE.TextureLoader();
const leftHallTex = textureLoader.load('/rooms/left_hall_door.jpg');
const rightHallTex = textureLoader.load('/rooms/right_hall_door.jpg');
const careyDoorTex = textureLoader.load('/sprites/carey_leftdoor.png');
const joeDoorTex = textureLoader.load('/sprites/joe_rightdoor.png');

export const doorMaterials = {
  leftBg: new THREE.MeshBasicMaterial({ map: leftHallTex, color: CONFIG.COLORS.CLOSED_DOOR }),
  rightBg: new THREE.MeshBasicMaterial({ map: rightHallTex, color: CONFIG.COLORS.CLOSED_DOOR }),
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

const wallMaterial = new THREE.MeshStandardMaterial({
  color: CONFIG.COLORS.ROOM_MATERIAL,
  side: THREE.BackSide,
  roughness: 0.8,
  metalness: 0.1
});

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x292e2b,
  side: THREE.BackSide
});

function loadTiledTexture(path: string) {
  const tex = textureLoader.load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

// we got the ceiling texture from https://ambientcg.com/view?id=OfficeCeiling001
const ceilingMaterial = new THREE.MeshStandardMaterial({
  color:  0x777777,  // add base color to make the ceiling texture a little darker
  map:              loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_Color.jpg'),
  aoMap:            loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_AmbientOcclusion.jpg'),
  displacementMap:  loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_Displacement.jpg'),
  metalnessMap:     loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_Metalness.jpg'),
  normalMap:        loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_NormalGL.jpg'), // use NormalGL for Three.js, not NormalDX
  roughnessMap:     loadTiledTexture('/textures/ceiling/OfficeCeiling001_1K-JPG_Roughness.jpg'),
  
  normalMapType:    THREE.TangentSpaceNormalMap,
  displacementScale: 0.05, // keep low or ceiling will look lumpy
  side:             THREE.BackSide,
});


const materials = [
  wallMaterial,
  wallMaterial,
  ceilingMaterial,
  floorMaterial,
  wallMaterial,
  wallMaterial
];

const roomGeometry = new THREE.BoxGeometry(20, 10, 24);
const room = new THREE.Mesh(roomGeometry, materials);
room.receiveShadow = true;


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



// Water droplet particle system
const dropletGeometry = new THREE.SphereGeometry(0.1, 5, 5);
const dropletMaterial = new THREE.MeshPhongMaterial({ color: 0x5673ba, specular: 1, refractionRatio: 0.8 });

export const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
droplet.position.set(-8, 4.3, -7.5); // start at ceiling
scene.add(droplet);

// added an extra droplet model to stay at the starting point of the moving droplet
export const static_droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
static_droplet.position.set(-8, 4.2, -7.5); // start at ceiling
scene.add(static_droplet);

export const droplet2 = new THREE.Mesh(dropletGeometry, dropletMaterial);
droplet2.position.set(-7, 4.25, -7.6); // start at ceiling
scene.add(droplet2);

export const static_droplet2 = new THREE.Mesh(dropletGeometry, dropletMaterial);
static_droplet2.position.set(-7, 4.25, -7.6); // start at ceiling
scene.add(static_droplet2);