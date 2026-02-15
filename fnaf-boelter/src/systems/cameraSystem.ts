import { GameState } from '../core/state';


const cameras = [
  { id: 'CAM_01', label: 'CAM 01: MAIN HALL', top: '60px', left: '170px' },
  { id: 'CAM_02', label: 'CAM 02: CS LAB', top: '65px', left: '55px' },
  { id: 'CAM_03', label: 'CAM 03: SUPPLY CLOSET', top: '55px', left: '275px' },
  { id: 'CAM_04', label: 'CAM 04: WEST CORRIDOR', top: '150px', left: '115px' },
  { id: 'CAM_05', label: 'CAM 05: EAST CORRIDOR', top: '150px', left: '220px' },
  { id: 'CAM_06', label: 'CAM 06: VENDING MACHINES', top: '225px', left: '100px' },
  { id: 'CAM_07', label: 'CAM 07: ELEVATORS', top: '30px', left: '80px' },
  { id: 'CAM_08', label: 'CAM 08: SERVER ROOM', top: '110px', left: '280px' },
  { id: 'CAM_09', label: 'CAM 09: RESTROOMS', top: '220px', left: '250px' },
  { id: 'CAM_10', label: 'CAM 10: OUTSIDE', top: '10px', left: '210px' },
];

const monitorContainer = document.createElement('div');
const staticCanvas = document.createElement('canvas');
const camLabel = document.createElement('div');
const mapContainer = document.createElement('div');

monitorContainer.id = 'monitor-layer';
staticCanvas.id = 'static-canvas';
camLabel.id = 'camera-label';
mapContainer.id = 'camera-map';

document.body.appendChild(monitorContainer);

const ctx = staticCanvas.getContext('2d')!;
const camButtons: HTMLButtonElement[] = [];

/**
 * Creates the minimap of rooms itself
 */
function createMapVisuals(): void {
  const rooms = [
    { class: 'room-main' },
    { class: 'room-lab' },
    { class: 'room-closet' },
    { class: 'room-hall-left' },
    { class: 'room-hall-right' },
    { class: 'room-vending' },
    { class: 'room-office-entry' },
    { class: 'room-elevators' },
    { class: 'room-server' },
    { class: 'room-restroom' },
  ];

  const connectors = [
    { class: 'h-main-lab' }, 
    { class: 'h-main-closet' }, 
    { class: 'h-vending-entry' },
    { class: 'h-hall-to-restroom' },
    { class: 'h-restroom-to-you' },
    { class: 'v-main-halls' }, 
    { class: 'v-elevators-lab' }, 
    { class: 'v-outside-main' },
    { class: 'v-server-closet' },
    { class: 'v-hall-to-restroom' },
    { class: 'v-restroom-to-you' },
  ];

  connectors.forEach(c => { // Draw connectors first so they are under rooms
    const div = document.createElement('div');
    div.className = `map-connector ${c.class}`;
    mapContainer.appendChild(div);
  });

  rooms.forEach(r => { // Draw rooms on top of connectors
    const div = document.createElement('div');
    div.className = `map-room ${r.class}`;
    mapContainer.appendChild(div);
  });

  // Generate "YOU" marker
  const you = document.createElement('div');
  you.id = 'map-you';
  you.innerText = 'YOU';
  mapContainer.appendChild(you);
}

createMapVisuals();

/**
 * Creates a clickable camera button and places it on the map
 * @param cam: camera data object containing id, position, and label
 */
function createCameraButton(cam: { id: string, top: string, left: string }): void {
  const btn = document.createElement('button');
  btn.className = 'room-btn';
  btn.id = `btn-${cam.id}`;
  btn.innerText = cam.id;
  
  btn.style.top = cam.top;
  btn.style.left = cam.left;

  btn.onclick = () => {
    GameState.currentCamera = cam.id;
    updateUI();
  };

  mapContainer.appendChild(btn);
  camButtons.push(btn);
}

cameras.forEach(createCameraButton);

/**
 * Room jpg mappings
 */
const cameraDisplay = document.createElement('img');
cameraDisplay.id = 'camera-view-img';
monitorContainer.appendChild(cameraDisplay);

const careySprite = document.createElement('img');
careySprite.className = 'animatronic-sprite';
monitorContainer.appendChild(careySprite);

const joeSprite = document.createElement('img');
joeSprite.className = 'animatronic-sprite';
monitorContainer.appendChild(joeSprite);

monitorContainer.appendChild(staticCanvas);
monitorContainer.appendChild(camLabel);
monitorContainer.appendChild(mapContainer);

const cameraImages: Record<string, string> = {
  'CAM_01': '/rooms/main_hall.jpg',
  'CAM_02': '/rooms/cs_lab.jpg',
  'CAM_03': '/rooms/supply_closet.jpg',
  'CAM_04': '/rooms/west_corridor.jpg',
  'CAM_05': '/rooms/east_corridor.jpg',
  'CAM_06': '/rooms/vending.jpg',
  'CAM_07': '/rooms/elevators.jpg',
  'CAM_08': '/rooms/server_room.jpg',
  'CAM_09': '/rooms/restrooms.jpg',
  'CAM_10': '/rooms/outside.jpg',
};

