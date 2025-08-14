console.log('HUD App starting...');

// Simple breathing animation without complex imports
class SimpleBreathingAnimation {
  private canvas: HTMLElement;
  private isRunning = false;
  private animationId?: number;

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.createBreathingCircle();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private createBreathingCircle() {
    this.canvas.innerHTML = `
      <svg width="200" height="200" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(74, 144, 226, 0.8)" stroke-width="2" id="breathing-circle"/>
      </svg>
    `;
  }

  private animate() {
    if (!this.isRunning) return;

    const circle = document.getElementById('breathing-circle');
    if (circle) {
      const time = Date.now() / 1000;
      const phase = Math.sin(time * 0.5) * 0.5 + 0.5; // 0 to 1
      const radius = 40 + phase * 40; // 40 to 80
      const opacity = 0.4 + phase * 0.6; // 0.4 to 1.0
      
      circle.setAttribute('r', radius.toString());
      circle.style.opacity = opacity.toString();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Simple state management
let isPinned = false;
let breathingAnimation: SimpleBreathingAnimation | null = null;

// Pin/unpin functionality
async function togglePin(): Promise<void> {
  isPinned = !isPinned;
  const container = document.getElementById('hud-container');
  const pinBtn = document.getElementById('pin-btn');

  if (!container || !pinBtn) return;

  if (isPinned) {
    container.classList.add('pinned');
    pinBtn.classList.add('pinned');
    pinBtn.textContent = '📍';

    // Enable click-through if API available
    if ((window as any).electronAPI?.setClickThrough) {
      await (window as any).electronAPI.setClickThrough(true);
    }

    console.log('HUD pinned');
  } else {
    container.classList.remove('pinned');
    pinBtn.classList.remove('pinned');
    pinBtn.textContent = '📌';

    // Disable click-through if API available
    if ((window as any).electronAPI?.setClickThrough) {
      await (window as any).electronAPI.setClickThrough(false);
    }

    console.log('HUD unpinned');
  }

  updateStatus();
}

// Close functionality
async function closeHUD(): Promise<void> {
  if ((window as any).electronAPI?.close) {
    await (window as any).electronAPI.close();
  } else {
    console.log('Close API not available');
  }
}

// Update status text
function updateStatus(): void {
  const status = document.getElementById('status');
  if (status) {
    const mode = isPinned ? 'Pinned' : 'Active';
    status.textContent = `Breathing • ${mode} Mode`;
  }
}

// Initialize the app
function initializeApp(): void {
  console.log('Initializing HUD app...');

  // Set up event listeners
  const pinBtn = document.getElementById('pin-btn');
  const closeBtn = document.getElementById('close-btn');
  const audioBtn = document.getElementById('audio-btn');

  if (pinBtn) {
    pinBtn.addEventListener('click', togglePin);
    console.log('Pin button event listener added');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeHUD);
    console.log('Close button event listener added');
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      console.log('Audio button clicked (not implemented)');
    });
    console.log('Audio button event listener added');
  }

  // Initialize breathing animation
  const breathingCanvas = document.getElementById('breathing-canvas');
  if (breathingCanvas) {
    breathingAnimation = new SimpleBreathingAnimation(breathingCanvas);
    breathingAnimation.start();
    console.log('Breathing animation started');
  }

  // Initialize status
  updateStatus();

  console.log('HUD app initialized successfully');
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Debug info
console.log('Electron API available:', !!((window as any).electronAPI));