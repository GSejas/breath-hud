import { ThemeController } from '../theme-controller';

describe('ThemeController', () => {
  let controller: ThemeController;

  beforeEach(() => {
    controller = new ThemeController();
    document.documentElement.style.cssText = '';
  });

  describe('theme switching', () => {
    it('should switch to ocean theme', () => {
      controller.switchTheme('ocean');
      expect(controller.getCurrentTheme()).toBe('ocean');
    });

    it('should switch to forest theme', () => {
      controller.switchTheme('forest');
      expect(controller.getCurrentTheme()).toBe('forest');
    });

    it('should warn on invalid theme', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      controller.switchTheme('invalid');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('theme variables', () => {
    it('should apply CSS variables', () => {
      controller.switchTheme('ocean');
      const primary = document.documentElement.style.getPropertyValue('--theme-primary');
      expect(primary).toBeTruthy();
    });

    it('should have ocean theme colors', () => {
      const vars = controller.getThemeVariables('ocean');
      expect(vars?.primary).toBe('#0ea5e9');
    });
  });

  describe('available themes', () => {
    it('should list all themes', () => {
      const themes = controller.getAvailableThemes();
      expect(themes.length).toBeGreaterThan(0);
    });
  });
});
