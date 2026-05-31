// "Bir Ters Bir Düz" Ana Oyun Motoru (Canvas ve Fizik)

class GravityRunner {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Sanal Çözünürlük (Tüm ekranlarda aynı fizik davranışı için)
        this.vWidth = 1280;
        this.vHeight = 720;
        
        // Oyun Durumları
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
        
        // Fizik ve Karakter Parametreleri
        this.player = {
            x: 150,
            y: 500,
            width: 40,
            height: 48,
            vy: 0,
            gravityDir: 1, // 1: Aşağı, -1: Yukarı
            isGrounded: false,
            skinColor: '#00f3ff',
            trailPositions: [],
            rotation: 0
        };

        this.baseSpeed = 3.2; // Çok daha yavaş ve basit başlangıç hızı (varsayılan 3.6 idi)
        this.gameSpeed = this.baseSpeed;
        this.gravityForce = 0.48; // Hıza bağlı olarak dinamik güncellenecek
        this.maxFallSpeed = 16;
        
        // Oyun Nesneleri
        this.platforms = [];
        this.obstacles = []; // Dikenler ve dikey engeller
        this.coins = [];
        this.particles = [];
        
        // İlerleme ve Skor
        this.score = 0;
        this.coinsCollected = 0;
        this.runCoins = 0; // Bu turda toplanan altın
        this.distanceTimer = 0;
        this.isNewHighscore = false;
        
        // Platform Üretim Durumu
        this.lastPlatformX = 0;
        this.platformMinGap = 120;
        this.platformMaxGap = 250;
        
        // Ekran Sarsıntısı (Screen Shake)
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        
        // Sistem Ayarları (ui.js'den okunacak)
        this.quality = 'high';
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.bindControls();
        
