import { AudioCueService } from '../audio-cue-service';
import type { BreathingPhase } from '../../../shared/types/breathing.types';

function phase(name: BreathingPhase['name'], airway?: BreathingPhase['airway']): BreathingPhase {
  return { name, duration: 1, intensity: 1, airway };
}

describe('AudioCueService', () => {
  const audioInstances: Array<{
    preload: string;
    volume: number;
    currentTime: number;
    play: jest.Mock<Promise<void>, []>;
    pause: jest.Mock<void, []>;
  }> = [];

  beforeEach(() => {
    audioInstances.length = 0;
    (globalThis as unknown as { Audio: jest.Mock }).Audio = jest.fn(() => {
      const instance = {
        preload: '',
        volume: 1,
        currentTime: 0,
        play: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
        pause: jest.fn<void, []>(),
      };
      audioInstances.push(instance);
      return instance;
    });
  });

  it('does not load or play cues while disabled', () => {
    const service = new AudioCueService();

    service.playPhase(phase('inhale'));

    expect(audioInstances).toHaveLength(0);
  });

  it('loads one local MP3 per phase and reuses the element', () => {
    const service = new AudioCueService('audio/');
    service.setConfig({ enabled: true, volume: 0.4 });

    service.playPhase(phase('inhale'));
    service.playPhase(phase('inhale'));

    expect(audioInstances).toHaveLength(1);
    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenCalledWith('audio/inhale.mp3');
    expect(audioInstances[0]?.preload).toBe('auto');
    expect(audioInstances[0]?.volume).toBe(0.4);
    expect(audioInstances[0]?.play).toHaveBeenCalledTimes(2);
  });

  it('stops the previous cue before starting the next phase', () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });

    service.playPhase(phase('inhale'));
    const firstCue = audioInstances[0]!;
    service.playPhase(phase('exhale', 'mouth'));

    expect(firstCue.pause).toHaveBeenCalledTimes(1);
    expect(audioInstances).toHaveLength(2);
  });

  it('resolves authored airway cues before generic phase cues', () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });

    service.playPhase(phase('inhale', 'nose'));
    service.playPhase(phase('exhale', 'mouth'));

    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenNthCalledWith(
      1,
      'audio/nose%20inhale.mp3',
    );
    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenNthCalledWith(
      2,
      'audio/mouth%20exhale.mp3',
    );
  });

  it('uses generic exhale when no airway-specific exhale is needed', () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });

    service.playPhase(phase('exhale'));

    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenCalledWith('audio/exhale.mp3');
  });

  it('falls back to the generic cue when a specific cue fails', async () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });
    const firstPlay = jest.fn<Promise<void>, []>().mockRejectedValue(new Error('missing specific asset'));
    const secondPlay = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
    (globalThis as unknown as { Audio: jest.Mock }).Audio
      .mockImplementationOnce(() => ({ preload: '', volume: 1, currentTime: 0, play: firstPlay, pause: jest.fn() }))
      .mockImplementationOnce(() => ({ preload: '', volume: 1, currentTime: 0, play: secondPlay, pause: jest.fn() }));

    service.playPhase(phase('exhale', 'mouth'));
    await Promise.resolve();
    await Promise.resolve();

    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenNthCalledWith(
      1,
      'audio/mouth%20exhale.mp3',
    );
    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenNthCalledWith(2, 'audio/exhale.mp3');
    expect(secondPlay).toHaveBeenCalledTimes(1);
  });

  it('uses bells for hold and the generic cue for exhale', () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });

    service.playPhase(phase('hold'));
    service.playPhase(phase('pause'));
    service.playPhase(phase('exhale'));

    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenCalledTimes(2);
    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenCalledWith('audio/bells.mp3');
    expect((globalThis as unknown as { Audio: jest.Mock }).Audio).toHaveBeenCalledWith('audio/exhale.mp3');
  });

  it('clamps volume and stops active playback when disabled', () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 3 });
    service.playPhase(phase('hold'));
    const cue = audioInstances[0]!;

    expect(cue.volume).toBe(1);
    service.setConfig({ enabled: false, volume: -1 });

    expect(cue.pause).toHaveBeenCalledTimes(1);
    expect(cue.currentTime).toBe(0);
  });

  it('tolerates a rejected play promise', async () => {
    const service = new AudioCueService();
    service.setConfig({ enabled: true, volume: 1 });
    (globalThis as unknown as { Audio: jest.Mock }).Audio.mockImplementationOnce(() => ({
      preload: '',
      volume: 1,
      currentTime: 0,
      play: jest.fn<Promise<void>, []>().mockRejectedValue(new Error('blocked')),
      pause: jest.fn<void, []>(),
    }));

    expect(() => service.playPhase(phase('pause'))).not.toThrow();
    await Promise.resolve();
  });
});
