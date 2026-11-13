import { BGM_FILE } from "../data/assetManifest";

export class AudioService {
  private enabled = true;
  private started = false;

  constructor(private readonly audio: HTMLAudioElement | null) {
    if (!audio) return;
    audio.src = BGM_FILE;
    audio.loop = true;
    audio.volume = 0.28;
    audio.setAttribute("playsinline", "");
    audio.preload = "none";
  }

  async startFromUserGesture(): Promise<void> {
    if (!this.audio || !this.enabled) return;
    try {
      await this.audio.play();
      this.started = true;
    } catch {
      // iOS Safari may defer playback; the explicit audio control remains available.
    }
  }

  async toggle(): Promise<boolean> {
    if (!this.audio) return false;
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.audio.pause();
      return false;
    }
    await this.startFromUserGesture();
    return this.enabled;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get isStarted(): boolean {
    return this.started;
  }
}
