// Menüler, Ayarlar ve Arayüz Yönetimi (Çift Dil Desteği)

class UIManager {
    constructor() {
        this.activeTab = 'skins'; // 'skins' veya 'trails'
        this.vibrateEnabled = true;
        this.graphicsQuality = 'high'; // 'low', 'medium', 'high'
        this.lang = 'tr'; // 'tr' veya 'en'
        this.pendingPaymentPack = null;
        
        // DOM Elementleri
        this.screens = {};
        this.buttons = {};
        this.inputs = {};
        this.values = {};

        // Dil Sözlüğü (Turkish & English)
        this.translations = {
            tr: {
                logoUpper: 'TERS DÜZ',
                logoLower: 'KOŞUCU',
                highScoreMenu: 'EN YÜKSEK SKOR: {val}m',
                btnPlay: 'OYNA',
                btnShop: 'MARKET',
                btnSettings: 'AYARLAR',
                lblMusic: 'Müzik',
                lblSound: 'Ses Efektleri',
                lblVibrate: 'Cihaz Titreşimi',
                lblQuality: 'Grafik Kalitesi',
                lblLanguage: 'Dil / Language',
                optHigh: 'Yüksek',
                optMedium: 'Orta',
                optLow: 'Düşük',
                btnReset: 'VERİLERİ SIFIRLA',
                btnBack: 'GERİ DÖN',
                titleSettings: 'AYARLAR',
                titleShop: 'SİBER MARKET',
                tabSkins: 'KOSTÜMLER',
                tabTrails: 'KUYRUK EFEKTLERİ',
                hudDistance: 'MESAFE',
                tutorialDesktop: 'YERÇEKİMİNİ DEĞİŞTİRMEK İÇİN <span class="key-cap">SPACE (BOŞLUK)</span> TUŞUNA VEYA <span class="key-cap">SOL TIKLA</span>',
                tutorialMobile: 'YERÇEKİMİNİ DEĞİŞTİRMEK İÇİN <span class="key-cap">EKRANA DOKUN</span>',
                titlePause: 'OYUN DURDURULDU',
                btnResume: 'DEVAM ET',
                btnRestart: 'YENİDEN BAŞLAT',
                btnQuit: 'ANA MENÜ',
                titleGameOver: 'SİSTEM DIŞI',
                statScore: 'Skor (Mesafe):',
                statCoins: 'Toplanan Altın:',
                newHighScore: 'YENİ EN YÜKSEK SKOR!',
                btnRetry: 'TEKRAR DENE',
                btnGameOverMain: 'ANA MENÜ',
                btnRevive: 'ANAHATAR KULLAN VE DEVAM ET ({val})',
                shopEquipped: 'KUŞANILDI',
                shopEquip: 'KUŞAN',
                buySuccess: 'Kostüm başarıyla satın alındı!',
                buySuccessTrail: 'Kuyruk efekti başarıyla satın alındı!',
                buyNoCoins: 'Yetersiz altın!',
                buyUnlocked: 'Zaten kilidi açık!',
                resetConfirm: 'Tüm ilerlemeniz, altınlarınız ve rekorlarınız silinecek. Emin misiniz?',
                resetAlert: 'Tüm veriler sıfırlandı.',
                tabKeys: 'ANAHTARLAR',
                lblReviveAd: 'REKLAM İZLE VE CANLAN',
                paymentTitle: 'SİBER SATIN ALIM',
                paymentConfirm: 'ÖDEMEYİ ONAYLA',
                paymentCancel: 'İPTAL ET',
                paymentSuccess: 'Siber satın alım başarılı! {val} Anahtar eklendi.',
                adStatusWatching: 'Siber Reklam İzleniyor... Lütfen bekleyin.',
                adStatusFinished: 'Reklam bitti! Canlanma hakkı kazanıldı.',
                keyPack1: '1 Canlandırma Anahtarı',
                keyPack5: '5 Canlandırma Anahtarı',
                keyPack10: '10 Canlandırma Anahtarı',
                keyPack100: '100 Canlandırma Anahtarı',
                keyPackDesc: 'Ölünce kaldığınız yerden devam etmenizi sağlar.'
            },
            en: {
                logoUpper: 'GRAVITY',
                logoLower: 'RUNNER',
                highScoreMenu: 'HIGH SCORE: {val}m',
                btnPlay: 'PLAY',
                btnShop: 'SHOP',
                btnSettings: 'SETTINGS',
                lblMusic: 'Music',
                lblSound: 'Sound Effects',
                lblVibrate: 'Device Vibration',
                lblQuality: 'Graphics Quality',
                lblLanguage: 'Language / Dil',
                optHigh: 'High',
                optMedium: 'Medium',
                optLow: 'Low',
                btnReset: 'RESET DATA',
                btnBack: 'BACK',
                titleSettings: 'SETTINGS',
                titleShop: 'CYBER SHOP',
                tabSkins: 'SKINS',
                tabTrails: 'TRAIL EFFECTS',
                hudDistance: 'DISTANCE',
                tutorialDesktop: 'PRESS <span class="key-cap">SPACE</span> OR <span class="key-cap">LEFT CLICK</span> TO SWITCH GRAVITY',
                tutorialMobile: '<span class="key-cap">TAP SCREEN</span> TO SWITCH GRAVITY',
                titlePause: 'GAME PAUSED',
                btnResume: 'RESUME',
                btnRestart: 'RESTART',
                btnQuit: 'MAIN MENU',
                titleGameOver: 'SYSTEM OFFLINE',
                statScore: 'Score (Distance):',
                statCoins: 'Coins Collected:',
                newHighScore: 'NEW HIGH SCORE!',
                btnRetry: 'RETRY',
                btnGameOverMain: 'MAIN MENU',
                btnRevive: 'USE KEY AND CONTINUE ({val})',
                shopEquipped: 'EQUIPPED',
                shopEquip: 'EQUIP',
                buySuccess: 'Skin purchased successfully!',
                buySuccessTrail: 'Trail effect purchased successfully!',
                buyNoCoins: 'Not enough coins!',
                buyUnlocked: 'Already unlocked!',
                resetConfirm: 'All your progress, coins and highscores will be deleted. Are you sure?',
                resetAlert: 'All data has been reset.',
                tabKeys: 'KEYS',
                lblReviveAd: 'WATCH AD AND REVIVE',
                paymentTitle: 'CYBER PURCHASE',
                paymentConfirm: 'CONFIRM PAYMENT',
                paymentCancel: 'CANCEL',
                paymentSuccess: 'Cyber purchase successful! {val} Keys added.',
                adStatusWatching: 'Watching Cyber Ad... Please wait.',
                adStatusFinished: 'Ad completed! Revive reward granted.',
                keyPack1: '1 Revive Key',
                keyPack5: '5 Revive Keys',
                keyPack10: '10 Revive Keys',
                keyPack100: '100 Revive Keys',
                keyPackDesc: 'Allows you to continue from where you died.'
            }
        };
        
        // DOM tamamen yüklendiğinde başlat
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.cacheDOM();
        this.loadSettings();
        this.bindEvents();
        this.applyLanguage(); // Dil metinlerini arayüze uygula
    }

