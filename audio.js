// Web Audio API tabanlı Synth/Retro Ses ve Müzik Motoru

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.musicMuted = false;
        this.soundMuted = false;
        this.musicPlaying = false;
        
        // Müzik Sequencer Değişkenleri
        this.schedulerIntervalId = null;
        this.tempo = 110; // BPM
        this.noteLength = 0.15; // Saniye cinsinden her bir 16'lık nota süresi (60 / 110 / 4)
        this.nextNoteTime = 0.0;
        this.currentStep = 0;
        this.lookahead = 25.0; // Milisaniye cinsinden ne kadar ileriyi tarayacağı
        this.scheduleAheadTime = 0.1; // Saniye cinsinden ne kadar ileriyi planlayacağı
        
        // Master volume düğümleri
        this.musicGain = null;
        this.sfxGain = null;

        // Akor / Melodi Dizileri (Synthwave tarzı Am - C - G - F döngüsü)
        // Bass notaları (A1, C2, G1, F1)
        this.bassSequence = [
            'A1', 'A1', 'A1', 'A1', 'C2', 'C2', 'C2', 'C2',
            'G1', 'G1', 'G1', 'G1', 'F1', 'F1', 'F1', 'F1'
        ];
        
        // Melodi notaları (0: çalma, değerler frekans/nota)
        this.melodySequence = [
            'E4', '0', 'G4', 'A4', '0', 'E4', 'D4', '0',
            'C4', '0', 'E4', 'G4', '0', 'D4', 'C4', 'B3',
            'A3', 'C4', 'E4', 'A4', 'B4', 'G4', 'E4', '0',
            'C5', 'B4', 'A4', 'G4', 'A4', '0', '0', '0'
        ];

        // Nota-Frekans Eşleşmesi
        this.noteFreqs = {
            'A1': 55.00, 'A#1': 58.27, 'B1': 61.74, 'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83,
            'A2': 110.00, 'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
            'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
            'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        };

        // Kullanıcı ayarlarını yükle
        this.loadSettings();
    }

    // Audio context'i ilk dokunuşta başlatmak için
    init() {
        if (this.ctx) return;
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("Web Audio API bu tarayıcıda desteklenmiyor.");
            return;
        }

        this.ctx = new AudioContextClass();
        
        // Master Gain düğümleri
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.25, this.ctx.currentTime); // Müzik sesi biraz daha kısık arka planda

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.ctx.destination);
        this.sfxGain.gain.setValueAtTime(this.soundMuted ? 0 : 0.6, this.ctx.currentTime);
    }

    loadSettings() {
        const storedMusic = localStorage.getItem('musicMuted');
        const storedSound = localStorage.getItem('soundMuted');
        
        this.musicMuted = storedMusic === 'true';
        this.soundMuted = storedSound === 'true';
    }

    // --- SFX (Ses Efektleri) ---

    playClick() {
        this.init();
        if (this.soundMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playFlip() {
        this.init();
        if (this.soundMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        // Hızlı bir pitch-sweep (frekans yükselmesi/alçalması) yerçekimi hissi verir
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCoin() {
        this.init();
        if (this.soundMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Klasik retro 2-tonlu altın alma sesi (B5 -> E6)
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.setValueAtTime(0.3, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playDeath() {
        this.init();
        if (this.soundMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        
        // Düşük frekans patlama sesi (Gürültü simülasyonu + alçalan kare dalga)
        const osc = this.ctx.createOscillator();
        const noiseNode = this.createNoiseBufferNode();
        const oscGain = this.ctx.createGain();
        const noiseGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // 1. Synth patlaması (Alçalan perde)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.4);

        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        // 2. Beyaz Gürültü (Patlama hissi için)
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        if (noiseNode) {
            noiseNode.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            noiseNode.start(now);
            noiseNode.stop(now + 0.5);
        }

        osc.start(now);
        osc.stop(now + 0.4);
    }

    createNoiseBufferNode() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 saniye
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        return noiseNode;
    }

    // --- Müzik Sequencer (Sentezleyici Arka Plan Müziği) ---

    startMusic() {
        this.init();
        if (!this.ctx || this.musicPlaying) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.musicPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.currentStep = 0;
        
        // Sequencer döngüsünü başlat
        this.scheduler();
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.schedulerIntervalId) {
            clearTimeout(this.schedulerIntervalId);
            this.schedulerIntervalId = null;
        }
    }

    scheduler() {
        if (!this.musicPlaying) return;

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNextNote(this.currentStep, this.nextNoteTime);
            this.advanceStep();
        }

        this.schedulerIntervalId = setTimeout(() => this.scheduler(), this.lookahead);
    }

    advanceStep() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.noteLength = secondsPerBeat / 4; // 16'lık notalar
        
        this.nextNoteTime += this.noteLength;
        this.currentStep = (this.currentStep + 1) % 32; // 32 adımlık melodi döngüsü
    }

    scheduleNextNote(step, time) {
        // --- 1. BASS SYNTH ---
        // Bas her 16'lık adımda çalar
        const bassIndex = Math.floor(step / 2) % 16;
        const bassNote = this.bassSequence[bassIndex];
        const bassFreq = this.noteFreqs[bassNote];
        
        if (bassFreq && step % 2 === 0) { // Her 8'lik notada bir bas vur
            this.playBassSynth(bassFreq, time, this.noteLength * 1.8);
        }

        // --- 2. MELODİ SYNTH ---
        const melodyNote = this.melodySequence[step];
        if (melodyNote !== '0' && melodyNote !== undefined) {
            const melodyFreq = this.noteFreqs[melodyNote];
            if (melodyFreq) {
                // Rastgele bazı melodileri süsle
                this.playMelodySynth(melodyFreq, time, this.noteLength * 0.9);
            }
        }

        // --- 3. Hİ-HAT (Ritmik gürültü) ---
        // Adım 2, 6, 10, 14, 18, 22, 26, 30 hi-hat çalar (offbeats)
        if (step % 4 === 2) {
            this.playHiHat(time);
        }

        // --- 4. SNARE / KICK (Davul vuruşu) ---
        // 0, 8, 16, 24 adımlarında Kick, 4, 12, 20, 28 adımlarında Snare vur
        if (step % 8 === 0) {
            this.playKickDrum(time);
        } else if (step % 8 === 4) {
            this.playSnareDrum(time);
        }
    }

    playBassSynth(frequency, time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; // Yumuşak bas
        osc.frequency.setValueAtTime(frequency, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, time);
        filter.frequency.exponentialRampToValueAtTime(300, time + duration);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    playMelodySynth(frequency, time, duration) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Cyber/Retro hissi için çift testere dişi dalga (detuned saw)
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(frequency, time);
        osc1.detune.setValueAtTime(-8, time);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(frequency, time);
        osc2.detune.setValueAtTime(8, time);

        // Lowpass filtre ile tınıyı yumuşat
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(2500, time + duration * 0.5);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
    }

    playHiHat(time) {
        const source = this.createNoiseBufferNode();
        if (!source) return;

        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);

        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        source.start(time);
        source.stop(time + 0.04);
    }

    playKickDrum(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Hızlı frekans düşüşü (150Hz -> 40Hz) kick hissi verir
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.12);
    }

    playSnareDrum(time) {
        // Snare = Kısa bir gürültü + orta frekansta bir sinüs
        const noise = this.createNoiseBufferNode();
        if (!noise) return;

        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1000, time);

        noiseGain.gain.setValueAtTime(0.12, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.musicGain);

        // Sinüs gövdesi
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(100, time + 0.08);

        oscGain.gain.setValueAtTime(0.15, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.connect(oscGain);
        oscGain.connect(this.musicGain);

        noise.start(time);
        noise.stop(time + 0.1);
        osc.start(time);
        osc.stop(time + 0.08);
    }

    // --- Ayar Kontrolleri ---

    setMuteMusic(mute) {
        this.musicMuted = mute;
        localStorage.setItem('musicMuted', mute);
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(mute ? 0 : 0.25, this.ctx ? this.ctx.currentTime : 0);
        }
        if (!mute && !this.musicPlaying) {
            this.startMusic();
        }
    }

    setMuteSound(mute) {
        this.soundMuted = mute;
        localStorage.setItem('soundMuted', mute);
        if (this.sfxGain) {
            this.sfxGain.gain.setValueAtTime(mute ? 0 : 0.6, this.ctx ? this.ctx.currentTime : 0);
        }
    }
}

// Global olarak dışa aktar
window.gameAudio = new AudioEngine();
