// =========================================================
// 0. ЯЗЫК: СОХРАНЕНИЕ И ВЫПАДАЮЩЕЕ МЕНЮ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('zoroLang') || 'ru';
    applyLanguage(savedLang);

    const langToggle = document.querySelector('.lang-toggle');
    const langMenu = document.querySelector('.lang-menu');

    if (langToggle && langMenu) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            langMenu.classList.remove('active');
        });

        langMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                localStorage.setItem('zoroLang', lang);
                applyLanguage(lang);
                langMenu.classList.remove('active');
                langToggle.textContent = btn.textContent;
                document.querySelectorAll('.lang-menu button').forEach(b => b.classList.remove('active-lang'));
                btn.classList.add('active-lang');
            });
        });
    }

    function applyLanguage(lang) {
        const elements = document.querySelectorAll(
            '.hero-quote, .section-subtitle, h2, h3, p, .btn, .counter-label, .footer-copy p, ' +
            '.info, .relation, .quote, .ship-card p, .theory-card p, .meme-card p, .award-item p, .hero-subtitle, ' +
            '.exclusive-section p, .exclusive-section li, .family-tree p, .family-tree li'
        );
        elements.forEach(el => {
            const text = el.textContent;
            fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
                )
                .then(r => r.json())
                .then(data => {
                    if (data && data[0]) {
                        el.textContent = data[0][0][0];
                    }
                })
                .catch(() => {});
        });
    }
});

// =========================================================
// 1. ЭКСКЛЮЗИВНЫЙ РАЗДЕЛ (клик на ZORO в шапке)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    const exclusive = document.querySelector('.exclusive-section');

    if (logo && exclusive) {
        logo.addEventListener('click', () => {
            exclusive.classList.toggle('active');
            if (exclusive.classList.contains('active')) {
                exclusive.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
});

// =========================================================
// 2. ТЕМЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('zoroTheme') || 'mixed';
    applyTheme(savedTheme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            localStorage.setItem('zoroTheme', theme);
            applyTheme(theme);
            document.querySelectorAll('.theme-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.theme === theme);
            });
        });
    });
});

function applyTheme(theme) {
    if (theme === 'mixed') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', theme);
    }
}

// =========================================================
// 3. РЕГИСТРАЦИЯ/ВХОД
// =========================================================
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('zoroUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }

    document.querySelector('.auth-btn')?.addEventListener('click', () => {
        if (currentUser) {
            if (confirm('Выйти из аккаунта?')) {
                currentUser = null;
                localStorage.removeItem('zoroUser');
                updateAuthUI();
            }
            return;
        }
        const username = prompt('Введите имя пользователя:');
        if (!username) return;
        const password = prompt('Введите пароль:');
        if (!password) return;
        const users = JSON.parse(localStorage.getItem('zoroUsers') || '{}');
        if (users[username] && users[username] !== password) {
            alert('Неверный пароль!');
            return;
        }
        users[username] = password;
        localStorage.setItem('zoroUsers', JSON.stringify(users));
        currentUser = { username, password };
        localStorage.setItem('zoroUser', JSON.stringify(currentUser));
        updateAuthUI();
        alert('Добро пожаловать, ' + username + '!');
    });
});

function updateAuthUI() {
    const btn = document.querySelector('.auth-btn');
    if (!btn) return;
    btn.textContent = currentUser ? '👤 ' + currentUser.username : '🔑 Войти';
}

// =========================================================
// 4. СЧЁТЧИКИ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.counter-number').forEach(c => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const target = parseInt(c.dataset.target);
                let current = 0;
                const timer = setInterval(() => {
                    current += target / 100;
                    if (current >= target) {
                        c.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        c.textContent = Math.floor(current).toLocaleString();
                    }
                }, 20);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        observer.observe(c);
    });
});

