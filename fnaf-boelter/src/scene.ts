import * as THREE from 'three';
import { CONFIG } from './config';


export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
  CONFIG.FOV, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000,
);
camera.position.set(0, 0, 5); //Move back camera to see doors

export const renderer = new THREE.WebGLRenderer({ antialias: true }); // Set up renderer w/ antialiasing for smoother edges
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// If window resizes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});