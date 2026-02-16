import { GameState } from '../core/state';
import { CONFIG } from '../core/config';
import { updateUI } from './cameraSystem';


// Specific paths for each animatronic
const CAREY_PATH = ['CAM_10', 'CAM_07', 'CAM_02', 'CAM_01', 'CAM_04', 'CAM_06', 'LEFT_DOOR'];
const JOE_PATH = ['CAM_10', 'CAM_08', 'CAM_03', 'CAM_01', 'CAM_05', 'CAM_09', 'RIGHT_DOOR'];

let careyTimer: number;
let joeTimer: number;

/**
 * Initializes the AI loops when the night starts
 */
export function initAISystem(): void {
  careyTimer = window.setInterval(() => updateCarey(), CONFIG.CAREY_MOVE_INTERVAL);
  joeTimer = window.setInterval(() => updateJoe(), CONFIG.JOE_MOVE_INTERVAL);
}

/**
 * Carey's Logic Loop
 */
function updateCarey(): void {
  if (GameState.isGameOver) return;
  
  // If he  is already at door, he stops rolling to move and waits for the attack timer
  if (GameState.careyLocation === 'LEFT_DOOR') return;

  // Roll a d20
  const roll = Math.floor(Math.random() * 20) + 1;
  const currentIndex = CAREY_PATH.indexOf(GameState.careyLocation);
  
  if (roll === 1) {
    if (currentIndex > 0) { 
      GameState.careyLocation = CAREY_PATH[currentIndex - 1];
      console.log(`Carey retreated to: ${GameState.careyLocation}`);
      
      if (GameState.isMonitorUp) {
        updateUI();
      }
    }

  } else if (roll <= GameState.careyDifficulty) {
    const currentIndex = CAREY_PATH.indexOf(GameState.careyLocation);
    
    // Move to the next room in the path
    if (currentIndex < CAREY_PATH.length - 1) {
      GameState.careyLocation = CAREY_PATH[currentIndex + 1];
      console.log(`Carey moved to: ${GameState.careyLocation}`);
      
      if (GameState.isMonitorUp) {
        updateUI();
      }

      // Check if he just arrived at the door
      if (GameState.careyLocation === 'LEFT_DOOR') {
        triggerDoorAttack('Carey');
      }
    }
  }
}

/**
 * Joe's Logic Loop
 */
function updateJoe(): void {
  if (GameState.isGameOver) return;
  
  if (GameState.joeLocation === 'RIGHT_DOOR') return;

  const roll = Math.floor(Math.random() * 20) + 1;
  const currentIndex = JOE_PATH.indexOf(GameState.joeLocation);
  
  if (roll === 1) {
    if (currentIndex > 0) {
      GameState.joeLocation = JOE_PATH[currentIndex - 1];
      console.log(`Joe retreated to: ${GameState.joeLocation}`);
      
      if (GameState.isMonitorUp) {
        updateUI();
      }
    }
  } else if (roll <= GameState.joeDifficulty) {
    const currentIndex = JOE_PATH.indexOf(GameState.joeLocation);
    
    if (currentIndex < JOE_PATH.length - 1) {
      GameState.joeLocation = JOE_PATH[currentIndex + 1];
      console.log(`Joe moved to: ${GameState.joeLocation}`);

      if (GameState.isMonitorUp) {
        updateUI();
      }
      
      if (GameState.joeLocation === 'RIGHT_DOOR') {
        triggerDoorAttack('Joe');
      }
    }
  }
}

/**
 * Handles the countdown and jumpscare/reset logic when they reach the office
 * @param animatronic: Which animatronic is attacking (Carey or Joe)
 */
function triggerDoorAttack(animatronic: 'Carey' | 'Joe'): void {
  console.log(`${animatronic} is at the door!`);

  setTimeout(() => {
    if (GameState.isGameOver) return; // Prevent double jumpscares if the other one got you first

    if (animatronic === 'Carey') {
      if (GameState.leftDoorClosed) { // Successful block
        const resetLocations = ['CAM_10', 'CAM_07', 'CAM_02', 'CAM_01', 'CAM_04'];
        const randomLoc = resetLocations[Math.floor(Math.random() * resetLocations.length)];

        GameState.careyLocation = randomLoc;
        console.log(`Carey was blocked! Resetting to ${randomLoc}.`);

      } else {
        // Player failed to close door
        console.log("JUMPSCARE! Carey got you.");
        executeJumpscare('Carey');
      }
    } 
    
    else if (animatronic === 'Joe') {
      if (GameState.rightDoorClosed) {
        const resetLocations = ['CAM_10', 'CAM_08', 'CAM_03', 'CAM_01', 'CAM_05'];
        const randomLoc = resetLocations[Math.floor(Math.random() * resetLocations.length)];
        
        GameState.joeLocation = randomLoc;
        console.log(`Joe was blocked! Resetting to ${randomLoc}.`);

      } else {
        console.log("JUMPSCARE! Joe got you.");
        executeJumpscare('Joe');
      }
    }
  }, CONFIG.ATTACK_WINDOW);
}

/**
 * Halts the game and triggers the loss state
 */
function executeJumpscare(animatronic: 'Carey' | 'Joe'): void {
  GameState.isMonitorUp = false;
  GameState.isGameOver = true;
  clearInterval(careyTimer);
  clearInterval(joeTimer);
  
  //WIP, JUST ALERT FOR NOW
  alert(`GAME OVER. Killed by ${animatronic}`); 
}