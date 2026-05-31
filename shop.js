// Market Sistemi ve Veri Kayıt Yönetimi (Dil Seçeneği Destekli)

class ShopSystem {
    constructor() {
        this.coins = 0;
        this.highscore = 0;
        this.unlockedSkins = ['classic'];
        this.unlockedTrails = ['classic_line'];
        this.currentSkin = 'classic';
        this.currentTrail = 'classic_line';

        // Kostüm Listesi (Çift Dil Desteği)
        this.skins = {
            'classic': {
                id: 'classic',
                name: { tr: 'Neon Klasik', en: 'Neon Classic' },
                cost: 0,
                color: '#00f3ff', // Parlak Camgöbeği
                glowColor: 'rgba(0, 243, 255, 0.5)',
                particleType: 'spark',
                desc: { tr: 'Klasik siber koşucu.', en: 'The classic cyber runner.' }
            },
            'cyber_fire': {
                id: 'cyber_fire',
                name: { tr: 'Siber Ateş', en: 'Cyber Fire' },
                cost: 100,
                color: '#ff3300', // Ateş Turuncusu
                glowColor: 'rgba(255, 51, 0, 0.5)',
                particleType: 'fire',
                desc: { tr: 'Arkasında alevler bırakarak koşar.', en: 'Runs leaving a trail of fire.' }
            },
            'matrix_code': {
                id: 'matrix_code',
                name: { tr: 'Kuantum Yeşil', en: 'Quantum Green' },
                cost: 250,
                color: '#39ff14', // Matrix Yeşili
                glowColor: 'rgba(57, 255, 20, 0.5)',
                particleType: 'matrix',
                desc: { tr: 'Sanal gerçekliği bükebilen kod yığını.', en: 'A code stack that bends virtual reality.' }
            },
            'plasma_purple': {
                id: 'plasma_purple',
                name: { tr: 'Plazma Mor', en: 'Plasma Purple' },
                cost: 500,
                color: '#b000ff', // Plazma Moru
                glowColor: 'rgba(176, 0, 255, 0.5)',
                particleType: 'plasma',
                desc: { tr: 'Yüksek enerjili plazma kalkanı.', en: 'High energy plasma shield.' }
            },
            'golden_legend': {
                id: 'golden_legend',
                name: { tr: 'Altın Efsane', en: 'Golden Legend' },
                cost: 1000,
                color: '#ffd700', // Altın Sarısı
                glowColor: 'rgba(255, 215, 0, 0.5)',
                particleType: 'gold',
                desc: { tr: 'Şampiyonlar için saf altından zırh.', en: 'Armor forged of pure gold for champions.' }
            }
        };

        // Kuyruk Efektleri Listesi (Çift Dil Desteği)
        this.trails = {
            'classic_line': {
                id: 'classic_line',
                name: { tr: 'Klasik Çizgi', en: 'Classic Line' },
                cost: 0,
                type: 'line',
                desc: { tr: 'Standart takip çizgisi.', en: 'Standard tracking line.' }
            },
            'rainbow': {
                id: 'rainbow',
                name: { tr: 'Gökkuşağı', en: 'Rainbow' },
                cost: 150,
                type: 'rainbow',
                desc: { tr: 'Gökkuşağının tüm renkleri.', en: 'All the colors of the rainbow.' }
            },
            'sparks_trail': {
                id: 'sparks_trail',
                name: { tr: 'Kıvılcım Bulutu', en: 'Spark Cloud' },
                cost: 300,
                type: 'sparks',
                desc: { tr: 'Sürekli kıvılcım saçan kuyruk.', en: 'A trail constantly emitting sparks.' }
            },
            'double_pulse': {
                id: 'double_pulse',
                name: { tr: 'Çift Dalga', en: 'Double Wave' },
                cost: 600,
                type: 'double',
                desc: { tr: 'Paralel iki neon çizgi.', en: 'Two parallel neon lines.' }
            }
        };

        this.loadGameData();
    }

