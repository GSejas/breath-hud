# UI Layout Reorganization & Auto-Fade Plan

## Overview
Reorganize the HUD controls into logical positions and implement auto-fade behavior where the entire interface becomes minimal when not in use.

## Current State Analysis

### Existing Layout Issues:
- Bottom bar overcrowded with all controls
- Mode button in wrong location
- Shape/pattern labels too large
- No auto-hide/fade behavior
- Controls always visible (except Zen mode)

## Proposed New Layout

### Target Layout (300x300px):
```
┌─────────────────────────────────┐
│             │ [🔄📋⏭️]           │  ← NEW: Sequence controls
│     Q1      │ [✏️🔊🎨📌✕]      │  ← EXISTING: Main controls  
│             │                   │
│             │                   │
├─[◀]────────┼────────────[▶]────┤  ← NEW: Shape navigation
│     [Centered Breathing]        │
│      🟢 GLOWING SHAPE 🟢       │
│ [◀]         │         [▶] Q4    │
│  Q3         │                   │
├─────────────┼───────────────────┤
│ [Circle]    │           [Basic] │  ← MOVED: Labels + Mode
│ [Zen]       │                   │
└─────────────┴───────────────────┘
```

## Control Repositioning

### 1. **Mode Button** → Lower Right Corner
- **From**: Bottom bar center
- **To**: Bottom-right corner of container
- **Size**: Compact 30x20px button
- **Label**: Current mode text (Zen/Basic/Advanced)

### 2. **Shape Navigation** → Between Quadrants
- **Left Button** (◀): Between Q1/Q3 (vertical center-left)
- **Right Button** (▶): Between Q2/Q4 (vertical center-right)
- **Purpose**: Previous/Next shape cycling
- **Size**: Small circular buttons

### 3. **Shape/Pattern Labels** → Bottom Center (Half Size)
- **Position**: Bottom-center, spanning between Q3/Q4
- **Size**: 50% of current text size
- **Layout**: Two compact lines
- **Content**: "Circle" / "Zen" (simplified)

### 4. **Sequence Controls** → Top-Right (Below Close)
- **Position**: Below existing control row
- **Controls**: 🔄 (Pattern), 📋 (Sequence), ⏭️ (Next Seq)
- **Layout**: Horizontal row under main controls

### 5. **Main Controls** → Keep Current Position
- **Position**: Top-right corner (unchanged)
- **Controls**: ✏️🔊🎨📌✕ (Edit/Audio/Theme/Pin/Close)

## Auto-Fade Behavior System

### Fade States:

#### **Active State** (User Interacting)
- **Trigger**: Mouse hover over HUD
- **Appearance**: 
  - Full opacity (100%)
  - All controls visible
  - Background at normal opacity
  - Glow effects at full strength

#### **Idle State** (No Interaction)
- **Trigger**: 3 seconds after mouse leaves HUD (if not pinned)
- **Appearance**:
  - Controls fade to 0% opacity
  - Background fades to 20% opacity  
  - Shape remains visible but dimmed (40% opacity)
  - Labels fade to 10% opacity

#### **Pinned State** (Always Visible)
- **Trigger**: Pin button activated
- **Appearance**: 
  - Controls always visible
  - Standard pinned opacity (40%)
  - No auto-fade behavior

### Fade Transition Logic:
```
IF (NOT pinned) {
  ON mouse_enter: → ACTIVE STATE (immediate)
  ON mouse_leave: → Start 3-second timer
  IF (timer expires): → IDLE STATE (slow fade 1s)
  IF (mouse_enter before timer): → Cancel timer, stay ACTIVE
}

IF (pinned) {
  → PINNED STATE (no auto-fade)
}
```

## Technical Implementation Strategy

### CSS Classes for Fade States:

```css
/* ACTIVE STATE - Default hover */
.hud-container:hover {
  /* All controls visible */
}

/* IDLE STATE - Auto-fade after timer */
.hud-container.auto-faded {
  background: rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  transition: all 1s ease-out;
}

.hud-container.auto-faded .enhanced-controls,
.hud-container.auto-faded .sequence-controls,
.hud-container.auto-faded .shape-navigation,
.hud-container.auto-faded .mode-button {
  opacity: 0;
  transition: opacity 1s ease-out;
}

.hud-container.auto-faded .breathing-shape {
  opacity: 0.4;
  filter: blur(0.5px);
  transition: opacity 1s ease-out, filter 1s ease-out;
}

.hud-container.auto-faded .shape-pattern-display {
  opacity: 0.1;
  transition: opacity 1s ease-out;
}

/* PINNED STATE - Override auto-fade */
.hud-container.pinned {
  /* Pinned styles override auto-fade */
}
```