    cacheDOM() {
        // Ekranlar
        const screenIds = ['main-menu', 'shop-menu', 'settings-menu', 'pause-menu', 'game-over-menu', 'ad-screen-overlay', 'payment-modal-overlay'];
        screenIds.forEach(id => {
            this.screens[id] = document.getElementById(id);
        });
        
        this.hudOverlay = document.getElementById('game-hud');
        this.tutorialOverlay = document.getElementById('tutorial-overlay');

        // Butonlar
        this.buttons = {
            play: document.getElementById('btn-play'),
            shop: document.getElementById('btn-shop'),
            settings: document.getElementById('btn-settings'),
            shopBack: document.getElementById('btn-shop-back'),
            settingsBack: document.getElementById('btn-settings-back'),
            resetData: document.getElementById('btn-reset-data'),
            pause: document.getElementById('btn-pause'),
            resume: document.getElementById('btn-resume'),
            pauseRestart: document.getElementById('btn-pause-restart'),
            pauseQuit: document.getElementById('btn-pause-quit'),
            retry: document.getElementById('btn-retry'),
            gameOverMain: document.getElementById('btn-game-over-main'),
            revive: document.getElementById('btn-revive'),
            reviveAd: document.getElementById('btn-revive-ad'),
            confirmPayment: document.getElementById('btn-confirm-payment'),
            cancelPayment: document.getElementById('btn-cancel-payment'),
            tabSkins: document.getElementById('tab-skins'),
            tabTrails: document.getElementById('tab-trails'),
            tabKeys: document.getElementById('tab-keys')
        };

        // Girdiler / Ayarlar
        this.inputs = {
            music: document.getElementById('toggle-music'),
            sound: document.getElementById('toggle-sound'),
            vibrate: document.getElementById('toggle-vibrate'),
            quality: document.getElementById('select-quality'),
            language: document.getElementById('select-language')
        };

        // Dinamik Değer Alanları
        this.values = {
            menuHighscore: document.getElementById('val-menu-highscore'),
            shopCoins: document.getElementById('val-shop-coins'),
            hudScore: document.getElementById('val-hud-score'),
            hudCoins: document.getElementById('val-hud-coins'),
            hudKeys: document.getElementById('val-hud-keys'),
            overScore: document.getElementById('val-over-score'),
            overCoins: document.getElementById('val-over-coins'),
            newHighscore: document.getElementById('new-highscore-badge'),
            shopContainer: document.getElementById('shop-items-container'),
            adCountdown: document.getElementById('ad-countdown'),
            adProgressBar: document.getElementById('ad-progress-bar'),
            adStatus: document.getElementById('ad-status'),
            paymentTitle: document.getElementById('payment-title'),
            paymentDesc: document.getElementById('payment-desc'),
            paymentPrice: document.getElementById('payment-price')
        };
    }

