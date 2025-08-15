# Expandable Tile System Design

## Overview
Implement tile expansion functionality where users can scale the entire HUD while maintaining usability and proportion.

## Current State Analysis

### Fixed Dimensions:
- **Container**: 300x300px fixed size
- **Border Radius**: 20px
- **Grid System**: 2x2 layout for quadrant-based positioning
- **All positioning**: Absolute pixel values

### Scaling Challenges:
- Controls positioned with absolute pixel coordinates
- Shape container has fixed 160x160px dimensions
- Text sizes are fixed pixel values
- Need to maintain control usability during scaling

## Proposed Expandable System

### Scaling Approach:
Use CSS `transform: scale()` on the main container with selective exemptions for small controls.

### Scale Ranges:
- **Minimum Scale**: 0.5x (150x150px effective)
- **Default Scale**: 1.0x (300x300px - current)
- **Maximum Scale**: 3.0x (900x900px effective)
- **Increment**: 0.1x per step

### What Scales (Proportionally):
1. **Main Container**: Full geometric scaling
2. **Breathing Shape**: Scales with container
3. **Text Labels**: Shape/pattern/sequence status
4. **Background/Border**: Maintains proportional border radius
5. **Status Indicators**: Phase bar and indicators

### What Stays Fixed (Original Size):
1. **Small Control Buttons**: 20px and 24px buttons
2. **Close/Pin/Edit Controls**: Top-right corner buttons
3. **Sequence Controls**: Pattern/sequence toggle buttons
4. **Mode Button**: Bottom-right corner button
5. **Shape Navigation**: Left/right arrow buttons

## Implementation Strategy

### CSS Transform Method:
```css
/* Main container scaling */
#hud-container.scaled {
  transform: scale(var(--hud-scale));
  transform-origin: center center;
}

/* Fixed-size controls - counter-scale */
.control-btn, 
.sequence-controls .control-btn,
.mode-btn-compact,
.shape-navigation-left .control-btn,
.shape-navigation-right .control-btn {
  transform: scale(calc(1 / var(--hud-scale)));
  transform-origin: center;
}
```

### JavaScript Scale Management:
```typescript
class TileScaleController {
  private currentScale: number = 1.0;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 3.0;
  private readonly SCALE_STEP = 0.1;
  
  public scaleUp(): void {
    this.setScale(Math.min(this.MAX_SCALE, this.currentScale + this.SCALE_STEP));
  }
  
  public scaleDown(): void {
    this.setScale(Math.max(this.MIN_SCALE, this.currentScale - this.SCALE_STEP));
  }
  
  public setScale(scale: number): void {
    this.currentScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
    this.applyScale();
  }
  
  private applyScale(): void {
    const container = document.getElementById('hud-container');
    if (container) {
      container.style.setProperty('--hud-scale', this.currentScale.toString());
      container.classList.add('scaled');
    }
  }
}
```

## Control Integration

### New Scale Controls:
Add dedicated scale controls to the enhanced controls:
- **🔍+** Scale Up button
- **🔍-** Scale Down button  
- **📏** Reset to 1.0x button (long-press or double-click)

### Keyboard Shortcuts:
- **Ctrl + Plus (+)**: Scale up
- **Ctrl + Minus (-)**: Scale down  
- **Ctrl + 0**: Reset to default scale
- **Ctrl + 1-9**: Quick scale presets (0.5x to 3.0x)

### Position Management:
When scaling, maintain center position to avoid the HUD moving off-screen.

## Visual Design Considerations

### Border Radius Scaling:
Border radius should scale proportionally to maintain visual consistency:
```css
#hud-container.scaled {
  border-radius: calc(20px * var(--hud-scale));
}
```

### Text Readability:
Ensure text remains readable at minimum scale (0.5x):
- Current 10px text becomes 5px at 0.5x (still readable)
- Current 8px text becomes 4px at 0.5x (minimum acceptable)

### Control Accessibility:
Fixed-size controls ensure:
- **24px buttons remain 24px** at any scale
- **Touch targets** stay accessible
- **Click precision** maintained regardless of tile size

## Use Cases

### Small Scale (0.5x - 0.8x):
- **Desktop corner placement**: Minimal footprint
- **Multitasking**: Less screen real estate usage
- **Background meditation**: Unobtrusive presence

### Default Scale (1.0x):
- **Balanced use**: Current optimal size
- **General meditation**: Good visibility and interaction

### Large Scale (1.5x - 3.0x):
- **Focus sessions**: Enhanced visibility
- **Accessibility**: Better for users with vision needs
- **Presentation mode**: Sharing screen or teaching

## Implementation Steps

### Phase 1: Scale Controller
1. Create `TileScaleController` class
2. Add scale management methods
3. Integrate with existing `TileControlSystem`

### Phase 2: CSS Scaling System
1. Add CSS custom properties for scale
2. Implement proportional scaling for main elements
3. Add counter-scaling for fixed controls

### Phase 3: Control Interface
1. Add scale controls to enhanced controls
2. Implement keyboard shortcuts
3. Add scale indicator display

### Phase 4: Persistence & Polish
1. Save/restore scale preference
2. Add smooth scaling animations
3. Handle edge cases (off-screen positioning)

## Technical Considerations

### Performance:
- CSS transforms are GPU-accelerated
- No layout recalculation during scaling
- Minimal performance impact

### Positioning:
- Use `transform-origin: center` to scale from center
- Monitor bounds to keep HUD on-screen
- Adjust position if needed after scaling

### Integration:
- Works with existing auto-fade system
- Compatible with pin/unpin functionality
- Maintains breathing animation quality

This expandable system provides users with flexible sizing options while maintaining all functionality and visual quality at any scale level.