### New Control Containers:

```css
/* Sequence controls - Top-right, below main */
.sequence-controls {
  position: absolute;
  top: 50px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 9;
}

/* Shape navigation - Side buttons */
.shape-navigation-left {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 8;
}

.shape-navigation-right {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 8;
}

/* Compact labels - Bottom center */
.shape-pattern-display {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 10px;
  line-height: 1.2;
  z-index: 7;
}

/* Mode button - Bottom-right corner */
.mode-button-corner {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 35px;
  height: 18px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 8;
}
```

### JavaScript Auto-Fade Controller:

```typescript
class AutoFadeController {
  private fadeTimer: NodeJS.Timeout | null = null;
  private container: HTMLElement;
  private readonly FADE_DELAY = 3000; // 3 seconds
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.setupFadeListeners();
  }
  
  private setupFadeListeners() {
    // Show on hover
    this.container.addEventListener('mouseenter', () => {
      if (!this.isPinned()) {
        this.showInterface();
        this.clearFadeTimer();
      }
    });
    
    // Start fade timer on mouse leave
    this.container.addEventListener('mouseleave', () => {
      if (!this.isPinned()) {
        this.startFadeTimer();
      }
    });
    
    // Cancel fade if controls are clicked
    this.container.addEventListener('click', (e) => {
      if (e.target instanceof HTMLButtonElement) {
        this.clearFadeTimer();
        this.showInterface();
      }
    });
  }
  
  private startFadeTimer() {
    this.clearFadeTimer();
    this.fadeTimer = setTimeout(() => {
      this.fadeInterface();
    }, this.FADE_DELAY);
  }
  
  private clearFadeTimer() {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
  
  private showInterface() {
    this.container.classList.remove('auto-faded');
  }
  
  private fadeInterface() {
    this.container.classList.add('auto-faded');
  }
  
  private isPinned(): boolean {
    return this.container.classList.contains('pinned');
  }
  
  // Public method to force show (for debugging)
  public forceShow() {
    this.clearFadeTimer();
    this.showInterface();
  }
}
```

## Implementation Steps

### Phase 1: Layout Restructuring
1. **Remove bottom bar**: Extract all controls from `.mode-controls`
2. **Create new containers**: Add sequence, navigation, labels, mode containers
3. **Migrate HTML**: Move controls to appropriate new containers
4. **Update CSS**: Position new containers correctly

### Phase 2: Control Repositioning  
1. **Move mode button**: To bottom-right corner with compact styling
2. **Split shape navigation**: Left/right side buttons
3. **Resize labels**: Half-size text in bottom-center
4. **Add sequence controls**: Below main controls in top-right

### Phase 3: Auto-Fade System
1. **Create AutoFadeController**: Timer-based fade logic
2. **Add CSS transitions**: Smooth opacity/background changes
3. **Integrate with pin state**: Disable fade when pinned
4. **Test interaction flows**: Ensure smooth UX

### Phase 4: Visual Polish & Testing
1. **Fine-tune timings**: Optimize fade delays and transition speeds
2. **Accessibility**: Ensure keyboard navigation works
3. **Mobile/touch**: Test touch interaction patterns
4. **Performance**: Verify smooth animations on lower-end hardware

## Expected User Experience

### Normal Interaction Flow:
```
1. HUD starts in IDLE state (dimmed, minimal)
2. User hovers → ACTIVE state (full visibility, immediate)
3. User moves mouse away → 3-second countdown begins
4. If no return hover → IDLE state (slow 1s fade)
5. Next hover → ACTIVE state (immediate)
```

### Visual Benefits:
- **Less Distraction**: HUD becomes nearly invisible when not needed
- **Better Organization**: Controls grouped logically by function
- **Cleaner Layout**: More space for breathing shape focus
- **Smooth Transitions**: Elegant fade animations feel natural

This creates a truly unobtrusive meditation interface that appears when needed and disappears when not, while maintaining all functionality in a more organized layout.