import * as THREE from 'three';
import { CONFIG } from './config';


export const scene = new THREE.Scene();

// Add basic ceiling light
export let ambientLight = new THREE.AmbientLight(CONFIG.COLORS.ON, 0.1);
export let ceilingLight = new THREE.PointLight(CONFIG.COLORS.ON, 25, 50);

ceilingLight.position.set(1, 4, 3); // Position light slightly above and in front of camera
ceilingLight.castShadow = true;
ceilingLight.shadow.bias = -0.001;

ceilingLight.shadow.mapSize.width = 2048;
ceilingLight.shadow.mapSize.height = 2048;
scene.add(ambientLight);
scene.add(ceilingLight);

// Add Camera
export const camera = new THREE.PerspectiveCamera(
  CONFIG.FOV, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000,
);
camera.position.set(0, 0, 5); //Move back camera to see doors

export const renderer = new THREE.WebGLRenderer({ antialias: true }); // Set up renderer w/ antialiasing for smoother edges
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// If window resizes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});