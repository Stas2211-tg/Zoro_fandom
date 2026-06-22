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
// 2. ТЕМЫ (3 режима)
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
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme ===
            theme));
        });
    });

    function applyTheme(theme) {
        document.body.dataset.theme = theme === 'mixed' ? '' : theme;
    }
});

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
// 4. ГОЛОСОВАНИЯ (только для авторизованных)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const polls = document.querySelectorAll('.poll-form');
    polls.forEach(poll => {
        const pollId = poll.dataset.poll;
        const resultsId = pollId + '-results';
        const results = document.getElementById(resultsId);

        const votes = JSON.parse(localStorage.getItem('zoroVotes') || '{}');
        if (currentUser && votes[currentUser.username] && votes[currentUser.username][pollId]) {
            poll.querySelector('button').textContent = '✅ Вы уже голосовали';
            poll.querySelectorAll('input').forEach(inp => inp.disabled = true);
            showPollResults(pollId, results);
            return;
        }

        poll.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Войдите или зарегистрируйтесь, чтобы голосовать!');
                return;
            }
            const selected = poll.querySelector('input:checked');
            if (!selected) { alert('Выберите вариант!'); return; }
            const vote = selected.value;

            const votes = JSON.parse(localStorage.getItem('zoroVotes') || '{}');
            if (!votes[currentUser.username]) votes[currentUser.username] = {};
            if (votes[currentUser.username][pollId]) {
                alert('Вы уже голосовали в этом опросе!');
                return;
            }
            votes[currentUser.username][pollId] = vote;
            localStorage.setItem('zoroVotes', JSON.stringify(votes));

            let stats = JSON.parse(localStorage.getItem('pollStats_' + pollId) || '{}');
            stats[vote] = (stats[vote] || 0) + 1;
            localStorage.setItem('pollStats_' + pollId, JSON.stringify(stats));

            showPollResults(pollId, results);
            poll.querySelector('button').textContent = '✅ Голос учтён!';
            poll.querySelectorAll('input').forEach(inp => inp.disabled = true);
        });
    });
});

function showPollResults(pollId, results) {
    if (!results) return;
    const stats = JSON.parse(localStorage.getItem('pollStats_' + pollId) || '{}');
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) { results.innerHTML = '<p>Пока нет голосов. Будь первым!</p>'; return; }
    let html = '<h4>📊 Результаты:</h4><ul style="list-style: none; padding: 0;">';
    for (const [key, count] of Object.entries(stats)) {
        const percent = ((count / total) * 100).toFixed(1);
        html +=
            `<li style="padding: 6px 0; border-bottom: 1px solid var(--border);">${key}: ${count} голосов (${percent}%)</li>`;
    }
    html += `</ul><p style="margin-top: 10px; font-weight: 700; color: var(--gold);">Всего голосов: ${total}</p>`;
    results.innerHTML = html;
}

// =========================================================
// 5. ИГРА: РАЗРЕЗАНИЕ ЯДЕР (ЗАЖИМ МЫШКИ)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.querySelector('.game-area');
    const scoreDisplay = document.getElementById('game-score');
    const startBtn = document.getElementById('game-start');
    const closeBtn = document.querySelector('.game-close');
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
        sliceLine.classList.remove('active');
        gameArea.style.cursor = 'none';
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
        sliceLine.classList.remove('active');
    }

    function spawnCore() {
        if (!gameActive) return;
        const core = document.createElement('div');
        core.className = 'game-core';
        core.textContent = '🍊';
        core.style.left = Math.random() * 80 + 10 + '%';
        core.style.animationDuration = (Math.random() * 3 + 4) + 's';
        core.style.fontSize = (Math.random() * 20 + 32) + 'px';
        core.dataset.sliced = 'false';
        gameArea.appendChild(core);
        setTimeout(() => {
            if (core.parentNode && core.dataset.sliced === 'false') {
                core.remove();
            }
        }, 7000);
    }

    // Зажим мыши
    gameArea.addEventListener('mousedown', (e) => {
        if (!gameActive) return;
        isMouseDown = true;
        lastSliceX = e.clientX - gameArea.getBoundingClientRect().left;
        lastSliceY = e.clientY - gameArea.getBoundingClientRect().top;
        sliceLine.classList.add('active');
        sliceLine.style.left = lastSliceX + 'px';
        sliceLine.style.top = lastSliceY + 'px';
        sliceLine.style.width = '0px';
    });

    gameArea.addEventListener('mousemove', (e) => {
        if (!gameActive || !isMouseDown) return;
        const rect = gameArea.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Обновляем линию разреза
        const dx = currentX - lastSliceX;
        const dy = currentY - lastSliceY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (length > 2) {
            sliceLine.style.width = length + 'px';
            sliceLine.style.transform = `rotate(${angle}deg)`;
            sliceLine.style.left = lastSliceX + 'px';
            sliceLine.style.top = lastSliceY + 'px';

            // Проверяем пересечение с ядрами
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
                    core.classList.add('sliced');
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
        sliceLine.classList.remove('active');
    });

    gameArea.addEventListener('mouseleave', () => {
        isMouseDown = false;
        sliceLine.classList.remove('active');
    });
});

// =========================================================
// 6. САКУРА
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'sakura-container';
    document.body.appendChild(container);
    for (let i = 0; i < 25; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDuration = (Math.random() * 8 + 8) + 's';
        leaf.style.animationDelay = (Math.random() * 10) + 's';
        leaf.style.width = (Math.random() * 15 + 10) + 'px';
        leaf.style.height = (Math.random() * 15 + 10) + 'px';
        leaf.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(leaf);
    }
});

// =========================================================
// 7. РАЗРЕЗ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.createElement('div');
    slash.className = 'slash-overlay';
    document.body.appendChild(slash);
    setTimeout(() => {
        slash.classList.add('active');
        setTimeout(() => {
            slash.classList.remove('active');
        }, 900);
    }, 400);
});

// =========================================================
// 8. СЧЁТЧИКИ
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
// 9. 3D-НАКЛОН КАРТОЧЕК
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

console.log('⚔️ Сайт Зоро загружен! Все анимации и функции активированы! ⚔️');
