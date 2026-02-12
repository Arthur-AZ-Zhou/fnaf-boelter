import { GameState } from '../core/state';


const monitorContainer = document.createElement('div');
const staticCanvas = document.createElement('canvas');

monitorContainer.id = 'monitor-layer';
staticCanvas.id = 'static-canvas';
document.body.appendChild(monitorContainer);
monitorContainer.appendChild(staticCanvas);

const ctx = staticCanvas.getContext('2d')!;

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