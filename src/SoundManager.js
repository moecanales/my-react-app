class SoundManager {
    constructor() {
        // --- NEW: TRUE SINGLETON PATTERN ---
        // If the game engine tries to instantiate a new SoundManager after a restart,
        // it will just grab the persistent, already-unlocked instance.
        if (window.__globalSoundManagerInstance) {
            return window.__globalSoundManagerInstance;
        }
        window.__globalSoundManagerInstance = this;

        // THE SLEDGEHAMMER: Catch all MP3 objects (DOM and Off-DOM)
        if (typeof window.tutorialVolume === 'undefined') window.tutorialVolume = 0.8;
        if (!window.audioSledgehammerInstalled) {
            window.activeAudioElements = new Set();
            const originalPlay = HTMLAudioElement.prototype.play;
            HTMLAudioElement.prototype.play = function() {
                window.activeAudioElements.add(this);
                const isMusic = this.hasAttribute('loop') || (this.src && this.src.toLowerCase().includes('music'));
                if (isMusic) {
                    this.volume = (window.game && window.game.audio && window.game.audio.musicGain) ? window.game.audio.musicGain.gain.value : 0.4;
                } else {
                    this.volume = window.tutorialVolume;
                }
                this.addEventListener('ended', () => window.activeAudioElements.delete(this), {once: true});
                this.addEventListener('pause', () => window.activeAudioElements.delete(this), {once: true});
                return originalPlay.apply(this, arguments);
            };
            window.audioSledgehammerInstalled = true;
        }

        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.initialized = false;
        this.voiceAudio = null; 
        this.isVoicePaused = false; 
        this.voiceVolume = 0.8; 
        this.musicUnlocked = false; 

        // Task 12 & 13: Absolute path setup and Sledgehammer detection fix
        this.themeAudio = new Audio('/audio/theme.mp3');
        this.themeAudio.loop = true;
        this.themeAudio.setAttribute('loop', 'true'); // Fixes Sledgehammer detection
        this.themeAudio.volume = 0; // NEW: Born completely silent

        // --- NEW: GLOBAL BROWSER UNLOCKER ---
        // Forces the browser to lift the Autoplay Policy the second the user clicks ANYTHING.
        const globalUnlock = () => {
            if (!this.initialized) this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(e => console.warn("Audio resume deferred", e));
            }
            document.removeEventListener('pointerdown', globalUnlock);
            document.removeEventListener('click', globalUnlock);
        };
        document.addEventListener('pointerdown', globalUnlock);
        document.addEventListener('click', globalUnlock);
    }

    init() {
        // Safe return if already initialized, but verify context state
        if (this.initialized) {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            return;
        }
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // Master Node
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);

            // Channel: SFX
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.8; 
            this.sfxGain.connect(this.masterGain);

            // Channel: Music
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.4; // Background level
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
            console.log("Audio System Initialized");

            // --- Task 13: Silence the init() Method ---
            const isTutorialActive = window.game && window.game.tutorial && window.game.tutorial.isActive;

            if (isTutorialActive) {
                // Pre-crush volume to 0 instantly
                if (this.musicGain && this.ctx) this.musicGain.gain.value = 0;
                if (this.themeAudio) this.themeAudio.volume = 0;
            } else {
                // [Keep whatever existing logic normally starts the theme here]
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    setVoiceVolume(val) {
        this.voiceVolume = parseFloat(val);
        if (this.voiceAudio) {
            this.voiceAudio.volume = this.voiceVolume;
        }
    }

    // Task 12: Ensure synchronous update for both APIs
    setMusicVolume(val) {
        if (this.themeAudio) {
            this.themeAudio.volume = val;
        }
        if (this.musicGain && this.ctx) {
            try { this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime); } catch(e){}
            this.musicGain.gain.value = val; // Forces synchronous update
            this.musicGain.gain.setValueAtTime(val, this.ctx.currentTime);
        }
    }

    setSfxVolume(val) {
        if (this.sfxGain) this.sfxGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }

    // --- MUSIC PLAYBACK LOGIC ---

    // Task 13: The 50ms Delay Shield
    toggleThemeLoop(forceState = null) {
        const shouldPlay = forceState !== null ? forceState : this.themeAudio.paused;

        if (shouldPlay) {
            if (!this.isMuted) {
                // 1. HARD PRE-MUTE: Crush to 0 instantly
                if (this.musicGain && this.ctx) {
                    try { this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime); } catch(e){}
                    this.musicGain.gain.value = 0;
                }
                this.themeAudio.volume = 0;

                // 2. PLAY IN SILENCE: Start the track playing at 0 volume
                this.themeAudio.play().then(() => {

                    // 3. THE 50ms SHIELD: Wait for the UI and TutorialManager to finish their setup
                    setTimeout(() => {
                        const isTutorial = window.game && window.game.tutorial && window.game.tutorial.isActive;

                        // If 50ms have passed, the track hasn't been paused, AND it's a standard run,
                        // THEN we finally bring the volume up to 0.4.
                        if (!this.themeAudio.paused && !isTutorial) {
                            if (this.musicGain && this.ctx) {
                                this.musicGain.gain.value = 0.4;
                                this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
                            }
                            this.themeAudio.volume = 0.4;
                        }
                    }, 50);

                }).catch(e => {
                    console.error("AUDIO PLAY FAILED! Error:", e.message);
                });
            }
        } else {
            this.themeAudio.pause();
            // Lock it at 0 when paused to be absolutely safe
            if (this.musicGain && this.ctx) {
                try { this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime); } catch(e){}
                this.musicGain.gain.value = 0;
            }
            this.themeAudio.volume = 0;
        }
        return !this.themeAudio.paused;
    }

    // --- SFX (Connected to sfxGain) ---

    playClick() {
        // Custom Sine Click
        if (!this.initialized) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.17);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.72, this.ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.252, this.ctx.currentTime + 0.17);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.17);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 1.27);
    }

    playHover() {
        // High Pip (Approved Variant)
        this.playTone(1200, 'sine', 0.03, 0.05);
    }

    playCash() {
        // Register Style (Approved Variant)
        if (!this.initialized) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        this.playTone(1500, 'sine', 0.1, 0.3);
        setTimeout(() => this.playTone(2000, 'sine', 0.2, 0.3), 80);
    }

    playBuild() {
        // Steam Hiss (Approved Variant)
        this.playNoise(0.6, 0.5, 500); 
        setTimeout(() => this.playTone(600, 'triangle', 0.4, 0.2), 100);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.4);
        this.playTone(100, 'square', 0.3, 0.4);
    }

    playCardSlide() {
        // Filtered White Noise
        if (!this.initialized) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const duration = 0.15;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start();
    }

    playBaron() {
        this.playTone(100, 'triangle', 1.0, 0.4);
        this.playTone(150, 'triangle', 1.0, 0.3);
        setTimeout(() => this.playTone(120, 'sine', 1.0, 0.3), 100);
    }

    playWin() {
        // Original Fanfare
        [0, 200, 400, 600].forEach((delay, i) => {
            setTimeout(() => {
                const freq = 440 + (i * 110);
                this.playTone(freq, 'square', 0.5, 0.4);
            }, delay);
        });
    }

    // --- NEW: BARON REACTION AUDIO ---
    playRetroLaugh() {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const bursts = 4;
        for (let i = 0; i < bursts; i++) {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = 'square';
            osc.connect(gainNode);
            gainNode.connect(this.sfxGain);

            const startTime = this.ctx.currentTime + (i * 0.17);
            osc.frequency.setValueAtTime(400 - (i * 30), startTime);
            osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.12);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gainNode.gain.linearRampToValueAtTime(0, startTime + 0.12);

            osc.start(startTime);
            osc.stop(startTime + 0.12);
        }
    }

    playSadTrombone() {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const freqs = [300, 280, 260, 150]; 
        const times = [0, 0.4, 0.8, 1.2]; 
        const durations = [0.3, 0.3, 0.3, 1.2]; 

        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = 'sawtooth'; 
            osc.connect(gainNode);
            gainNode.connect(this.sfxGain);

            const startTime = this.ctx.currentTime + times[i];
            osc.frequency.setValueAtTime(freqs[i], startTime);
            if (i === 3) {
                osc.frequency.exponentialRampToValueAtTime(60, startTime + durations[i]);
            } else {
                osc.frequency.linearRampToValueAtTime(freqs[i] - 10, startTime + durations[i]);
            }

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05); 
            gainNode.gain.linearRampToValueAtTime(0, startTime + durations[i]);

            osc.start(startTime);
            osc.stop(startTime + durations[i]);
        }
    }

    playAngryGrowl() {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.sfxGain);

        const startTime = this.ctx.currentTime;
        const duration = 1.0;

        osc1.frequency.setValueAtTime(60, startTime);
        osc2.frequency.setValueAtTime(65, startTime);
        osc1.frequency.linearRampToValueAtTime(40, startTime + duration);
        osc2.frequency.linearRampToValueAtTime(45, startTime + duration);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); 

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
    }

    playSurpriseBoing() {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle'; 
        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);

        const startTime = this.ctx.currentTime;
        const duration = 0.5;

        osc.frequency.setValueAtTime(150, startTime);
        osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.2);
        osc.frequency.linearRampToValueAtTime(750, startTime + duration);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playAnnoyedGrunt() {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const osc = this.ctx.createOscillator(); 
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth'; 
        osc.connect(gain); 
        gain.connect(this.sfxGain);
        
        const start = this.ctx.currentTime;
        osc.frequency.setValueAtTime(160, start);
        osc.frequency.exponentialRampToValueAtTime(80, start + 0.3);
        
        gain.gain.setValueAtTime(0, start); 
        gain.gain.linearRampToValueAtTime(0.2, start + 0.03); 
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        
        osc.start(start); 
        osc.stop(start + 0.3);
    }

    // --- HELPERS ---
    playTone(freq, type, duration, vol = 1.0) {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, vol = 1.0, filterFreq = 1000) {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start();
    }

    // --- VOICEOVER METHODS ---
    playVoiceover(sceneId) {
        this.stopVoiceover(); 
        if (!this.initialized) this.init();
        if (!this.initialized || this.isMuted) return;

        try {
            // MATCHES SCREENSHOT: 4a/4b use 'tut_step_', everything else uses 'tut_scene_'
            let prefix = 'tut_scene_';
            if (sceneId === '4a' || sceneId === '4b') {
                prefix = 'tut_step_';
            }
            const path = `audio/voice/${prefix}${sceneId}.mp3`;
            
            this.voiceAudio = new Audio(path);
            
            // Catch 404s so the tutorial engine doesn't crash or hang
            this.voiceAudio.onerror = () => {
                console.warn(`[Audio Notice]: Missing voice file: ${path}. Step ID was: ${sceneId}`);
                this.voiceAudio = null;
            };

            this.voiceAudio.volume = this.voiceVolume; 
            
            if (!this.isVoicePaused) {
                this.voiceAudio.play().catch(e => {
                    if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
                        console.log("Audio playback deferred safely.");
                    }
                });
            }
        } catch (e) {
            console.warn("Critical Error playing voiceover:", e);
        }
    }

    toggleVoicePause() {
        this.isVoicePaused = !this.isVoicePaused;
        if (this.voiceAudio) {
            if (this.isVoicePaused) {
                this.voiceAudio.pause();
            } else {
                this.voiceAudio.play().catch(e => console.warn("Voiceover play failed:", e));
            }
        }
        return this.isVoicePaused;
    }

    stopVoiceover() {
        if (this.voiceAudio) {
            this.voiceAudio.pause();
            this.voiceAudio.currentTime = 0;
            this.voiceAudio = null;
        }
    }
}

window.SoundManager = SoundManager;
export default SoundManager;