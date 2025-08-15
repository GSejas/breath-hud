# Documentation Index

Comprehensive documentation for Breathing HUD, organized by topic and audience.

## Quick Navigation

### For Users
- [**README**](../README.md) - Quick start and overview
- [**Features Guide**](FEATURES.md) - Complete feature documentation
- [**Configuration**](CONFIGURATION.md) - Settings and customization

### For Developers  
- [**Development Guide**](DEVELOPMENT.md) - Setup, build, and contribution
- [**API Reference**](API.md) - Technical implementation details

## Documentation Structure

```
docs/
├── README.md           # This index (you are here)
├── FEATURES.md         # Complete feature guide (242 lines)
├── CONFIGURATION.md    # Configuration reference (247 lines)  
├── DEVELOPMENT.md      # Developer setup guide (248 lines)
├── API.md             # Technical API reference (245 lines)
└── legacy/            # Previous documentation versions
    ├── ARCHITECTURE_ASCII_ART.md
    ├── CHANGELOG.md
    ├── CONFIGURATION_AND_UI_FLOWS.md
    ├── DEVELOPER_GUIDE.md
    ├── ELECTRON_FORGE_MIGRATION.md
    ├── ENHANCED_FEATURES.md
    ├── QUICK_GUIDE.md
    ├── TESTING.md
    └── USER_GUIDE.md
```

## Documentation Features

### Segmented Structure
- Each document is under 250 lines for readability
- Clear topic separation and focused content
- Cross-referenced between documents

### Complete Coverage
- **User Documentation**: Installation, usage, configuration
- **Developer Documentation**: Architecture, API, contribution
- **Technical Reference**: Implementation details, troubleshooting

### Updated Content
- Reflects current Canvas2D implementation
- Covers accessibility features and reduced motion
- Documents breathing parameter controls
- Includes phase bar visualization

## Quick Start Paths

### I want to use Breathing HUD
1. [Install and run](../README.md#quick-start) - Basic setup
2. [Learn the features](FEATURES.md) - Understand capabilities
3. [Customize settings](CONFIGURATION.md) - Personalize experience

### I want to develop/contribute
1. [Setup development environment](DEVELOPMENT.md#quick-setup)
2. [Understand the architecture](DEVELOPMENT.md#architecture-deep-dive)
3. [Review API documentation](API.md)

### I want technical details
1. [API Reference](API.md) - Classes, methods, interfaces
2. [Configuration system](CONFIGURATION.md) - Settings architecture
3. [Performance details](FEATURES.md#performance-optimizations)

## Recent Updates

### Version 2.0 (Enhanced)
- **Canvas2D Rendering**: Replaced SVG with high-performance Canvas2D
- **Accessibility Support**: OS reduced-motion detection and respect
- **Breathing Controls**: Real-time parameter adjustment sliders
- **Phase Visualization**: Color-coded progress bar with breathing phases
- **Solid Glowing Shapes**: Multi-layered glow effects for better visibility

### Documentation Improvements
- Organized into focused, sub-250-line documents
- Added comprehensive API reference
- Updated all examples for current implementation
- Added troubleshooting and performance sections

## Legacy Documentation

Previous documentation versions are available in `docs/legacy/` for reference:

- **ENHANCED_FEATURES.md**: Previous feature documentation
- **DEVELOPER_GUIDE.md**: Original developer setup guide
- **USER_GUIDE.md**: Legacy user documentation
- **CONFIGURATION_AND_UI_FLOWS.md**: UI flow documentation

## Getting Help

### Documentation Issues
- Missing information → Check [API Reference](API.md)
- Setup problems → See [Development Guide](DEVELOPMENT.md)
- Feature questions → Read [Features Guide](FEATURES.md)

### Technical Support
- GitHub Issues: Report bugs and feature requests
- Discussions: Community help and questions
- Pull Requests: Contribute improvements

## Documentation Standards

### Writing Guidelines
- Clear, concise explanations
- Code examples for complex concepts
- Cross-references between related sections
- Consistent formatting and structure

### File Organization
- Maximum 250 lines per document
- Logical topic grouping
- Clear file naming conventions
- Comprehensive index and navigation