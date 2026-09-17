import type { BreathingPhase } from '../../shared/types/breathing.types';

export type AudioCuePhase = BreathingPhase['name'];

export interface AudioCueConfig {
  enabled: boolean;
  volume: number;
}

export interface AudioCueSink {
  setConfig(config: AudioCueConfig): void;
  playPhase(phase: BreathingPhase): void;
  stop(): void;
}

const GENERIC_AUDIO_ASSETS: Partial<Record<AudioCuePhase, string>> = {
  inhale: 'inhale.mp3',
  hold: 'bells.mp3',
  exhale: 'exhale.mp3',
};

const AIRWAY_AUDIO_ASSETS: Partial<Record<'nose-inhale' | 'mouth-exhale', string>> = {
  'nose-inhale': 'nose inhale.mp3',
  'mouth-exhale': 'mouth exhale.mp3',
};

function clampVolume(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}

/**
 * Local, transition-driven audio boundary for the breathing HUD.
 *
 * This service deliberately owns no timing. The breathing engine remains the
 * source of truth and calls playPhase once per deduplicated phase transition.
 */
export class AudioCueService implements AudioCueSink {
  private readonly cues = new Map<string, HTMLAudioElement>();
  private activeCue: HTMLAudioElement | null = null;
  private config: AudioCueConfig = { enabled: false, volume: 1 };
  private readonly assetBaseUrl: string;

  constructor(assetBaseUrl = 'audio/') {
    this.assetBaseUrl = assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`;
  }

  setConfig(config: AudioCueConfig): void {
    this.config = {
      enabled: Boolean(config.enabled),
      volume: clampVolume(config.volume),
    };

    if (!this.config.enabled) {
      this.stop();
    }
  }

  playPhase(phase: BreathingPhase): void {
    if (!this.config.enabled) return;

    this.stop();
    void this.playFirstAvailable(this.resolveAssetNames(phase), 0);
  }

  stop(): void {
    if (!this.activeCue) return;

    this.activeCue.pause();
    this.activeCue.currentTime = 0;
    this.activeCue = null;
  }

  private resolveAssetNames(phase: BreathingPhase): string[] {
    const genericAsset = GENERIC_AUDIO_ASSETS[phase.name];
    let specificAsset: string | undefined;

    if (phase.name === 'inhale' && phase.airway === 'nose') {
      specificAsset = AIRWAY_AUDIO_ASSETS['nose-inhale'];
    }
    if (phase.name === 'exhale' && phase.airway === 'mouth') {
      specificAsset = AIRWAY_AUDIO_ASSETS['mouth-exhale'];
    }

    return [specificAsset, genericAsset].filter(
      (assetName, index, assets): assetName is string => Boolean(assetName) && assets.indexOf(assetName) === index,
    );
  }

  private async playFirstAvailable(assetNames: string[], index: number): Promise<void> {
    if (!this.config.enabled || index >= assetNames.length) return;

    const assetName = assetNames[index];
    const cue = this.getCue(assetName);
    if (!cue) {
      await this.playFirstAvailable(assetNames, index + 1);
      return;
    }

    cue.volume = this.config.volume;
    cue.currentTime = 0;
    this.activeCue = cue;

    try {
      await cue.play();
    } catch (error) {
      // A missing specific asset may reject play; try the generic phase cue.
      if (this.activeCue === cue) {
        cue.pause();
        cue.currentTime = 0;
        this.activeCue = null;
      }
      if (index + 1 < assetNames.length) {
        await this.playFirstAvailable(assetNames, index + 1);
      } else {
        console.debug(`Breathing audio cue could not play: ${assetName}`, error);
      }
    }
  }

  private getCue(assetName: string): HTMLAudioElement | null {
    const existingCue = this.cues.get(assetName);
    if (existingCue) return existingCue;

    try {
      const cue = new Audio(`${this.assetBaseUrl}${encodeURIComponent(assetName)}`);
      cue.preload = 'auto';
      this.cues.set(assetName, cue);
      return cue;
    } catch (error) {
      console.debug(`Breathing audio asset unavailable: ${assetName}`, error);
      return null;
    }
  }
}
