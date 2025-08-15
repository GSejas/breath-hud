# Features Guide

Complete documentation of Breathing HUD features and capabilities.

## Rendering Engine

### Canvas2D Performance
- **60fps Animation**: Smooth breathing visualization on all hardware
- **GPU Acceleration**: Hardware-accelerated Canvas2D rendering  
- **Memory Efficient**: Optimized draw calls and resource management
- **Low CPU Usage**: Background operation with minimal system impact

### Shapes and Rendering
- **Multiple Shapes**: Circle, Triangle, Square, Star, Heart, Lotus
- **Smooth Scaling**: Continuous size transitions during breathing cycles
- **Anti-aliasing**: Clean edges and smooth curves
- **Color Gradients**: Theme-based color schemes with smooth transitions

## Interaction Modes

### Zen Mode
**Purpose**: Distraction-free meditation experience

**Features**:
- Auto-hidden interface elements
- Hover-to-reveal controls (300ms delay)
- Transparent bottom controls
- Minimal visual distractions
- Pin button always accessible

**Use Cases**:
- Deep meditation sessions
- Background mindfulness during work
- Focus training

### Basic Mode  
**Purpose**: Balanced interface with essential controls

**Features**:
- Visible mode controls
- Shape and pattern selection
- Standard breathing visualization
- Clear phase indicators

**Use Cases**:
- Daily meditation practice
- Guided breathing exercises
- Learning different patterns

### Advanced Mode
**Purpose**: Full customization and control

**Features**:
- Real-time breathing parameter sliders
- Debug information display
- Configuration options
- Performance monitoring

**Controls**:
- Base Size slider (0.2-1.2)
- Inhale Max slider (0.4-2.0)  
- Exhale Min slider (0.1-1.0)

**Use Cases**:
- Breathing technique development
- Therapeutic breathing protocols
- Personal optimization

## Breathing Visualization

### Phase System
The breathing cycle consists of four distinct phases:

#### Inhale Phase
- **Visual**: Circle grows from base to maximum size
- **Progress**: Bar fills 0% → 100% with blue gradient
- **Duration**: Configurable (default: 4 seconds)
- **Easing**: Cubic ease-in-out for natural feel

#### Hold Phase  
- **Visual**: Circle maintains maximum size
- **Progress**: Bar stays at 100% with accent color
- **Effect**: Subtle pulsing glow animation
- **Duration**: Configurable (default: 4 seconds)

#### Exhale Phase
- **Visual**: Circle shrinks from maximum to minimum size  
- **Progress**: Bar empties 100% → 0% with gradient transition
- **Duration**: Configurable (default: 6 seconds)
- **Easing**: Smooth deceleration curve

#### Pause Phase
- **Visual**: Circle maintains minimum size
- **Progress**: Bar stays at 0% with minimal styling
- **Duration**: Configurable (default: 2 seconds)
- **State**: Rest period before next cycle

### Progress Bar Features
- **Phase Colors**: Different colors for each breathing phase
- **Smooth Transitions**: 0.1s width transitions, 0.3s color changes
- **Visual Effects**: Glow effects during hold phase
- **Accessibility**: High contrast mode support

## Accessibility Features

### Reduced Motion Support
- **OS Detection**: Automatically detects `prefers-reduced-motion`
- **Manual Override**: Configuration option to disable
- **Graceful Degradation**: Maintains functionality with minimal animation
- **Real-time Updates**: Responds to OS preference changes

### Visual Accessibility
- **High Contrast**: Enhanced visibility for low vision users
- **Customizable Colors**: User-configurable color schemes
- **Clear Typography**: Readable fonts and sizing
- **Focus Indicators**: Keyboard navigation support

### Motor Accessibility  
- **Large Click Targets**: 24px minimum button sizes
- **Hover States**: Clear visual feedback
- **Keyboard Navigation**: Full keyboard control
- **Pin Mode**: Eliminates accidental interactions

## Pinning and Overlay

### Pin Functionality
- **Click-through Mode**: Window becomes transparent to mouse events
- **Visual Feedback**: Reduced opacity and distinct styling
- **Background Operation**: Continues breathing animation
- **Easy Toggle**: Single click to pin/unpin

### Window Management
- **Always on Top**: Stays above other applications
- **Transparent Background**: Blends with desktop
- **Resizable**: Maintains aspect ratio during resize
- **Position Memory**: Remembers window placement

## Configuration System

### Real-time Updates
- **Slider Controls**: Immediate visual feedback
- **Configuration Persistence**: Settings saved to localStorage
- **Hot Reload**: Changes apply without restart
- **Validation**: Input bounds checking and error handling

### Breathing Parameters
- **Base Size**: Controls neutral breathing circle size
- **Inhale Maximum**: Sets peak expansion during inhale  
- **Exhale Minimum**: Sets minimum contraction during exhale
- **Intensity**: Overall animation strength multiplier

### Theme System
- **Color Variables**: CSS custom properties for theming
- **Dynamic Updates**: Real-time theme switching
- **Preset Themes**: Ocean, Forest, Sunset, Moonlight themes
- **Custom Colors**: User-defined color schemes

## Performance Optimizations

### Rendering Optimizations
- **RequestAnimationFrame**: Smooth 60fps animation loops
- **Dirty Region Updates**: Only redraw changed areas
- **Canvas Pooling**: Efficient canvas resource management
- **GPU Acceleration**: Hardware-accelerated transformations

### Memory Management
- **Event Listener Cleanup**: Proper cleanup on mode changes
- **Animation Frame Cancellation**: Prevents memory leaks
- **Efficient Data Structures**: Minimal object allocation
- **Garbage Collection**: Optimized for minimal GC pressure

### System Integration
- **Low Priority Threading**: Background operation mode
- **Power Efficiency**: Reduced CPU usage when inactive
- **Resource Monitoring**: Built-in performance metrics
- **Adaptive Quality**: Automatic quality adjustment based on performance

## Keyboard Shortcuts

### Global Shortcuts
- **Space**: Play/pause breathing animation
- **P**: Toggle pin mode
- **Esc**: Exit current mode or close application

### Mode Navigation
- **Z**: Switch to Zen mode
- **B**: Switch to Basic mode  
- **A**: Switch to Advanced mode

### Advanced Mode Controls
- **↑/↓**: Adjust base size
- **←/→**: Adjust inhale/exhale ratio
- **+/-**: Increase/decrease overall intensity