    loadSettings() {
        // Dil Ayarı
        const storedLang = localStorage.getItem('gr_lang');
        this.lang = storedLang === null ? 'tr' : storedLang;
        if (this.inputs.language) this.inputs.language.value = this.lang;

        // Titreşim ayarı
        const storedVibrate = localStorage.getItem('gr_vibrate');
        this.vibrateEnabled = storedVibrate === null ? true : storedVibrate === 'true';
        if (this.inputs.vibrate) this.inputs.vibrate.checked = this.vibrateEnabled;

        // Grafik Kalitesi ayarı
        const storedQuality = localStorage.getItem('gr_quality');
        this.graphicsQuality = storedQuality === null ? 'high' : storedQuality;
        if (this.inputs.quality) this.inputs.quality.value = this.graphicsQuality;

        // Müzik / Ses (AudioEngine zaten kendi yüklüyor)
        if (this.inputs.music) this.inputs.music.checked = !window.gameAudio.musicMuted;
        if (this.inputs.sound) this.inputs.sound.checked = !window.gameAudio.soundMuted;
    }

    applyLanguage() {
        const t = this.translations[this.lang];
        
        // Ana Menü
        document.querySelector('.logo-text-upper').textContent = t.logoUpper;
        document.querySelector('.logo-text-lower').textContent = t.logoLower;
        this.updateMenuHighscore();
        
        this.buttons.play.innerHTML = `<span class="btn-icon">▶</span> ` + t.btnPlay;
        this.buttons.shop.innerHTML = `<span class="btn-icon">🛒</span> ` + t.btnShop;
        this.buttons.settings.innerHTML = `<span class="btn-icon">⚙️</span> ` + t.btnSettings;

        // Settings Panel
        document.querySelector('#settings-menu h2').textContent = t.titleSettings;
        document.querySelector('label[for="toggle-music"]').textContent = t.lblMusic;
        document.querySelector('label[for="toggle-sound"]').textContent = t.lblSound;
        document.querySelector('label[for="toggle-vibrate"]').textContent = t.lblVibrate;
        document.getElementById('lbl-quality').textContent = t.lblQuality;
        document.getElementById('lbl-language').textContent = t.lblLanguage;
        document.getElementById('opt-q-high').textContent = t.optHigh;
        document.getElementById('opt-q-medium').textContent = t.optMedium;
        document.getElementById('opt-q-low').textContent = t.optLow;
        this.buttons.resetData.textContent = t.btnReset;
        this.buttons.settingsBack.textContent = t.btnBack;

        // Shop Panel
        document.querySelector('.shop-header h2').textContent = t.titleShop;
        this.buttons.tabSkins.textContent = t.tabSkins;
        this.buttons.tabTrails.textContent = t.tabTrails;
        this.buttons.tabKeys.textContent = t.tabKeys;
        this.buttons.shopBack.textContent = t.btnBack;

        // HUD
        document.querySelector('.hud-score-box .hud-label').textContent = t.hudDistance;
        document.querySelector('#tutorial-overlay .desktop-text').innerHTML = t.tutorialDesktop;
        document.querySelector('#tutorial-overlay .mobile-text').innerHTML = t.tutorialMobile;

        // Pause Menu
        document.querySelector('#pause-menu h2').textContent = t.titlePause;
        this.buttons.resume.textContent = t.btnResume;
        this.buttons.pauseRestart.textContent = t.btnRestart;
        this.buttons.pauseQuit.textContent = t.btnQuit;

        // Game Over Menu
        document.querySelector('#game-over-menu h1').textContent = t.titleGameOver;
        document.querySelector('#game-over-menu .stat-row:first-child span:first-child').textContent = t.statScore;
        document.querySelector('#game-over-menu .stat-row:last-child span:first-child').textContent = t.statCoins;
        this.values.newHighscore.textContent = t.newHighScore;
        this.buttons.retry.textContent = t.btnRetry;
        this.buttons.gameOverMain.textContent = t.btnGameOverMain;
        
        // Market kartlarını da yeniden çiz
        if (this.screens['shop-menu'].classList.contains('active')) {
            this.renderShopItems();
        }
    }

