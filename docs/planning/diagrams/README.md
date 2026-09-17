# Minimal Editor Visual Index

These visuals are the shared reference layer for the minimal editor proposal.

| Visual | Format | Answers |
| --- | --- | --- |
| [Layout board](minimal-editor-layout.svg) | SVG | What does the editor look like on desktop and mobile? |
| [State board](minimal-editor-states.svg) | SVG | What changes across loading, empty, error, success, and disabled? |
| [User flow](minimal-editor-flow.mmd) | Mermaid | How does a user enter, tune, save, cancel, and reset? |
| [State machine](minimal-editor-state-machine.mmd) | Mermaid | Which transitions are allowed for preview and persistence? |
| [Contract map](minimal-editor-contract-map.svg) | SVG | How do components, draft state, runtime, and persistence connect? |

The SVGs are intentionally static and source-controlled so they can render in
Markdown viewers without a Mermaid plugin. The `.mmd` files remain editable
sources for teams that want to render or extend the diagrams.

## HUD redesign review visuals

The broader review and redesign handoff is in
[HUD_REDESIGN_REVIEW.md](../HUD_REDESIGN_REVIEW.md). These visuals cover the
runtime HUD and its neighboring views; they do not authorize implementation.

| Visual | Format | Answers |
| --- | --- | --- |
| [View storyboard](hud-view-storyboard.svg) | SVG | What should the runtime, welcome, tuning, editor, and tray views feel like? |
| [User flows](hud-user-flows.svg) | SVG | How do first run, modes, pinning, editor, tray, and failure states connect? |
| [Mode map](hud-mode-map.svg) | SVG | Which content and controls belong to Zen, Basic, Advanced, Pinned, and Editor? |
| [Component contracts](hud-component-contracts.svg) | SVG | Which existing owner receives each proposed responsibility? |

## Reading order

1. Start with the [product design](../MINIMAL_EDITOR_DESIGN.md).
2. Scan the [layout board](minimal-editor-layout.svg) for responsive composition.
3. Follow the [user flow](minimal-editor-flow.mmd) for interaction boundaries.
4. Use the [state board](minimal-editor-states.svg) and [state machine](minimal-editor-state-machine.mmd) for state-complete behavior.
5. Finish with the [component contracts](../MINIMAL_EDITOR_COMPONENT_CONTRACTS.md) and [contract map](minimal-editor-contract-map.svg).
