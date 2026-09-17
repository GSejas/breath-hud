import { SystemEditor } from '../system-editor';

function mountEditorFixture(): HTMLElement {
  document.body.innerHTML = `
    <div id="editor-shell" aria-hidden="true" inert>
      <h1 id="editor-title">Minimal editor</h1>
      <div id="editor-preview" data-state="success">
        <div id="editor-preview-frame" class="preview-hud frame-glass">
          <div id="editor-preview-shape" data-shape="circle" tabindex="0"></div>
          <div id="editor-preview-phase"></div>
          <div id="editor-preview-instruction"></div>
          <div id="editor-preview-nostrils" hidden><span id="editor-preview-left-nostril"></span><span id="editor-preview-right-nostril"></span></div>
          <div id="editor-stage-progress"></div>
          <div id="editor-preview-summary"></div>
        </div>
        <div data-preview-message></div>
        <div id="editor-preview-pattern-name"></div>
       <div id="editor-preview-shape-name"></div>
       <div id="editor-card-shape-name"></div>
       <div id="editor-position-pattern-name"></div>
       <div id="editor-position-shape-name"></div>
      </div>
      <div id="editor-shape-type"></div>
      <div id="editor-pattern-type"></div>
      <div id="editor-theme-name"></div>
      <div id="editor-position"></div>
      <div id="editor-save-status"></div>
      <button data-editor-save type="button">Save</button>
      <select id="editor-shape"></select>
      <select id="editor-pattern"></select>
      <select id="editor-theme"></select>
      <input id="editor-intensity" type="range" />
      <input id="editor-base" type="range" />
      <input id="editor-inhale" type="range" />
      <input id="editor-exhale" type="range" />
      <input id="editor-size" type="range" />
      <span id="editor-intensity-value"></span>
      <span id="editor-base-value"></span>
      <span id="editor-inhale-value"></span>
      <span id="editor-exhale-value"></span>
      <span id="editor-size-value"></span>
      <button data-frame="glass" type="button"></button>
      <button data-frame="outline" type="button"></button>
      <button data-preview-state="success" type="button"></button>
      <button data-preview-state="error" type="button"></button>
      <button data-editor-close type="button">Cancel</button>
      <button data-editor-reset type="button">Reset</button>
    </div>
  `;
  return document.getElementById('editor-shell') as HTMLElement;
}

describe('SystemEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    mountEditorFixture();
    (window as any).electronAPI = undefined;
  });

  it('opens with a deterministic preview and shared catalog options', () => {
    const editor = new SystemEditor(document.getElementById('editor-shell') as HTMLElement);
    editor.initialize();

    expect(document.body.classList.contains('editor-open')).toBe(true);
    expect((document.getElementById('editor-pattern') as HTMLSelectElement).options.length).toBeGreaterThan(1);
    expect(document.getElementById('editor-preview-instruction')?.textContent).toBe('Inhale');
    expect(document.querySelectorAll('#editor-stage-progress > span')).toHaveLength(2);
  });

  it('projects nostril semantics and preview state changes', () => {
    const editor = new SystemEditor(document.getElementById('editor-shell') as HTMLElement);
    editor.initialize();

    const pattern = document.getElementById('editor-pattern') as HTMLSelectElement;
    pattern.value = 'alternate-nostril';
    pattern.dispatchEvent(new Event('change'));

    expect(document.getElementById('editor-preview-instruction')?.textContent).toBe('Inhale through left nostril');
    expect(document.getElementById('editor-preview-nostrils')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelectorAll('#editor-stage-progress > span')).toHaveLength(6);

    (document.querySelector('[data-preview-state="error"]') as HTMLButtonElement).click();
    expect(document.getElementById('editor-preview')?.getAttribute('data-state')).toBe('error');
    expect(document.querySelector('[data-preview-state="error"]')?.getAttribute('aria-checked')).toBe('true');
  });

  it('supports keyboard-safe shape nudging and local save', async () => {
    const editor = new SystemEditor(document.getElementById('editor-shell') as HTMLElement);
    editor.initialize();

    const shape = document.getElementById('editor-preview-shape') as HTMLElement;
    shape.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.getElementById('editor-position')?.textContent).toBe('5, 0');

    (document.querySelector('[data-editor-save]') as HTMLButtonElement).click();
    await Promise.resolve();
    expect(localStorage.getItem('breathingHudConfig')).toContain('"shapePosition":{"x":5,"y":0}');
  });

  it('supports arrow-key navigation within preview-state radios', () => {
    const editor = new SystemEditor(document.getElementById('editor-shell') as HTMLElement);
    editor.initialize();

    const ready = document.querySelector('[data-preview-state="success"]') as HTMLButtonElement;
    ready.focus();
    ready.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    const error = document.querySelector('[data-preview-state="error"]') as HTMLButtonElement;
    expect(document.activeElement).toBe(error);
    expect(error.getAttribute('aria-checked')).toBe('true');
  });

  it('keeps the previous persisted draft when the bridge rejects a save', async () => {
    const previous = JSON.stringify({ shapeId: 'circle', patternId: 'zen-simple', themeId: 'ocean' });
    localStorage.setItem('breathingHudConfig', previous);
    (window as any).electronAPI = {
      saveEditorDraft: jest.fn().mockResolvedValue({ success: false }),
    };

    const editor = new SystemEditor(document.getElementById('editor-shell') as HTMLElement);
    editor.initialize();
    (document.getElementById('editor-intensity') as HTMLInputElement).value = '0.9';
    document.getElementById('editor-intensity')?.dispatchEvent(new Event('input'));
    (document.querySelector('[data-editor-save]') as HTMLButtonElement).click();
    await Promise.resolve();
    await Promise.resolve();

    expect(localStorage.getItem('breathingHudConfig')).toBe(previous);
    expect(document.getElementById('editor-save-status')?.textContent).toContain('Save failed');
  });
});