    bindEvents() {
        // --- Ekran Geçişleri ---
        this.buttons.play.addEventListener('click', () => {
            this.playClickSound();
            window.gameAudio.init(); // Mobil için audio context tetikle
            this.showScreen(null); // Tüm UI ekranlarını kapat
            this.hudOverlay.classList.add('active');
            this.updateHUDKeys();
            
            // Oyunu başlat
            if (window.gameInstance) {
                window.gameInstance.start();
            }
        });

        this.buttons.shop.addEventListener('click', () => {
            this.playClickSound();
            this.updateShopCoins();
            this.renderShopItems();
            this.showScreen('shop-menu');
        });

        this.buttons.settings.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen('settings-menu');
        });

        this.buttons.shopBack.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen('main-menu');
        });

        this.buttons.settingsBack.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen('main-menu');
        });

        // --- Ayarlar Değişiklikleri ---
        this.inputs.music.addEventListener('change', (e) => {
            window.gameAudio.init();
            window.gameAudio.setMuteMusic(!e.target.checked);
            this.playClickSound();
        });

        this.inputs.sound.addEventListener('change', (e) => {
            window.gameAudio.init();
            window.gameAudio.setMuteSound(!e.target.checked);
            this.playClickSound();
        });

        this.inputs.vibrate.addEventListener('change', (e) => {
            this.vibrateEnabled = e.target.checked;
            localStorage.setItem('gr_vibrate', this.vibrateEnabled);
            this.playClickSound();
            this.vibrate(50);
        });

        this.inputs.quality.addEventListener('change', (e) => {
            this.graphicsQuality = e.target.value;
            localStorage.setItem('gr_quality', this.graphicsQuality);
            this.playClickSound();
        });

        this.inputs.language.addEventListener('change', (e) => {
            this.lang = e.target.value;
            localStorage.setItem('gr_lang', this.lang);
            this.playClickSound();
            this.applyLanguage();
        });

        this.buttons.resetData.addEventListener('click', () => {
            const t = this.translations[this.lang];
            if (confirm(t.resetConfirm)) {
                window.gameShop.resetData();
                this.loadSettings();
                this.updateMenuHighscore();
                this.updateShopCoins();
                window.gameAudio.playDeath();
                this.vibrate(300);
                alert(t.resetAlert);
                this.showScreen('main-menu');
            }
        });

        // --- Market Sekme Geçişleri ---
        this.buttons.tabSkins.addEventListener('click', () => {
            if (this.activeTab !== 'skins') {
                this.activeTab = 'skins';
                this.buttons.tabSkins.classList.add('active');
                this.buttons.tabTrails.classList.remove('active');
                this.buttons.tabKeys.classList.remove('active');
                this.playClickSound();
                this.renderShopItems();
            }
        });

        this.buttons.tabTrails.addEventListener('click', () => {
            if (this.activeTab !== 'trails') {
                this.activeTab = 'trails';
                this.buttons.tabTrails.classList.add('active');
                this.buttons.tabSkins.classList.remove('active');
                this.buttons.tabKeys.classList.remove('active');
                this.playClickSound();
                this.renderShopItems();
            }
        });

        this.buttons.tabKeys.addEventListener('click', () => {
            if (this.activeTab !== 'keys') {
                this.activeTab = 'keys';
                this.buttons.tabKeys.classList.add('active');
                this.buttons.tabSkins.classList.remove('active');
                this.buttons.tabTrails.classList.remove('active');
                this.playClickSound();
                this.renderShopItems();
            }
        });

        // --- Oyun İçi Kontroller ---
        this.buttons.pause.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playClickSound();
            if (window.gameInstance && window.gameInstance.state === 'PLAYING') {
                window.gameInstance.pause();
                this.showScreen('pause-menu');
            }
        });

        this.buttons.resume.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen(null);
            if (window.gameInstance) {
                window.gameInstance.resume();
            }
        });

        this.buttons.pauseRestart.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen(null);
            if (window.gameInstance) {
                window.gameInstance.start();
            }
        });

        this.buttons.pauseQuit.addEventListener('click', () => {
            this.playClickSound();
            this.hudOverlay.classList.remove('active');
            this.showScreen('main-menu');
            this.updateMenuHighscore();
            if (window.gameInstance) {
                window.gameInstance.stop();
            }
        });

        // --- Oyun Bitti Butonları ---
        this.buttons.retry.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen(null);
            if (window.gameInstance) {
                window.gameInstance.start();
            }
        });

        this.buttons.gameOverMain.addEventListener('click', () => {
            this.playClickSound();
            this.hudOverlay.classList.remove('active');
            this.showScreen('main-menu');
            this.updateMenuHighscore();
            if (window.gameInstance) {
                window.gameInstance.stop();
            }
        });

        this.buttons.revive.addEventListener('click', () => {
            if (window.gameInstance && window.gameShop.useKey()) {
                this.playClickSound();
                this.vibrate(100);
                this.showScreen(null);
                this.hudOverlay.classList.add('active');
                this.updateHUDKeys();
                window.gameInstance.revive(); // Oyunu canlandır
            }
        });

        this.buttons.reviveAd.addEventListener('click', () => {
            this.playClickSound();
            this.startSimulatedAd();
        });

        this.buttons.confirmPayment.addEventListener('click', () => {
            this.playClickSound();
            this.completeSimulatedPayment();
        });

        this.buttons.cancelPayment.addEventListener('click', () => {
            this.playClickSound();
            this.showScreen(null);
            this.showScreen('shop-menu');
        });
    }

    // --- Ekran Yönetimi Yardımcı Metotları ---

    showScreen(screenId) {
        // Tüm ekranları gizle
        Object.keys(this.screens).forEach(id => {
            if (this.screens[id]) {
                this.screens[id].classList.remove('active');
            }
        });

        // Belirtilen ekranı göster
        if (screenId && this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
        }
    }

    updateMenuHighscore() {
        if (this.values.menuHighscore) {
            const highscore = window.gameShop.highscore;
            const text = this.translations[this.lang].highScoreMenu;
            const badgeSpan = document.querySelector('.highscore-badge span');
            if (badgeSpan) {
                badgeSpan.innerHTML = text.replace('{val}', `<strong id="val-menu-highscore">${highscore}</strong>`);
            }
        }
    }

    updateShopCoins() {
        if (this.values.shopCoins) {
            this.values.shopCoins.textContent = window.gameShop.coins;
        }
    }

    // --- Market Öğelerini Listeleme ---

    renderShopItems() {
        const container = this.values.shopContainer;
        if (!container) return;
        
        container.innerHTML = ''; // Temizle
        const t = this.translations[this.lang];

        if (this.activeTab === 'skins') {
            // Kostümleri Listele
            const skins = window.gameShop.skins;
            Object.keys(skins).forEach(key => {
                const skin = skins[key];
                const card = document.createElement('div');
                card.className = `shop-card ${window.gameShop.currentSkin === skin.id ? 'selected' : ''}`;
                
                // Kostüm rengi önizlemesi
                let previewHTML = `
                    <div class="card-preview" style="color: ${skin.color}">
                        <div class="card-preview-inner" style="background-color: ${skin.color}; box-shadow: 0 0 12px ${skin.glowColor};"></div>
                    </div>
                `;

                // Satın Alma Durumu ve Buton Metni
                let btnHTML = '';
                if (window.gameShop.currentSkin === skin.id) {
                    btnHTML = `<button class="btn-buy selected-btn">${t.shopEquipped}</button>`;
                } else if (window.gameShop.unlockedSkins.includes(skin.id)) {
                    btnHTML = `<button class="btn-buy unlocked">${t.shopEquip}</button>`;
                } else {
                    btnHTML = `<button class="btn-buy locked">🪙 ${skin.cost}</button>`;
                }

                card.innerHTML = `
                    ${previewHTML}
                    <div class="card-name">${skin.name[this.lang]}</div>
                    <div class="card-desc">${skin.desc[this.lang]}</div>
                    ${btnHTML}
                `;

                // Kart Tıklama veya Buton Tıklama Olayı
                const btn = card.querySelector('.btn-buy');
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleSkinAction(skin.id);
                });

                container.appendChild(card);
            });
        } else if (this.activeTab === 'trails') {
            // Kuyruk Efektlerini Listele
            const trails = window.gameShop.trails;
            const currentSkinDetails = window.gameShop.getActiveSkinDetails();
            
            Object.keys(trails).forEach(key => {
                const trail = trails[key];
                const card = document.createElement('div');
                card.className = `shop-card ${window.gameShop.currentTrail === trail.id ? 'selected' : ''}`;
                
                // Kuyruk tipi önizlemesi
                let previewHTML = `<div class="card-trail-preview ${trail.type}" style="--primary-neon: ${currentSkinDetails.color}"></div>`;

                let btnHTML = '';
                if (window.gameShop.currentTrail === trail.id) {
                    btnHTML = `<button class="btn-buy selected-btn">${t.shopEquipped}</button>`;
                } else if (window.gameShop.unlockedTrails.includes(trail.id)) {
                    btnHTML = `<button class="btn-buy unlocked">${t.shopEquip}</button>`;
                } else {
                    btnHTML = `<button class="btn-buy locked">🪙 ${trail.cost}</button>`;
                }

                card.innerHTML = `
                    ${previewHTML}
                    <div class="card-name">${trail.name[this.lang]}</div>
                    <div class="card-desc">${trail.desc[this.lang]}</div>
                    ${btnHTML}
                `;

                const btn = card.querySelector('.btn-buy');
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleTrailAction(trail.id);
                });

                container.appendChild(card);
            });
        } else if (this.activeTab === 'keys') {
            // Anahtar Paketlerini Listele
            const packs = [
                { id: 'key_pack_1', name: t.keyPack1, cost: "5 TL", val: 1 },
                { id: 'key_pack_5', name: t.keyPack5, cost: "20 TL", val: 5 },
                { id: 'key_pack_10', name: t.keyPack10, cost: "35 TL", val: 10 },
                { id: 'key_pack_100', name: t.keyPack100, cost: "250 TL", val: 100 }
            ];
            
            packs.forEach(pack => {
                const card = document.createElement('div');
                card.className = `shop-card key-pack-card`;
                
                let previewHTML = `
                    <div class="card-preview" style="color: #00f3ff">
                        <div style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.4)); margin-top: 10px;">🔑<span style="font-size: 1.2rem; font-weight: 900; margin-left: 2px;">x${pack.val}</span></div>
                    </div>
                `;
                
                card.innerHTML = `
                    ${previewHTML}
                    <div class="card-name">${pack.name}</div>
                    <div class="card-desc">${t.keyPackDesc}</div>
                    <button class="btn-buy normal">${pack.cost}</button>
                `;
                
                const btn = card.querySelector('.btn-buy');
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.triggerPayment(pack.id);
                });
                
                container.appendChild(card);
            });
        }
    }

    handleSkinAction(skinId) {
        const t = this.translations[this.lang];
        if (window.gameShop.unlockedSkins.includes(skinId)) {
            // Zaten açıksa kuşan
            window.gameShop.selectSkin(skinId);
            this.playClickSound();
        } else {
            // Satın almayı dene
            const result = window.gameShop.buySkin(skinId);
            if (result.success) {
                window.gameAudio.playCoin(); // Satın alma sesi
                this.vibrate(100);
                alert(t.buySuccess);
            } else {
                window.gameAudio.playDeath(); // Başarısızlık sesi
                alert(result.reason === 'no_coins' ? t.buyNoCoins : t.buyUnlocked);
            }
        }
        this.updateShopCoins();
        this.renderShopItems();
    }

    handleTrailAction(trailId) {
        const t = this.translations[this.lang];
        if (window.gameShop.unlockedTrails.includes(trailId)) {
            window.gameShop.selectTrail(trailId);
            this.playClickSound();
        } else {
            const result = window.gameShop.buyTrail(trailId);
            if (result.success) {
                window.gameAudio.playCoin();
                this.vibrate(100);
                alert(t.buySuccessTrail);
            } else {
                window.gameAudio.playDeath();
                alert(result.reason === 'no_coins' ? t.buyNoCoins : t.buyUnlocked);
            }
        }
        this.updateShopCoins();
        this.renderShopItems();
    }

    // --- Diğer Yardımcı Metotlar ---

    playClickSound() {
        window.gameAudio.playClick();
    }

    vibrate(duration) {
        if (this.vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    updateHUDKeys() {
        if (this.values.hudKeys) {
            this.values.hudKeys.textContent = window.gameShop.keys;
        }
    }

    showGameOver(score, coins, isNewHighscore) {
        if (this.values.overScore) this.values.overScore.textContent = `${score}m`;
        if (this.values.overCoins) this.values.overCoins.textContent = coins;
        
        if (isNewHighscore) {
            this.values.newHighscore.classList.remove('hidden');
        } else {
            this.values.newHighscore.classList.add('hidden');
        }

        // Anahtar ve reklam ile canlandırma butonlarını kontrol et
        const hasKeys = window.gameShop.keys > 0;
        const usedAd = window.gameInstance ? window.gameInstance.usedAdReviveThisRun : false;
        const reviveSec = document.getElementById('revive-section');
        
        if (reviveSec) {
            const btnKeyRevive = this.buttons.revive;
            const btnAdRevive = this.buttons.reviveAd;
            let showSection = false;
            
            if (hasKeys) {
                btnKeyRevive.classList.remove('hidden');
                const lblRevive = document.getElementById('lbl-revive-btn-text');
                if (lblRevive) {
                    const trText = this.translations[this.lang].btnRevive;
                    lblRevive.textContent = trText.replace('{val}', window.gameShop.keys);
                }
                showSection = true;
            } else {
                btnKeyRevive.classList.add('hidden');
            }
            
            if (!usedAd) {
                btnAdRevive.classList.remove('hidden');
                const lblAdText = document.getElementById('lbl-revive-ad-text');
                if (lblAdText) {
                    lblAdText.textContent = this.translations[this.lang].lblReviveAd;
                }
                showSection = true;
            } else {
                btnAdRevive.classList.add('hidden');
            }
            
            if (showSection) {
                reviveSec.classList.remove('hidden');
            } else {
                reviveSec.classList.add('hidden');
            }
        }

        this.hudOverlay.classList.remove('active');
        this.showScreen('game-over-menu');
        this.vibrate([150, 100, 150]);
    }

    showTutorial() {
        if (this.tutorialOverlay) {
            // Yeniden tetiklemek için animasyonu sıfırlayalım
            this.tutorialOverlay.style.animation = 'none';
            this.tutorialOverlay.offsetHeight; // Reflow tetikle
            this.tutorialOverlay.style.animation = null;
            this.tutorialOverlay.classList.remove('hidden');
            
            // 3.5 saniye sonra gizleme sınıfını ekleyelim (CSS animasyonu 3s + 0.5s payı)
            setTimeout(() => {
                this.tutorialOverlay.classList.add('hidden');
            }, 3500);
        }
    }

    startSimulatedAd() {
        // Reklam ekranını aç
        this.showScreen('ad-screen-overlay');
        
        const t = this.translations[this.lang];
        this.values.adStatus.textContent = t.adStatusWatching;
        
        // Progress barı doldur
        this.values.adProgressBar.style.width = '0%';
        this.values.adProgressBar.offsetHeight; // Force reflow
        this.values.adProgressBar.style.width = '100%';
        
        let count = 5;
        this.values.adCountdown.textContent = count;
        
        const adInterval = setInterval(() => {
            count--;
            this.values.adCountdown.textContent = count;
            if (count <= 0) {
                clearInterval(adInterval);
                this.values.adStatus.textContent = t.adStatusFinished;
                
                setTimeout(() => {
                    this.showScreen(null); // Reklam ekranını kapat
                    this.hudOverlay.classList.add('active');
                    this.updateHUDKeys();
                    
                    // Canlanmayı başlat
                    if (window.gameInstance) {
                        window.gameInstance.usedAdReviveThisRun = true;
                        window.gameInstance.revive();
                    }
                }, 600);
            }
        }, 1000);
    }

    triggerPayment(packId) {
        this.pendingPaymentPack = packId;
        const t = this.translations[this.lang];
        
        let desc = "";
        let price = "";
        if (packId === 'key_pack_1') {
            desc = t.keyPack1 + " - " + t.keyPackDesc;
            price = "5.00 TL";
        } else if (packId === 'key_pack_5') {
            desc = t.keyPack5 + " - " + t.keyPackDesc;
            price = "20.00 TL";
        } else if (packId === 'key_pack_10') {
            desc = t.keyPack10 + " - " + t.keyPackDesc;
            price = "35.00 TL";
        } else if (packId === 'key_pack_100') {
            desc = t.keyPack100 + " - " + t.keyPackDesc;
            price = "250.00 TL";
        }
        
        this.values.paymentDesc.textContent = desc;
        this.values.paymentPrice.textContent = price;
        this.values.paymentTitle.textContent = t.paymentTitle;
        this.buttons.confirmPayment.textContent = t.paymentConfirm;
        this.buttons.cancelPayment.textContent = t.paymentCancel;
        
        this.showScreen('payment-modal-overlay');
    }

    completeSimulatedPayment() {
        if (!this.pendingPaymentPack) return;
        
        let keysToAdd = 0;
        if (this.pendingPaymentPack === 'key_pack_1') keysToAdd = 1;
        else if (this.pendingPaymentPack === 'key_pack_5') keysToAdd = 5;
        else if (this.pendingPaymentPack === 'key_pack_10') keysToAdd = 10;
        else if (this.pendingPaymentPack === 'key_pack_100') keysToAdd = 100;
        
        window.gameShop.addKeys(keysToAdd);
        window.gameAudio.playCoin(); // Ödeme onay sesi
        this.vibrate(150);
        
        const t = this.translations[this.lang];
        alert(t.paymentSuccess.replace('{val}', keysToAdd));
        
        this.pendingPaymentPack = null;
        this.updateHUDKeys();
        this.updateShopCoins();
        this.showScreen('shop-menu');
        this.renderShopItems();
    }
}

// Global olarak dışa aktar
window.gameUI = new UIManager();
