import { GameState } from '../core/state';


const timeContainer = document.createElement('div');
let hourTimer: number;

timeContainer.id = 'time-container';
document.body.appendChild(timeContainer);

// Victoyr screen
const victoryScreen = document.createElement('div');

victoryScreen.id = 'victory-screen';
victoryScreen.innerHTML = `<div class="victory-text">6:00 AM</div>`;
document.body.appendChild(victoryScreen);

/**
 * Starts the time loop, 48,000 milliseconds = 48 seconds per in-game hour
 */
export function initTimeSystem(): void {
  updateTimeUI(); // 12AM start
  hourTimer = window.setInterval(advanceTime, 48000); 
}

/**
 * Advances time and check for wincon
 */
function advanceTime(): void {
  if (GameState.isGameOver) return;

  // Inc hour, 12 loops back to 1
  if (GameState.currentHour === 12) {
    GameState.currentHour = 1;
  } else {
    GameState.currentHour++;
  }

  updateTimeUI();

  // Check for wincon at 6 AM
  if (GameState.currentHour === 6) {
    triggerVictory();
  }
}

/**
 * Updates HTML text
 */
function updateTimeUI(): void {
  timeContainer.innerText = `${GameState.currentHour} AM`;
}

/**
 * Halts the game and triggers the 6 AM Victory
 */
function triggerVictory(): void {
  GameState.isVictory = true;
  GameState.isGameOver = true;
  clearInterval(hourTimer);

  timeContainer.style.display = 'none';
  const powerUI = document.getElementById('power-container');
  if (powerUI) powerUI.style.display = 'none';
  GameState.isMonitorUp = false;

  victoryScreen.style.display = 'flex';
  setTimeout(() => { 
    victoryScreen.style.opacity = '1'; 
  }, 50);
}