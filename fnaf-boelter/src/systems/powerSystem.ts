import { GameState } from '../core/state';

const powerContainer = document.createElement('div');
const powerLabel = document.createElement('div');
const usageLabel = document.createElement('div');

powerContainer.id = 'power-container';
powerLabel.id = 'power-label';
usageLabel.id = 'power-usage';

powerContainer.appendChild(powerLabel);
powerContainer.appendChild(usageLabel);
document.body.appendChild(powerContainer);

let powerTimer: number;

/**
 * Starts the 1-second interval loop for draining power
 */
export function initPowerSystem(): void {
  updatePowerUI();
  powerTimer = window.setInterval(drainPower, 1000); // Drain power every second
}

/**
 * Calculates current multiplier and drains the battery
 */
function drainPower(): void {
  if (GameState.isGameOver || GameState.powerLevel <= 0) return;

  // Calculate active systems
  let activeItems = 0;

  if (GameState.leftLightOn) activeItems++;
  if (GameState.rightLightOn) activeItems++;
  if (GameState.leftDoorClosed) activeItems++;
  if (GameState.rightDoorClosed) activeItems++;

  // Sum active systems, calculate drain, and update power level
  GameState.powerUsage = 1 + activeItems;
  const drainAmount = GameState.powerUsage * 0.2; // Base drain of 0.2% per active item
  GameState.powerLevel -= drainAmount;

  if (GameState.powerLevel <= 0) {
    GameState.powerLevel = 0;
    triggerPowerOutage();
  }

  updatePowerUI();
}

/**
 * Updates the HTML text and draws the usage bars
 */
function updatePowerUI(): void {
  powerLabel.innerText = `Power left: ${Math.ceil(GameState.powerLevel)}%`;

  let barsHtml = 'Usage: ';

  for (let i = 0; i < GameState.powerUsage; i++) {
    let colorClass = 'usage-bar';
    if (GameState.powerUsage >= 4) colorClass += ' high';
    if (GameState.powerUsage >= 5) colorClass += ' max';
    
    barsHtml += `<div class="${colorClass}"></div>`;
  }
  
  usageLabel.innerHTML = barsHtml;
}

/**
 * Triggers the loss state when power hits 0
 */
function triggerPowerOutage(): void {
  GameState.isPowerOut = true;
  clearInterval(powerTimer);
  
  // Wipe UI
  powerContainer.style.display = 'none';
  
  // Force doors open, turn off lights, shut down monitor
  GameState.leftDoorClosed = false;
  GameState.rightDoorClosed = false;
  GameState.leftLightOn = false;
  GameState.rightLightOn = false;
  GameState.isMonitorUp = false;
}