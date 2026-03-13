# Five Nights at Boelter

Welcome to the repo dear TA! We are building a web-based survival horror experience using Three.js and Vite. The game currently features a functional 3D grey-box office, a fully operational 2D camera system mapped to Boelter Hall, and a complete RNG-based animatronic AI system.

## Quick Start
To get the project running locally for the first time, install the dependencies and spin up the Vite dev server:

~~~sh
npm install
npm run dev
~~~

> **TO ANY FUTURE DEVS:** If you are testing UI or building out the 3D office and do not want to deal with jumpscares, go into `src/core/state.ts` and set both `careyDifficulty` and `joeDifficulty` to `0`. This will safely freeze their AI loops so you don't get jumpscaed while attempting to change something.


## Project Overview & Core Mechanics
The core game loop is heavily resource-management focused. You must balance your limited power supply while tracking unpredictable threats. 

### The Office
The main stage is a 3D room (`src/world/office.ts`) equipped with two security doors on the left and right. Each doorway has a functional light switch and a close-door button. These doors are your only line of defense against Carey and Joe.

### Movement
The player can use the arrow keys to change direction and the "w" key to move forwards

### Animatronic AI
Carey and Joe navigate Boelter Hall using a non-deterministic, RNG-based pathing system. Their movement frequency scales with the night's difficulty level. Once an animatronic reaches your doorway, you have exactly **5 seconds** to react and close the door before they trigger a jumpscare.

### Camera System
The monitor pulls up a 2D map of Boelter Hall. Each room is a clickable button that displays the corresponding camera feed. The animatronics are rendered as sprite overlays on top of the empty room images. A visual static flash effect triggers across the screen whenever an animatronic successfully moves to a new room.

### Power Management
You begin the night with 100% power, which drains linearly. Doing absolutely nothing will drain your power at a base rate of **0.2% per second**. However, every active system (monitor up, left door closed, right light on, etc.) acts as a multiplier, draining an additional 0.2% per second. If you hit 0%, all systems shut down, the doors open, and you are left completely defenseless until 6 AM (or until Carey/Joe finds you).

### Time System
A standard shift lasts from 12 AM to 6 AM. In real-time, surviving a full night takes exactly **4 minutes and 48 seconds** (48 seconds per in-game hour).


## WIP
The following features are slated for upcoming development sprints.

### Audio System Design
We need to implement an `Audio` manager to handle overlapping sound effects and build atmosphere:
* **Mechanical SFX:** Door open/close, lights buzzing on/off.
* **UI SFX:** Camera static bursts when switching feeds or tracking movement.
* **System Failure:** A loud, heavy "power down" winding noise when hitting 0% battery.
* **Threat SFX:** The final jumpscare scream and potentially low ambient tension noise (e.g., distant footsteps or hums).

### Title Card & Menu
The entry point of the game needs a static background overlaying a creepy photoshop of Boelter Hall featuring Carey and/or Joe. The menu will contain buttons for Nights 1 through 5. Selecting a night will pass the corresponding difficulty variables directly into `core/state.ts` before initializing the scene:
* **Night 1:** Difficulty 4
* **Night 2:** Difficulty 8
* **Night 3:** Difficulty 12
* **Night 4:** Difficulty 16
* **Night 5:** Difficulty 20