    loadGameData() {
        const storedCoins = localStorage.getItem('gr_coins');
        const storedHighscore = localStorage.getItem('gr_highscore');
        const storedSkins = localStorage.getItem('gr_unlocked_skins');
        const storedTrails = localStorage.getItem('gr_unlocked_trails');
        const storedCurSkin = localStorage.getItem('gr_current_skin');
        const storedCurTrail = localStorage.getItem('gr_current_trail');

        if (storedCoins !== null) this.coins = parseInt(storedCoins);
        if (storedHighscore !== null) this.highscore = parseInt(storedHighscore);
        
        if (storedSkins !== null) {
            try {
                this.unlockedSkins = JSON.parse(storedSkins);
            } catch (e) {
                this.unlockedSkins = ['classic'];
            }
        }
        
        if (storedTrails !== null) {
            try {
                this.unlockedTrails = JSON.parse(storedTrails);
            } catch (e) {
                this.unlockedTrails = ['classic_line'];
            }
        }

        if (storedCurSkin !== null && this.skins[storedCurSkin]) {
            this.currentSkin = storedCurSkin;
        }
        if (storedCurTrail !== null && this.trails[storedCurTrail]) {
            this.currentTrail = storedCurTrail;
        }
    }

    saveGameData() {
        localStorage.setItem('gr_coins', this.coins);
        localStorage.setItem('gr_highscore', this.highscore);
        localStorage.setItem('gr_unlocked_skins', JSON.stringify(this.unlockedSkins));
        localStorage.setItem('gr_unlocked_trails', JSON.stringify(this.unlockedTrails));
        localStorage.setItem('gr_current_skin', this.currentSkin);
        localStorage.setItem('gr_current_trail', this.currentTrail);
    }

    addCoins(amount) {
        this.coins += amount;
        this.saveGameData();
        return this.coins;
    }

    updateHighscore(newScore) {
        if (newScore > this.highscore) {
            this.highscore = newScore;
            this.saveGameData();
            return true;
        }
        return false;
    }

    buySkin(skinId) {
        const skin = this.skins[skinId];
        if (!skin) return { success: false, reason: 'not_found' };
        if (this.unlockedSkins.includes(skinId)) return { success: false, reason: 'already_unlocked' };

        if (this.coins >= skin.cost) {
            this.coins -= skin.cost;
            this.unlockedSkins.push(skinId);
            this.currentSkin = skinId;
            this.saveGameData();
            return { success: true };
        } else {
            return { success: false, reason: 'no_coins' };
        }
    }

    selectSkin(skinId) {
        if (this.unlockedSkins.includes(skinId)) {
            this.currentSkin = skinId;
            this.saveGameData();
            return true;
        }
        return false;
    }

    buyTrail(trailId) {
        const trail = this.trails[trailId];
        if (!trail) return { success: false, reason: 'not_found' };
        if (this.unlockedTrails.includes(trailId)) return { success: false, reason: 'already_unlocked' };

        if (this.coins >= trail.cost) {
            this.coins -= trail.cost;
            this.unlockedTrails.push(trailId);
            this.currentTrail = trailId;
            this.saveGameData();
            return { success: true };
        } else {
            return { success: false, reason: 'no_coins' };
        }
    }

    selectTrail(trailId) {
        if (this.unlockedTrails.includes(trailId)) {
            this.currentTrail = trailId;
            this.saveGameData();
            return true;
        }
        return false;
    }

    resetData() {
        this.coins = 0;
        this.highscore = 0;
        this.unlockedSkins = ['classic'];
        this.unlockedTrails = ['classic_line'];
        this.currentSkin = 'classic';
        this.currentTrail = 'classic_line';
        this.saveGameData();
    }

    getActiveSkinDetails() {
        return this.skins[this.currentSkin] || this.skins['classic'];
    }

    getActiveTrailDetails() {
        return this.trails[this.currentTrail] || this.trails['classic_line'];
    }
}

// Global olarak dışa aktar
window.gameShop = new ShopSystem();
