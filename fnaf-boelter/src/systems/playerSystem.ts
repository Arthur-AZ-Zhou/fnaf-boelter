import * as THREE from 'three';
import { scene, camera } from '../core/scene';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { solidObjects } from '../world/office';


 //Player class - creates a human character body that can move with keyboard controls
export class Player {
  public position: THREE.Vector3;
  private facing = Math.PI;
  private targetFacing = Math.PI;
  private groundY = -4.7;
  private body: THREE.Group;
  private idleModel: THREE.Group | null = null;
  private moveSpeed = 0.15;
  private collisionRadius = 0.45;
  private tempColliderBox = new THREE.Box3();
  private keys: { [key: string]: boolean } = {};
  private prevKeys: { [key: string]: boolean } = {};
  private mixer: THREE.AnimationMixer | null = null;
  private actions: { [name: string]: THREE.AnimationAction } = {};
  private clock: THREE.Clock = new THREE.Clock();

  constructor(startPosition: THREE.Vector3 = new THREE.Vector3(0, -4.7, 0)) {
    this.position = startPosition.clone();
    this.body = new THREE.Group();
    this.loadModels();
    this.setupKeyboardControls();
  }

  private loadModels(): void {
    const loader = new GLTFLoader();

    const setup = (model: THREE.Group) => {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      model.position.copy(this.position);
      scene.add(model);
    };

    loader.load('/models/idle.glb', (gltf) => {
      this.idleModel = gltf.scene;
      setup(this.idleModel);
      this.idleModel.rotation.y = Math.PI;
      this.idleModel.scale.set(2.0, 2.0, 2.0);
      this.body = this.idleModel;

      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.body);
        gltf.animations.forEach((clip) => {
          const filteredTracks = clip.tracks.filter(t => !t.name.toLowerCase().includes('.position'));
          const cleanClip = new THREE.AnimationClip(clip.name, clip.duration, filteredTracks);
          const action = this.mixer!.clipAction(cleanClip);
          this.actions[clip.name] = action;
          action.play();
        });
        this.mixer.update(0.5);
        this.mixer.timeScale = 0;
      }
    });
  }

  private setupKeyboardControls(): void {
    const keys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'KeyW', 'ShiftLeft'];

    window.addEventListener('keydown', (e) => {
      if (keys.includes(e.code)) this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      if (keys.includes(e.code)) this.keys[e.code] = false;
    });
  }

  private normalizeAngle(angle: number): number {
    let normalized = angle;
    while (normalized < 0) normalized += Math.PI * 2;
    while (normalized >= Math.PI * 2) normalized -= Math.PI * 2;
    return normalized;
  }

  private shortestAngleDelta(from: number, to: number): number {
    let delta = to - from;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
  }

  private resolveFurnitureCollisions(previousPosition: THREE.Vector3): void {
    const moveX = this.position.x - previousPosition.x;
    const moveZ = this.position.z - previousPosition.z;
    const moveLen = Math.hypot(moveX, moveZ);
    let collided = false;

    for (const object of solidObjects) {
      this.tempColliderBox.setFromObject(object);

      const minX = this.tempColliderBox.min.x - this.collisionRadius;
      const maxX = this.tempColliderBox.max.x + this.collisionRadius;
      const minZ = this.tempColliderBox.min.z - this.collisionRadius;
      const maxZ = this.tempColliderBox.max.z + this.collisionRadius;

      if (this.position.x >= minX && this.position.x <= maxX && this.position.z >= minZ && this.position.z <= maxZ) {
        collided = true;
        break;
      }
    }

    if (collided) {
      // Snappy "jerk" bump-back behavior.
      this.position.copy(previousPosition);

      const backDirX = moveLen > 0.0001 ? (moveX / moveLen) : Math.sin(this.facing);
      const backDirZ = moveLen > 0.0001 ? (moveZ / moveLen) : Math.cos(this.facing);

      // Perpendicular direction for a tiny "jerk" wobble.
      const sideDirX = -backDirZ;
      const sideDirZ = backDirX;

      const bumpBack = 0.18;
      const sideJerk = (Math.random() - 0.5) * 0.05;

      this.position.x -= backDirX * bumpBack;
      this.position.z -= backDirZ * bumpBack;
      this.position.x += sideDirX * sideJerk;
      this.position.z += sideDirZ * sideJerk;
    }
  }

  private updateMovement(): void {
    const speed = this.keys['ShiftLeft'] ? this.moveSpeed * 1.5 : this.moveSpeed;
    const previousPosition = this.position.clone();

    const justPressed = (key: string): boolean => Boolean(this.keys[key] && !this.prevKeys[key]);

    // Queue relative turns from arrow presses.
    if (justPressed('ArrowRight')) {
      this.targetFacing -= Math.PI / 2;
    }

    if (justPressed('ArrowLeft')) {
      this.targetFacing += Math.PI / 2;
    }

    if (justPressed('ArrowDown')) {
      this.targetFacing += Math.PI;
    }

    this.targetFacing = this.normalizeAngle(this.targetFacing);

    // Smoothly rotate toward target facing (instead of instant 90-degree snap).
    const turnStep = 0.08;
    const delta = this.shortestAngleDelta(this.facing, this.targetFacing);
    if (Math.abs(delta) <= turnStep) {
      this.facing = this.targetFacing;
    } else {
      this.facing = this.normalizeAngle(this.facing + Math.sign(delta) * turnStep);
    }

    // Move forward in facing direction with W
    if (this.keys['KeyW']) {
      const moveDir = new THREE.Vector3(
        Math.sin(this.facing),
        0,
        Math.cos(this.facing),
      );

      this.position.addScaledVector(moveDir, speed);
    }

    this.resolveFurnitureCollisions(previousPosition);

    // Room bounds
    this.position.x = Math.max(-5, Math.min(5, this.position.x));
    this.position.z = Math.max(-8, Math.min(8, this.position.z));
    this.position.y = this.groundY;

    // Sync model
    if (this.body) {
      this.body.position.copy(this.position);
      this.body.rotation.y = this.facing;
    }

  const camDistance = 2.5;
const camHeight = 3.2;

// Behind = opposite of where player faces
const behindX = -Math.sin(this.facing) * camDistance;
const behindZ = -Math.cos(this.facing) * camDistance;

camera.position.set(
  this.position.x + behindX,
  this.position.y + camHeight,
  this.position.z + behindZ
);

camera.lookAt(
  this.position.x,
  this.position.y + 2.3,
  this.position.z
);

    this.prevKeys = { ...this.keys };
  }

  public update(): void {
    const moving = this.keys['KeyW'];

    if (this.mixer) {
      this.mixer.timeScale = moving ? 1 : 0;
      if (moving) {
        this.mixer.update(this.clock.getDelta());
      }
    }

    this.updateMovement();
  }
}

export const player = new Player(new THREE.Vector3(0, -4.7, 0));

export function updatePlayerSystem(): void {
  player.update();
}