// =========================================================
// 5. 3D-НАКЛОН КАРТОЧЕК
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.enemy-card, .crew-relation-card, .sword-card, .ship-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform =
                `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)';
        });
    });
});

// =========================================================
// 6. ИГРА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('game-score');
    const startBtn = document.getElementById('game-start');
    const closeBtn = document.getElementById('game-close');
    const gameWrapper = document.querySelector('.game-wrapper');

    if (!gameArea || !scoreDisplay || !startBtn || !closeBtn) return;

    let gameActive = false;
    let gameScore = 0;
    let gameInterval = null;
    let isMouseDown = false;
    let lastSliceX = 0;
    let lastSliceY = 0;
    const sliceLine = document.createElement('div');
    sliceLine.className = 'slice-line';
    sliceLine.style.cssText = `
        position: absolute;
        pointer-events: none;
        background: linear-gradient(90deg, #1a8a3a, #7b2fbe);
        height: 4px;
        border-radius: 2px;
        box-shadow: 0 0 30px rgba(26,138,58,0.6), 0 0 60px rgba(123,47,190,0.4);
        opacity: 0;
        transition: opacity 0.1s;
    `;
    gameArea.appendChild(sliceLine);

    startBtn.addEventListener('click', startGame);
    closeBtn.addEventListener('click', stopGame);

    function startGame() {
        if (gameActive) return;
        gameActive = true;
        gameScore = 0;
        scoreDisplay.textContent = '⚔️ Разрезов: 0';
        gameWrapper.style.borderColor = 'var(--gold)';
        gameArea.innerHTML = '';
        gameArea.appendChild(sliceLine);
        gameInterval = setInterval(spawnCore, 600);
        isMouseDown = false;
        sliceLine.style.opacity = '0';
        gameArea.style.cursor = 'none';
        closeBtn.style.display = 'block';
    }

    function stopGame() {
        gameActive = false;
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        gameArea.innerHTML = '';
        gameArea.appendChild(sliceLine);
        gameWrapper.style.borderColor = 'var(--border)';
        gameArea.style.cursor = 'default';
        sliceLine.style.opacity = '0';
        closeBtn.style.display = 'none';
    }

    function spawnCore() {
        if (!gameActive) return;
        const core = document.createElement('div');
        core.className = 'game-core';
        core.textContent = '🍊';
        core.style.cssText = `
            position: absolute;
            top: -60px;
            font-size: ${Math.random() * 20 + 32}px;
            left: ${Math.random() * 80 + 10}%;
            animation: coreFall ${Math.random() * 3 + 4}s linear infinite;
            user-select: none;
            pointer-events: none;
            filter: drop-shadow(0 0 20px rgba(255,107,53,0.6));
            transition: transform 0.05s;
        `;
        core.dataset.sliced = 'false';
        gameArea.appendChild(core);

        setTimeout(() => {
            if (core.parentNode && core.dataset.sliced === 'false') {
                core.remove();
            }
        }, 7000);
    }

    gameArea.addEventListener('mousedown', (e) => {
        if (!gameActive) return;
        isMouseDown = true;
        const rect = gameArea.getBoundingClientRect();
        lastSliceX = e.clientX - rect.left;
        lastSliceY = e.clientY - rect.top;
        sliceLine.style.opacity = '1';
        sliceLine.style.left = lastSliceX + 'px';
        sliceLine.style.top = lastSliceY + 'px';
        sliceLine.style.width = '0px';
    });

    gameArea.addEventListener('mousemove', (e) => {
        if (!gameActive || !isMouseDown) return;
        const rect = gameArea.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const dx = currentX - lastSliceX;
        const dy = currentY - lastSliceY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (length > 2) {
            sliceLine.style.width = length + 'px';
            sliceLine.style.transform = `rotate(${angle}deg)`;
            sliceLine.style.left = lastSliceX + 'px';
            sliceLine.style.top = lastSliceY + 'px';

            const cores = gameArea.querySelectorAll('.game-core');
            cores.forEach(core => {
                const coreRect = core.getBoundingClientRect();
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const cx = coreRect.left + coreRect.width / 2;
                const cy = coreRect.top + coreRect.height / 2;
                const dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
                if (dist < 40 && core.dataset.sliced === 'false') {
                    core.dataset.sliced = 'true';
                    core.style.animation = 'coreSlice 0.4s ease forwards';
                    core.style.transform = 'scale(1.8)';
                    core.style.opacity = '0.5';
                    gameScore++;
                    scoreDisplay.textContent = '⚔️ Разрезов: ' + gameScore;
                    setTimeout(() => core.remove(), 400);
                }
            });

            lastSliceX = currentX;
            lastSliceY = currentY;
        }
    });

    gameArea.addEventListener('mouseup', () => {
        isMouseDown = false;
        sliceLine.style.opacity = '0';
    });

    gameArea.addEventListener('mouseleave', () => {
        isMouseDown = false;
        sliceLine.style.opacity = '0';
    });
});

// =========================================================
// 7. САКУРА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'sakura-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < 25; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        leaf.style.cssText = `
            position: absolute;
            top: -10%;
            width: ${Math.random() * 15 + 10}px;
            height: ${Math.random() * 15 + 10}px;
            background: radial-gradient(circle at 30% 30%, #ffb7c5, #ff6b8a);
            border-radius: 50% 0 50% 0;
            opacity: ${Math.random() * 0.5 + 0.3};
            left: ${Math.random() * 100}%;
            animation: fall ${Math.random() * 8 + 8}s linear infinite;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(leaf);
    }
});

// =========================================================
// 8. АНИМАЦИЯ РАЗРЕЗА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.createElement('div');
    slash.className = 'slash-overlay';
    slash.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;
        background:radial-gradient(ellipse at 50% 50%, rgba(26,138,58,0.6) 0%, transparent 60%);
        opacity:0;transition:opacity 0.3s;
    `;
    document.body.appendChild(slash);

    setTimeout(() => {
        slash.style.opacity = '1';
        setTimeout(() => {
            slash.style.opacity = '0';
        }, 900);
    }, 400);
});

console.log('⚔️ Сайт Зоро загружен! Все анимации и функции активированы! ⚔️');