        // Ana döngüyü başlat (sürekli arka planda çalışır, state'e göre çizim/güncelleme yapar)
        this.animate();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Retina / Yüksek DPI ekranlar için piksel oranını ayarla
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.imageSmoothingEnabled = true;
    }

    bindControls() {
        // Klavye Kontrolleri
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleAction();
            }
        });

        // Fare ve Dokunmatik Kontroller
        // HUD butonlarına tıklanıp tıklanmadığını kontrol etmek için pointerdown olayını kullanıyoruz
        window.addEventListener('pointerdown', (e) => {
            // Eğer tıklanan element bir buton veya menü paneli ise zıplamayı/ters-düzü tetikleme
            let target = e.target;
            while (target && target !== document.body) {
                if (target.classList.contains('hud-btn') || 
                    target.classList.contains('glass-panel') || 
                    target.tagName === 'BUTTON' || 
                    target.tagName === 'INPUT' || 
                    target.tagName === 'SELECT') {
                    return; // Oyuncu kontrolünü tetikleme
                }
                target = target.parentElement;
            }

            if (this.state === 'PLAYING') {
                this.handleAction();
            }
        });
    }

    handleAction() {
        if (this.state !== 'PLAYING') return;

        // "Bir Ters Bir Düz" kuralı: Sadece platforma temas ederken yerçekimi değiştirilebilir
        if (this.player.isGrounded) {
            this.player.gravityDir *= -1;
            this.player.isGrounded = false;
            window.gameAudio.playFlip();
            
            // Yerçekimi değişiminde patlama parçacıkları oluştur
            this.createFlipBurst();
            
            // Mobil cihaz ise hafifçe titreştir
            if (window.gameUI) {
                window.gameUI.vibrate(30);
            }
        }
    }

    // --- Oyun Başlatma / Durdurma Kontrolleri ---

    start() {
        // Ayarları yükle
        if (window.gameUI) {
            this.quality = window.gameUI.graphicsQuality;
        }

        // Oyun durumunu sıfırla
        this.state = 'PLAYING';
        this.score = 0;
        this.runCoins = 0;
        this.gameSpeed = this.baseSpeed;
        this.distanceTimer = 0;
        this.isNewHighscore = false;
        
        // Karakteri sıfırla
        const skin = window.gameShop.getActiveSkinDetails();
        this.player.x = 180;
        this.player.y = 300;
        this.player.vy = 0;
        this.player.gravityDir = 1;
        this.player.isGrounded = false;
        this.player.skinColor = skin.color;
        this.player.trailPositions = [];
        this.player.rotation = 0;

        // Listeleri boşalt
        this.platforms = [];
        this.obstacles = [];
        this.coins = [];
        this.particles = [];
        
        // Başlangıç Platformlarını Üret
        this.generateInitialPlatforms();
        
        // Müzik çalmaya başla
        window.gameAudio.startMusic();

        // Kılavuz ekranını göster
        if (window.gameUI) {
            window.gameUI.showTutorial();
        }
    }

    pause() {
        this.state = 'PAUSED';
        window.gameAudio.stopMusic();
    }

    resume() {
        this.state = 'PLAYING';
        window.gameAudio.startMusic();
    }

    stop() {
        this.state = 'MENU';
        window.gameAudio.stopMusic();
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.shakeScreen(30, 20); // Ekranı salla
        window.gameAudio.playDeath(); // Ölüm sesi
        window.gameAudio.stopMusic();
        
        // Kazanılan altınları ve rekoru kaydet
        window.gameShop.addCoins(this.runCoins);
        this.isNewHighscore = window.gameShop.updateHighscore(this.score);
        
        // Arayüzü güncelle
        if (window.gameUI) {
            window.gameUI.updateShopCoins();
            window.gameUI.showGameOver(this.score, this.runCoins, this.isNewHighscore);
        }
        
        // Ölüm patlaması parçacıkları oluştur
        this.createDeathExplosion();
    }

    // --- Harita ve Nesne Üretimi (Procedural Generation) ---

    generateInitialPlatforms() {
        // Başlangıçta oyuncunun altına uzun ve güvenli bir düz koridor yerleştir
        const firstZemin = { x: 0, y: 580, width: 1200, height: 140, type: 'bottom' };
        const firstTavan = { x: 0, y: 0, width: 1200, height: 140, type: 'top' };
        
        this.platforms.push(firstZemin);
        this.platforms.push(firstTavan);
        this.lastPlatformX = 1200;
    }

    generateChunk(targetX) {
        // Son platformun bittiği yerden itibaren yeni platformlar üret
        while (this.lastPlatformX < targetX) {
            // 5 farklı segment türünden birini rastgele seç (Segmentler kesinlikle geçilebilir tasarlanmıştır)
            const segmentType = Math.floor(this.randomRange(0, 5));
            
            switch (segmentType) {
                case 0:
                    this.generateStraightCorridor(this.lastPlatformX, 500);
                    this.lastPlatformX += 500;
                    break;
                case 1:
                    this.generateBottomGapSegment(this.lastPlatformX, 160, 340);
                    this.lastPlatformX += 500;
                    break;
                case 2:
                    this.generateTopGapSegment(this.lastPlatformX, 160, 340);
                    this.lastPlatformX += 500;
                    break;
                case 3:
                    this.generateSideSwitchSegment(this.lastPlatformX, 480);
                    this.lastPlatformX += 480;
                    break;
                case 4:
                    this.generateCenterFloatSegment(this.lastPlatformX, 520);
                    this.lastPlatformX += 520;
                    break;
            }
        }
    }

    // --- GEÇİLEBİLİR PLATFORM SEGMENTLERİ ---

    // 1. Düz Koridor (Hem zemin hem tavan aktif)
    generateStraightCorridor(startX, length) {
        this.platforms.push({ x: startX, y: 580, width: length, height: 140, type: 'bottom' });
        this.platforms.push({ x: startX, y: 0, width: length, height: 140, type: 'top' });

        // Obstacles (Obstacles are coordinated to never block both top & bottom at the same time!)
        this.spawnCoordinatedObstacles(startX, length, 'both');
        
        // Altınları zemin (535) veya tavan (185) yakınında çizerek karakterin temas etmesini sağla
        const spawnOnFloor = Math.random() > 0.5;
        this.spawnCoinsRow(startX, length, spawnOnFloor ? 535 : 185);
    }

    // 2. Alt Boşluk (Zeminde boşluk var, tavan dolu. Oyuncu tavana kaçmalı!)
    generateBottomGapSegment(startX, gapLength, platLength) {
        // Tavan tamamen kapalı
        this.platforms.push({ x: startX, y: 0, width: gapLength + platLength, height: 140, type: 'top' });
        // Zemin ise gapLength kadar boşluktan sonra başlar
        this.platforms.push({ x: startX + gapLength, y: 580, width: platLength, height: 140, type: 'bottom' });

        // Engel yerleşimi (Sadece üst kısma veya zemin bittikten sonrasına konabilir)
        this.spawnCoordinatedObstacles(startX + gapLength, platLength, 'both');
        
        // Altınlar boşluğu göstermek ve oyuncuyu yönlendirmek için kavisli (arc) yerleştirilir
        this.spawnCoinsArc(startX, gapLength);
    }

    // 3. Üst Boşluk (Tavanda boşluk var, zemin dolu. Oyuncu zemine inmeli!)
    generateTopGapSegment(startX, gapLength, platLength) {
        // Zemin tamamen kapalı
        this.platforms.push({ x: startX, y: 580, width: gapLength + platLength, height: 140, type: 'bottom' });
        // Tavan gapLength kadar boşluktan sonra başlar
        this.platforms.push({ x: startX + gapLength, y: 0, width: platLength, height: 140, type: 'top' });

        // Engel yerleşimi
        this.spawnCoordinatedObstacles(startX + gapLength, platLength, 'both');
        
        // Altınlar kavisli
        this.spawnCoinsArc(startX, gapLength, true);
    }

    // 4. Şerit Değiştirme (Zemin ve tavanın birbiri üzerine binerek bittiği kaydırmalı düzen)
    generateSideSwitchSegment(startX, length) {
        const overlap = 180; // 180px boyunca hem tavan hem zemin kapalı (Oyuncunun yerçekimi değiştirmek için güvenli penceresi)
        
        // Zemin overlap bittikten sonra kesilir
        this.platforms.push({ x: startX, y: 580, width: overlap, height: 140, type: 'bottom' });
        // Tavan ise startX'ten başlar ve tüm segment boyunca gider
        this.platforms.push({ x: startX, y: 0, width: length, height: 140, type: 'top' });
        // Zeminin devamı segmentin sonuna doğru yeniden başlar
        this.platforms.push({ x: startX + length - 120, y: 580, width: 120, height: 140, type: 'bottom' });

        // Engeller sadece tavanın üstüne, zeminin bittiği yerden sonrasına konabilir
        this.spawnCoordinatedObstacles(startX, overlap, 'bottom');
        this.spawnCoordinatedObstacles(startX + overlap + 40, length - overlap - 160, 'top');

        this.spawnCoinsRow(startX, overlap, 535); // Alt platform hizasında altınlar
        this.spawnCoinsRow(startX + overlap, length - overlap, 185); // Üst platform hizasında altınlar
    }

    // 5. Orta Yüzen Platform Düzeni
    generateCenterFloatSegment(startX, length) {
        const overlap = 120;
        
        // Zemin ve tavanı kes
        this.platforms.push({ x: startX, y: 580, width: overlap, height: 140, type: 'bottom' });
        this.platforms.push({ x: startX, y: 0, width: overlap, height: 140, type: 'top' });

        // Ortaya yüzen platform yerleştir
        this.platforms.push({ x: startX, y: 340, width: length - overlap, height: 40, type: 'center' });

        // Zemini ve tavanı segment sonunda yeniden başlat
        this.platforms.push({ x: startX + length - overlap, y: 580, width: overlap, height: 140, type: 'bottom' });
        this.platforms.push({ x: startX + length - overlap, y: 0, width: overlap, height: 140, type: 'top' });

        // Engeller sadece orta platforma konur
        this.spawnCoordinatedObstacles(startX + 50, length - overlap - 100, 'center');

        // Altınlar orta platform boyunca (yüzen zemin üstünde/altında) yerleştirilir
        const floatOnTop = Math.random() > 0.5;
        this.spawnCoinsRow(startX + overlap, length - overlap * 2, floatOnTop ? 340 - 30 : 380 + 30);
    }

    // --- ENGEL VE ALTIN KOORDİNASYON SİSTEMİ ---

    spawnCoordinatedObstacles(startX, length, allowedSides) {
        if (startX < 1200 || length < 150) return; // Başlangıçta engel koyma

        const difficulty = Math.min(this.score / 800, 1);
        // Engel sıklığını azaltarak oyunu daha basit ve keyifli hale getir
        const numObstacles = Math.random() < (0.12 + difficulty * 0.23) ? 1 : 0;
        
        if (numObstacles === 0) return;

        const obsX = startX + this.randomRange(50, length - 80);
        const isWall = Math.random() < (0.15 + difficulty * 0.2); // Zorluğa göre duvar olasılığı

        let side = allowedSides;
        if (allowedSides === 'both') {
            side = Math.random() > 0.5 ? 'top' : 'bottom';
        }

        if (side === 'bottom') {
            // Zemin engeli
            if (isWall) {
                this.obstacles.push({ x: obsX, y: 580 - 160, width: 32, height: 160, type: 'wall' });
            } else {
                this.obstacles.push({ x: obsX, y: 580 - 32, width: 36, height: 32, direction: 1, type: 'spike' });
            }
        } 
        else if (side === 'top') {
            // Tavan engeli
            if (isWall) {
                this.obstacles.push({ x: obsX, y: 140, width: 32, height: 160, type: 'wall' });
            } else {
                this.obstacles.push({ x: obsX, y: 140, width: 36, height: 32, direction: -1, type: 'spike' });
            }
        } 
        else if (side === 'center') {
            // Orta yüzen platform engeli (Sadece üstüne veya altına diken konur, asla duvar konmaz)
            const putOnTop = Math.random() > 0.5;
            this.obstacles.push({
                x: obsX,
                y: putOnTop ? 340 - 32 : 340 + 40,
                width: 34,
                height: 32,
                direction: putOnTop ? 1 : -1,
                type: 'spike'
            });
        }
    }

    spawnCoinsRow(startX, length, yCoord) {
        if (length < 100) return;
        const count = Math.floor(this.randomRange(1, 4));
        for (let i = 0; i < count; i++) {
            const coinX = startX + (length / (count + 1)) * (i + 1);
            this.coins.push({ x: coinX, y: yCoord, radius: 12, collected: false });
        }
    }

    spawnCoinsArc(startX, gapLength, invert = false) {
        // Hıza bağlı olarak karakterin zıplama (yerçekimi değişimi) yatay mesafesini tam olarak hesapla
        const estGravity = 0.28 + (this.gameSpeed * 0.06);
        // H = 350px (Zemin 535 ve Tavan 185 arasındaki uçuş mesafesi)
        const estTime = Math.sqrt(2 * 350 / estGravity); 
        const estDist = estTime * this.gameSpeed;

        const count = 3;
        const startY = invert ? 185 : 535;
        const endY = invert ? 535 : 185;

        // Altınların platform boşluğu dışına taşmaması için sınırı gapLength ile sınırla
        const arcLength = Math.min(estDist, gapLength + 100);

        for (let i = 0; i < count; i++) {
            const ratio = (i + 1) / (count + 1); // 0.25, 0.5, 0.75
            const coinX = startX + 20 + arcLength * ratio;
            
            // Fiziğe tam uyumlu parabolik eğri: y = startY + (endY - startY) * ratio^2
            const coinY = startY + (endY - startY) * ratio * ratio;
            
            this.coins.push({ x: coinX, y: coinY, radius: 12, collected: false });
        }
    }

    // --- Ekran Sarsıntısı Metotları ---

    shakeScreen(intensity, time) {
        this.shakeIntensity = intensity;
        this.shakeTime = time;
    }

    // --- Güncelleme Mantığı (Physics and Logic Update) ---

    update() {
        if (this.state !== 'PLAYING') return;

        // Zorluk ve Hız artışı (Çok yavaş hızlanma ve daha düşük maksimum hız)
        this.gameSpeed = this.baseSpeed + Math.min(this.score / 500, 4.0);

        // Hıza bağlı olarak yerçekimini güncelle (atlama yayını dengede tutar)
        this.gravityForce = 0.28 + (this.gameSpeed * 0.06);

        // Skor (Mesafe) Artışı (hıza bağlı gerçekçi mesafe hesabı)
        this.distanceTimer += this.gameSpeed * 0.018;
        if (this.distanceTimer >= 1) {
            const addedScore = Math.floor(this.distanceTimer);
            this.score += addedScore;
            this.distanceTimer -= addedScore;
            if (window.gameUI && window.gameUI.values.hudScore) {
                window.gameUI.values.hudScore.textContent = `${this.score}m`;
            }
        }

        // --- 1. KARAKTER FİZİĞİ ---
        // Yerçekimi kuvvetini uygula
        const ay = this.gravityForce * this.player.gravityDir;
        this.player.vy += ay;
        
        // Terminal hız sınırlaması
        if (Math.abs(this.player.vy) > this.maxFallSpeed) {
            this.player.vy = Math.sign(this.player.vy) * this.maxFallSpeed;
        }

        this.player.y += this.player.vy;
        
        // Karakterin dönüş animasyonunu güncelle (havadayken döner, zeminle temas edince düzleşir)
        if (!this.player.isGrounded) {
            // Dönüş açısını yerçekimi yönüne ve dikey hızına göre ayarla
            this.player.rotation += 0.08 * this.player.gravityDir;
        } else {
            // Yere yapışınca açıyı sıfırla veya ters çevir (180 derece)
            const targetRotation = this.player.gravityDir === 1 ? 0 : Math.PI;
            
            // Açıyı yavaşça hedef açıya yaklaştır
            let angleDiff = targetRotation - this.player.rotation;
            // Açı farkını [-PI, PI] aralığına normalize et
            angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
            this.player.rotation += angleDiff * 0.4;
        }

        // --- 2. HAREKETLİ NESNELERİ KAYDIR (Kaydırmalı Ekran) ---
        // Platformları kaydır
        this.platforms.forEach(p => p.x -= this.gameSpeed);
        // Engelleri kaydır
        this.obstacles.forEach(o => o.x -= this.gameSpeed);
        // Altınları kaydır
        this.coins.forEach(c => c.x -= this.gameSpeed);

        // Harita sonu sınırını da sola kaydır (Sonsuz harita döngüsü için kritik!)
        this.lastPlatformX -= this.gameSpeed;

        // Ekranda kalan/batan nesneleri temizle
        this.platforms = this.platforms.filter(p => p.x + p.width > -100);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > -100);
        this.coins = this.coins.filter(c => !c.collected && c.x + 30 > -100);

        // Yeni platformları üret
        this.generateChunk(this.vWidth + 600);

        // --- 3. ÇARPIŞMA ALGILAMA (Collisions) ---
        this.player.isGrounded = false;
        
        // Platform çarpışmaları
        this.platforms.forEach(p => {
            this.checkPlatformCollision(p);
        });

        // Ekranın en altına veya en üstüne düşme (Boşluğa düşme ölümü)
        if (this.player.y < -150 || this.player.y > this.vHeight + 150) {
            this.gameOver();
            return;
        }

        // Engel çarpışmaları (Ölüm kontrolü)
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.checkObstacleCollision(this.obstacles[i])) {
                this.gameOver();
                return;
            }
        }

        // Altın toplama çarpışmaları
        this.coins.forEach(c => {
            if (!c.collected && this.checkCoinCollision(c)) {
                c.collected = true;
                this.runCoins++;
                window.gameAudio.playCoin(); // Altın sesi
                this.createCoinSparkle(c.x, c.y);
                
                // HUD güncelle
                if (window.gameUI && window.gameUI.values.hudCoins) {
                    window.gameUI.values.hudCoins.textContent = this.runCoins;
                }
            }
        });

        // --- 4. EFEKTLER (Kuyruk & Parçacıklar) ---
        // Karakterin pozisyonunu kuyruk geçmişine ekle
        this.player.trailPositions.unshift({ x: this.player.x, y: this.player.y, rotation: this.player.rotation });
        if (this.player.trailPositions.length > 25) {
            this.player.trailPositions.pop();
        }

        // Koşma esnasında zemin kıvılcım parçacıkları üret
        if (this.player.isGrounded) {
            this.createRunSparks();
        }

        // Parçacıkları güncelle
        this.updateParticles();
    }

    checkPlatformCollision(p) {
        const pl = this.player;
        
        // Karakterin çarpışma kutusu (biraz daha daraltılmış, daha adil çarpışmalar için)
        const plLeft = pl.x + 4;
        const plRight = pl.x + pl.width - 4;
        
        // Platform sınırları
        const pLeft = p.x;
        const pRight = p.x + p.width;

        // Yatayda örtüşme var mı?
        if (plRight > pLeft && plLeft < pRight) {
            // YERÇEKİMİ AŞAĞI (Tabana Yapışma)
            if (pl.gravityDir === 1) {
                // Karakter platformun üstündeyse ve aşağı düşüyorsa
                if (pl.vy >= 0 && (pl.y + pl.height) >= p.y && (pl.y + pl.height - pl.vy) <= p.y + 18) {
                    pl.y = p.y - pl.height;
                    pl.vy = 0;
                    pl.isGrounded = true;
                }
            } 
            // YERÇEKİMİ YUKARI (Tavana Yapışma)
            else if (pl.gravityDir === -1) {
                // Karakter platformun altındaysa ve yukarı çekiliyorsa
                const pBottom = p.y + p.height;
                if (pl.vy <= 0 && pl.y <= pBottom && (pl.y - pl.vy) >= pBottom - 18) {
                    pl.y = pBottom;
                    pl.vy = 0;
                    pl.isGrounded = true;
                }
            }
        }
    }

    checkObstacleCollision(o) {
        const pl = this.player;
        // Çarpışma alanını daraltarak oyuncunun engellerin ucuna değmesini tolere et (Daha basit oynanış!)
        const plBox = {
            x: pl.x + 10,
            y: pl.y + 7,
            width: pl.width - 20,
            height: pl.height - 14
        };

        if (o.type === 'spike') {
            // Diken üçgen şeklinde olduğu için kutuyu daha hassas yapıyoruz
            const oBox = {
                x: o.x + 8,
                y: o.direction === 1 ? o.y + 8 : o.y,
                width: o.width - 16,
                height: o.height - 8
            };
            return this.rectsIntersect(plBox, oBox);
        } else {
            // Duvar
            const oBox = {
                x: o.x + 2,
                y: o.y,
                width: o.width - 4,
                height: o.height
            };
            return this.rectsIntersect(plBox, oBox);
        }
    }

    checkCoinCollision(c) {
        // Karakter merkezi
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        
        // İki nokta arasındaki mesafe formülü
        const dx = px - c.x;
        const dy = py - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Karakter yarıçapı yaklaşık 22px kabul edilirse
        return dist < (22 + c.radius);
    }

    rectsIntersect(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }

    // --- SÜSLÜ PARÇACIK EFEKTLERİ (PARADIGMS OF PARTICLES) ---

    createRunSparks() {
        const maxParticles = this.quality === 'high' ? 2 : (this.quality === 'medium' ? 1 : 0);
        if (maxParticles === 0) return;

        const activeSkin = window.gameShop.getActiveSkinDetails();
        const px = this.player.x + 10 + Math.random() * 20;
        
        // Parçacık Y koordinatı (Ayakların zemine temas ettiği yer)
        const py = this.player.gravityDir === 1 ? (this.player.y + this.player.height) : this.player.y;

        for (let i = 0; i < maxParticles; i++) {
            this.particles.push({
                x: px,
                y: py,
                vx: -this.gameSpeed * 0.3 + (Math.random() - 0.5) * 2,
                vy: -this.player.gravityDir * (1 + Math.random() * 2),
                color: activeSkin.color,
                size: this.randomRange(2, 4),
                life: 1.0,
                decay: this.randomRange(0.04, 0.08),
                type: activeSkin.particleType
            });
        }
    }

    createFlipBurst() {
        const count = this.quality === 'high' ? 25 : (this.quality === 'medium' ? 12 : 6);
        const activeSkin = window.gameShop.getActiveSkinDetails();
        const px = this.player.x + this.player.width / 2;
        const py = this.player.gravityDir === 1 ? this.player.y + this.player.height : this.player.y;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.randomRange(3, 8);
            this.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * speed - this.gameSpeed * 0.2,
                vy: Math.sin(angle) * speed * 0.4 + (this.player.gravityDir * 2), // Harekete yön ver
                color: activeSkin.color,
                size: this.randomRange(3, 6),
                life: 1.0,
                decay: this.randomRange(0.02, 0.05),
                type: 'ring'
            });
        }
    }

    createCoinSparkle(cx, cy) {
        const count = this.quality === 'low' ? 6 : 15;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.randomRange(2, 6);
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed - this.gameSpeed * 0.1,
                vy: Math.sin(angle) * speed,
                color: '#ffd700',
                size: this.randomRange(2.5, 5),
                life: 1.0,
                decay: this.randomRange(0.03, 0.07),
                type: 'star'
            });
        }
    }

    createDeathExplosion() {
        const count = this.quality === 'high' ? 60 : (this.quality === 'medium' ? 30 : 15);
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        const activeSkin = window.gameShop.getActiveSkinDetails();

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.randomRange(3, 11);
            this.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.35 ? activeSkin.color : '#ff0055', // Ana skin rengi + tehlike kırmızısı
                size: this.randomRange(4, 9),
                life: 1.0,
                decay: this.randomRange(0.015, 0.035),
                type: 'explosion'
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            // Fizik güncellemeleri
            p.x += p.vx;
            p.y += p.vy;
            
            // Farklı parçacık tiplerine göre hareket özellikleri
            if (p.type === 'fire') {
                p.vy -= 0.1; // Ateş yukarı uçar
                p.vx += (Math.random() - 0.5) * 0.2;
            } else if (p.type === 'matrix') {
                p.vy += 0.05; // Aşağı yavaşça süzülen kodlar
                p.vx = -this.gameSpeed * 0.8; // Ekran hızıyla kay
            } else if (p.type === 'gold') {
                p.vy += 0.03; // Hafif yerçekimi
                p.vx *= 0.96; // Sürtünme
                p.vy *= 0.96;
            }

            p.life -= p.decay;
        });

        // Ömrü biten parçacıkları sil
        this.particles = this.particles.filter(p => p.life > 0);
    }

    // --- ÇİZİM MANTIĞI (Renders Canvas Frames) ---

    draw() {
        // Ekranı temizle
        this.ctx.fillStyle = '#05060b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ekran sallantısını uygula
        this.ctx.save();
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
            this.shakeTime--;
        }

        // Sanal koordinat sistemini gerçek ekran boyutuna uyarla
        const scaleX = this.canvas.width / this.vWidth;
        const scaleY = this.canvas.height / this.vHeight;
        this.ctx.scale(scaleX, scaleY);

        // 1. ARKA PLAN DEKORU
        this.drawBackgroundDecor();

        // 2. PLATFORMLAR
        this.platforms.forEach(p => this.drawPlatform(p));

        // 3. ALTINLAR
        this.coins.forEach(c => this.drawCoin(c));

        // 4. ENGELLER (Dikenler ve Duvarlar)
        this.obstacles.forEach(o => this.drawObstacle(o));

        // 5. OYUNCU KUYRUĞU (TRAIL)
        if (this.state === 'PLAYING') {
            this.drawPlayerTrail();
        }

        // 6. OYUNCU (CHARACTER)
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.drawPlayer();
        }

        // 7. PARÇACIKLAR
        this.drawParticles();

        this.ctx.restore(); // Sarsıntı etkisini geri al
    }

    drawBackgroundDecor() {
        // İnce ufuk çizgileri veya neon süsler
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Çapraz siber çizgiler
        this.ctx.beginPath();
        this.ctx.moveTo(0, 140); this.ctx.lineTo(this.vWidth, 140);
        this.ctx.moveTo(0, 580); this.ctx.lineTo(this.vWidth, 580);
        this.ctx.stroke();
    }

    drawPlatform(p) {
        // Platformun kendisi (koyu siber blok)
        this.ctx.fillStyle = '#0f111e';
        this.ctx.fillRect(p.x, p.y, p.width, p.height);

        // Neon kenar çizgisi (Zemin üstü / tavan altı çizgileri)
        this.ctx.strokeStyle = '#2c3359';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p.x, p.y, p.width, p.height);

        // Aktif yüzey neon kaplaması
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 3;
        
        // Işıma (Glow) efekti
        this.ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
        this.ctx.shadowBlur = 8;
        
        this.ctx.beginPath();
        if (p.type === 'bottom') {
            // Zeminin en üst çizgisi parlar
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.width, p.y);
        } else if (p.type === 'top') {
            // Tavanın en alt çizgisi parlar
            this.ctx.moveTo(p.x, p.y + p.height);
            this.ctx.lineTo(p.x + p.width, p.y + p.height);
        } else {
            // Orta platformun hem üstü hem altı parlar
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.width, p.y);
            this.ctx.moveTo(p.x, p.y + p.height);
            this.ctx.lineTo(p.x + p.width, p.y + p.height);
        }
        this.ctx.stroke();
        
        // Gölgelendirmeyi temizle
        this.ctx.shadowBlur = 0;
    }

    drawObstacle(o) {
        this.ctx.save();

        if (o.type === 'spike') {
            // Neon kırmızı tehlike rengi
            this.ctx.fillStyle = '#ff007f';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            
            this.ctx.shadowColor = 'rgba(255, 0, 127, 0.6)';
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            if (o.direction === 1) {
                // Yukarı bakan diken (zeminde duran)
                this.ctx.moveTo(o.x, o.y + o.height); // Sol Alt
                this.ctx.lineTo(o.x + o.width / 2, o.y); // Tepe Noktası
                this.ctx.lineTo(o.x + o.width, o.y + o.height); // Sağ Alt
            } else {
                // Aşağı bakan diken (tavandan sarkan)
                this.ctx.moveTo(o.x, o.y); // Sol Üst
                this.ctx.lineTo(o.x + o.width / 2, o.y + o.height); // Tepe Noktası (aşağıda)
                this.ctx.lineTo(o.x + o.width, o.y); // Sağ Üst
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // Dikey Duvar Engeli (Siber Bariyer)
            const gradient = this.ctx.createLinearGradient(o.x, o.y, o.x + o.width, o.y);
            gradient.addColorStop(0, '#ff007f');
            gradient.addColorStop(0.5, '#ff5599');
            gradient.addColorStop(1, '#ff007f');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            
            this.ctx.shadowColor = 'rgba(255, 0, 127, 0.7)';
            this.ctx.shadowBlur = 12;

            // Köşeleri hafif yuvarlatılmış duvar çiz
            this.roundRect(o.x, o.y, o.width, o.height, 6);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Duvar içi siber çizgiler
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(o.x + 5, o.y + 15);
            this.ctx.lineTo(o.x + o.width - 5, o.y + 15);
            this.ctx.moveTo(o.x + 5, o.y + o.height - 15);
            this.ctx.lineTo(o.x + o.width - 5, o.y + o.height - 15);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawCoin(c) {
        this.ctx.save();
        
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        this.ctx.shadowBlur = 10;
        
        // Altın dış neon halkası
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Altın içi parlaması (yavaşça dönen yarım daire veya küçük çekirdek)
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, c.radius - 4, 0, Math.PI * 2);
        this.ctx.fill();

        // 8-bit parıltı işareti (merkezde '+' işareti)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(c.x - 3, c.y);
        this.ctx.lineTo(c.x + 3, c.y);
        this.ctx.moveTo(c.x, c.y - 3);
        this.ctx.lineTo(c.x, c.y + 3);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawPlayerTrail() {
        const trail = window.gameShop.getActiveTrailDetails();
        const pl = this.player;
        const trailLen = pl.trailPositions.length;
        
        if (trailLen < 2) return;

        this.ctx.save();

        if (trail.type === 'line' || trail.type === 'rainbow') {
            this.ctx.lineWidth = 14;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Saydamlık gradyanı oluştur
            for (let i = 0; i < trailLen - 1; i++) {
                const ratio = (trailLen - i) / trailLen; // 1.0 (en yeni) -> 0.0 (en eski)
                const alpha = ratio * 0.45;
                
                this.ctx.beginPath();
                this.ctx.moveTo(pl.trailPositions[i].x + pl.width / 2, pl.trailPositions[i].y + pl.height / 2);
                this.ctx.lineTo(pl.trailPositions[i+1].x + pl.width / 2, pl.trailPositions[i+1].y + pl.height / 2);
                
                if (trail.type === 'rainbow') {
                    // Adım dizinine göre gökkuşağı rengi hesapla
                    const hue = (i * 15) % 360;
                    this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                    this.ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
                } else {
                    // Klasik çizgi: karakter rengi
                    this.ctx.strokeStyle = pl.skinColor;
                    this.ctx.shadowColor = pl.skinColor;
                }
                
                this.ctx.lineWidth = 16 * ratio;
                this.ctx.shadowBlur = 8;
                this.ctx.stroke();
            }
        } 
        else if (trail.type === 'double') {
            // Çift paralel çizgi
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = pl.skinColor;
            this.ctx.strokeStyle = pl.skinColor;

            const offsets = [-14, 14]; // Yükseklik ofsetleri

            offsets.forEach(offset => {
                this.ctx.beginPath();
                for (let i = 0; i < trailLen; i++) {
                    const ratio = (trailLen - i) / trailLen;
                    const tx = pl.trailPositions[i].x + pl.width / 2;
                    // Dönüş açısına göre ofseti ayarla
                    const ty = pl.trailPositions[i].y + pl.height / 2 + offset * Math.cos(pl.trailPositions[i].rotation);
                    
                    if (i === 0) this.ctx.moveTo(tx, ty);
                    else this.ctx.lineTo(tx, ty);
                }
                this.ctx.stroke();
            });
        } 
        else if (trail.type === 'sparks') {
            // Kıvılcım kuyruk (Her karede hafifçe arkada rastgele sönen küçük kareler çizer)
            if (this.quality !== 'low' && Math.random() > 0.4) {
                const lastPos = pl.trailPositions[Math.min(5, trailLen - 1)];
                this.particles.push({
                    x: lastPos.x + pl.width / 2 + (Math.random() - 0.5) * 10,
                    y: lastPos.y + pl.height / 2 + (Math.random() - 0.5) * 10,
                    vx: -this.gameSpeed * 0.4 + (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 3,
                    color: pl.skinColor,
                    size: this.randomRange(2.5, 5),
                    life: 0.8,
                    decay: 0.05,
                    type: 'spark'
                });
            }
        }

        this.ctx.restore();
    }

    drawPlayer() {
        this.ctx.save();
        
        const pl = this.player;
        const activeSkin = window.gameShop.getActiveSkinDetails();

        // Çizim merkezini karakterin ortasına al
        this.ctx.translate(pl.x + pl.width / 2, pl.y + pl.height / 2);
        this.ctx.rotate(pl.rotation);

        // 1. NEON GLOW/IŞIMA EFEKTİ
        this.ctx.shadowColor = activeSkin.color;
        this.ctx.shadowBlur = 14;

        // 2. DIŞ NEON ZIRH (CYBER GÖVDE)
        this.ctx.fillStyle = '#121424'; // Koyu iç dolgu
        this.ctx.strokeStyle = activeSkin.color;
        this.ctx.lineWidth = 3;
        
        // Karakterimiz modern bir siber vizörlü kare/kapsül robot
        const w = pl.width;
        const h = pl.height;
        this.roundRect(-w / 2, -h / 2, w, h, 8);
        this.ctx.fill();
        this.ctx.stroke();

        // 3. VİZÖR (GÖZ/EKRAN PANELİ)
        // Karakterin yerçekimi yönüne ve hareketine göre göz paneli
        this.ctx.shadowBlur = 0; // Göz için ayrı parlama
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(2, -h / 2 + 10, w / 2 - 4, 8); // Vizör şeridi
        
        this.ctx.fillStyle = activeSkin.color;
        this.ctx.fillRect(8, -h / 2 + 10, 8, 8); // Göz odağı

        // 4. SKİNLERE ÖZEL DETAYLAR
        if (activeSkin.id === 'cyber_fire') {
            // Siber Ateş: Turuncu siber çizgiler
            this.ctx.strokeStyle = '#ffbb00';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 6, 0);
            this.ctx.lineTo(w / 2 - 6, 0);
            this.ctx.stroke();
        } 
        else if (activeSkin.id === 'matrix_code') {
            // Matrix: İnce yeşil dikey şerit
            this.ctx.fillStyle = 'rgba(57, 255, 20, 0.4)';
            this.ctx.fillRect(-4, -h / 2 + 20, 8, 20);
        }
        else if (activeSkin.id === 'plasma_purple') {
            // Plazma: Merkezde mor enerji çekirdeği
            this.ctx.fillStyle = '#b000ff';
            this.ctx.beginPath();
            this.ctx.arc(0, 8, 7, 0, Math.PI * 2);
            this.ctx.fill();
        }
        else if (activeSkin.id === 'golden_legend') {
            // Altın: Gövde üzerinde altın taç deseni
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.moveTo(-8, -4);
            this.ctx.lineTo(-4, 2);
            this.ctx.lineTo(0, -4);
            this.ctx.lineTo(4, 2);
            this.ctx.lineTo(8, -4);
            this.ctx.lineTo(8, 6);
            this.ctx.lineTo(-8, 6);
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawParticles() {
        this.ctx.save();
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            
            // Parlama efekti (sadece yüksek ayarlarda)
            if (this.quality === 'high') {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 6;
            }

            if (p.type === 'star') {
                // Yıldız şeklinde çizim
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'matrix') {
                // Kod kareleri
                this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 2);
            } else {
                // Normal kıvılcım (kare/daire)
                this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
        });
        this.ctx.restore();
    }

    // --- GENEL YARDIMCI METOTLAR (Utilities) ---

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Yuvarlatılmış köşeli dikdörtgen çizen yardımcı fonksiyon
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    // --- ANA OYUN DÖNGÜSÜ (Game Loop) ---

    animate() {
        // Fizikleri güncelle
        this.update();
        // Çerçeveyi çiz
        this.draw();
        
        // Bir sonraki kareyi planla
        requestAnimationFrame(() => this.animate());
    }
}

// Oyun nesnesini başlat ve pencereye ekle
window.gameInstance = new GravityRunner();