type SpriteConfig = { width: string, top: string, left: string };

// Map out coords where Carey and Joe stand in each cam
const spritePositions: Record<string, { carey?: SpriteConfig, joe?: SpriteConfig }> = {
  // SHARED ROOMS =====
  'CAM_10': { // OUTSIDE
    carey: { width: '50%', top: '20%', left: '6%' },
    joe:   { width: '50%', top: '-1.5%', left: '56%' },
  },
  'CAM_01': { // MAIN HALL
    carey: { width: '9%', top: '7.5%', left: '80%' },
    joe:   { width: '15%', top: '12%', left: '30%' },
  },

  // CAREY PATH =====
  'CAM_07': { // ELEVATORS
    carey: { width: '70%', top: '45%', left: '0%' },
  },
  'CAM_02': { // CS LAB
    carey: { width: '50%', top: '60%', left: '20%' },
  },
  'CAM_04': { // WEST CORRIDOR
    carey: { width: '100%', top: '10%', left: '-15%' },
  },
  'CAM_06': { // VENDING MACHINES
    carey: { width: '100%', top: '10%', left: '-25%' },
  },

  // JOE PATH =====
  'CAM_08': { // SERVER ROOM
    joe: { width: '80%', top: '40%', left: '40%' },
  },
  'CAM_03': { // SUPPLY CLOSET
    joe: { width: '55%', top: '30%', left: '20%' },
  },
  'CAM_05': { // EAST CORRIDOR
    joe: { width: '20%', top: '35%', left: '39%' }, 
  },
  'CAM_09': { // RESTROOMS
    joe: { width: '80%', top: '20%', left: '40%' },
  }
};

/**
 * Function to apply custom coordinates
 * @param sprite: the HTMLImageElement of the animatronic sprite to position
 * @param config: the SpriteConfig containing width, top, and left values
 */
function applySpriteStyle(sprite: HTMLImageElement, config?: SpriteConfig): void {
  if (config) {
    sprite.style.width = config.width;
    sprite.style.top = config.top;
    sprite.style.left = config.left;
  } else { // random default values if forgot to set for a cam
    sprite.style.width = '30%';
    sprite.style.top = '35%';
    sprite.style.left = '35%';
  }
}

/**
 * Updates the text label, active buttons, background image, AND DYNAMIC SPRITES
 */
export function updateUI(): void {
  const activeCam = cameras.find(c => c.id === GameState.currentCamera);
  camLabel.innerText = activeCam ? activeCam.label : '';

  const imagePath = cameraImages[GameState.currentCamera];
  if (imagePath) {
    cameraDisplay.src = imagePath;

    // Static Glitch Effect (hides image loading pop)
    staticCanvas.style.opacity = "1.0";
    setTimeout(() => { staticCanvas.style.opacity = "0.15" }, 80);
  }

  const formattedCamId = GameState.currentCamera.replace('_', '').toLowerCase();
  const currentPositions = spritePositions[GameState.currentCamera];

  if (GameState.careyLocation === GameState.currentCamera) {
    careySprite.src = `/sprites/carey_${formattedCamId}.png`;
    applySpriteStyle(careySprite, currentPositions?.carey);
    careySprite.style.display = 'block';

  } else {
    careySprite.style.display = 'none';
  }

  if (GameState.joeLocation === GameState.currentCamera) {
    joeSprite.src = `/sprites/joe_${formattedCamId}.png`;
    applySpriteStyle(joeSprite, currentPositions?.joe);
    joeSprite.style.display = 'block';

  } else {
    joeSprite.style.display = 'none';
  }

  camButtons.forEach(btn => {
    if (btn.innerText === GameState.currentCamera) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

updateUI();

/**
 * Resize canvas to fit screen (low res for performance & retro look)
 */
function resizeStatic(): void {
  staticCanvas.width = 320;
  staticCanvas.height = 240;
}

resizeStatic();
window.addEventListener('resize', resizeStatic);

/**
 * Generates random white/black noise on the canvas
 */
function drawStatic(): void {
  const w = staticCanvas.width;
  const h = staticCanvas.height;
    
  // Create empty image buffer
  const idata = ctx.createImageData(w, h);
  const buffer32 = new Uint32Array(idata.data.buffer);
  const len = buffer32.length;

  for (let i = 0; i < len; i++) {
    if (Math.random() < 0.5) {
      buffer32[i] = 0xff000000; // Black
    } else {
      buffer32[i] = 0xffffffff; // White
    }
  }

  ctx.putImageData(idata, 0, 0);
}

/**
 * MAIN UPDATE FUNCTION, called every frame by main.ts
 */
export function updateCameraSystem(): void {
  if (GameState.isMonitorUp) {
    monitorContainer.style.transform = "translateY(0)"; // Slide up  monitor
    drawStatic();
  } else {
    monitorContainer.style.transform = "translateY(100%)"; // Slide dowm monitor
  }
}