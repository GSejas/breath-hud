# Issue: Arrow Direction Visual Feedback Not Working

**Type**: Enhancement  
**Priority**: Medium  
**Labels**: ui-ux, breathing-engine, post-refactor-cleanup  
**Date Created**: 2026-01-18

## Description
The breathing app currently displays arrows that do not change direction between inhale and exhale phases. Users expect visual arrows to indicate the breathing direction (inhale = inward/up arrows, exhale = outward/down arrows) but they appear to remain static.

## Current Behavior
- Arrows are displayed during breathing animation
- Arrow direction remains constant regardless of breathing phase
- Text correctly shows "INHALE" or "EXHALE" 
- Breathing animation and timing work correctly

## Expected Behavior
- During **INHALE** phase: Arrows should point **inward/upward** to indicate drawing breath in
- During **EXHALE** phase: Arrows should point **outward/downward** to indicate releasing breath
- Direction should smoothly transition or flip at phase boundaries

## Technical Context

### Affected Components (Post-Refactor)
Based on the recent modular architecture refactoring, this likely involves:

```
src/renderer/engines/canvas-renderer.ts    - Arrow rendering logic
src/renderer/engines/phase-calculator.ts   - Breathing phase detection  
src/renderer/engines/animation-engine.ts   - Animation state management
src/renderer/utils/breathing.ts            - Breathing calculations
```

### Investigation Areas
1. **Arrow Rendering**: Check if `canvas-renderer.ts` has logic for directional arrows
2. **Phase Detection**: Verify `phase-calculator.ts` correctly identifies inhale/exhale
3. **State Binding**: Ensure arrow direction is tied to breathing phase state
4. **Animation Loop**: Confirm `animation-engine.ts` updates arrow visuals per frame

## Steps to Reproduce
1. Launch breathing HUD app
2. Start any breathing pattern (4-4-4-4, Box, etc.)
3. Observe arrow display during inhale phase
4. Watch arrow display during exhale phase  
5. Notice arrows don't change direction between phases

## Environment
- App Version: 3.0.0 (post-refactor)
- Platform: Electron + Canvas rendering
- Test Status: 242/243 tests passing (99.6%)

## Acceptance Criteria
- [ ] Arrows point inward/upward during INHALE phase
- [ ] Arrows point outward/downward during EXHALE phase  
- [ ] Direction changes are smooth and visually intuitive
- [ ] No performance impact on breathing animation
- [ ] Consistent across all breathing patterns
- [ ] Works with all theme variants

## Analysis Plan

### Step 1: Code Investigation
Review the arrow rendering implementation in the newly refactored modules:

```bash
# Check arrow rendering logic
grep -r "arrow" src/renderer/engines/
grep -r "direction" src/renderer/engines/
grep -r "inhale\|exhale" src/renderer/
```

### Step 2: Phase State Analysis
Verify breathing phase detection:
```typescript
// In phase-calculator.ts - check if phase state is properly tracked
getCurrentPhase(): 'inhale' | 'exhale' | 'hold'
```

### Step 3: Canvas Rendering Review  
Examine `canvas-renderer.ts` for:
- Arrow drawing functions
- Direction parameter usage
- Phase state integration

### Step 4: Testing Strategy
Create test cases for:
- Arrow direction during different phases
- Phase transition behavior
- Visual consistency across themes

## Potential Implementation Approach

```typescript
// In canvas-renderer.ts
interface ArrowConfig {
  direction: 'in' | 'out';
  phase: 'inhale' | 'exhale';
  angle: number;
  intensity: number;
}

// Update arrow rendering based on breathing phase
renderPhaseArrows(phase: BreathingPhase, progress: number): void {
  const direction = phase === 'inhale' ? 'in' : 'out';
  const arrows = this.calculateArrowPositions(direction);
  this.drawDirectionalArrows(arrows, direction, progress);
}
```

## Related Files
- [canvas-renderer.ts](src/renderer/engines/canvas-renderer.ts)
- [phase-calculator.ts](src/renderer/engines/phase-calculator.ts) 
- [animation-engine.ts](src/renderer/engines/animation-engine.ts)
- [breathing.ts](src/renderer/utils/breathing.ts)

---

**Next Actions**:
1. Investigate current arrow implementation in refactored modules
2. Identify phase state binding gaps
3. Design directional arrow enhancement
4. Implement with comprehensive tests
5. Validate across all breathing patterns and themes