// САКУРА
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.className = 'sakura-container';
    document.body.appendChild(container);
    for (let i = 0; i < 30; i++) {
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

// НАСТОЯЩИЙ РАЗРЕЗ
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.createElement('div');
    slash.className = 'slash-overlay';
    document.body.appendChild(slash);
    setTimeout(() => { slash.classList.add('active'); setTimeout(() => { slash.classList.remove('active'); }, 900); }, 300);
    document.querySelector('.logo')?.addEventListener('click', () => {
        slash.classList.remove('active');
        setTimeout(() => { slash.classList.add('active'); setTimeout(() => { slash.classList.remove('active'); }, 900); }, 50);
    });
});

// СЧЁТЧИКИ
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter-number');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            counters.forEach(c => {
                const target = parseInt(c.getAttribute('data-target'));
                const steps = 100;
                let current = 0;
                const timer = setInterval(() => {
                    current += target / steps;
                    if (current >= target) { c.textContent = target.toLocaleString(); clearInterval(timer); }
                    else { c.textContent = Math.floor(current).toLocaleString(); }
                }, 20);
            });
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    const section = document.querySelector('.counters');
    if (section) observer.observe(section);
});

// АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.hero-text, .hero-image, .counter-item, .sword-card, .enemy-card, .crew-relation-card, .award-item, .ship-card, .theory-card, .meme-card, .bio-text, .bio-image, .win-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    elements.forEach(el => { el.classList.add('animate-on-scroll'); observer.observe(el); });
});

// 3D-НАКЛОН КАРТОЧЕК
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.crew-relation-card, .enemy-card, .sword-card, .ship-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)';
        });
    });
});

// КОНВЕЙЕРЫ БЕЗ ОСТАНОВКИ
document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.querySelectorAll('.enemies-track, .crew-relations-track');
    tracks.forEach(track => {
        track.style.animationPlayState = 'running';
        track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'running'; });
        track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
    });
});

// ОПРОС
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('zoro-poll');
    const results = document.getElementById('poll-results');
    if (form) {
        const saved = localStorage.getItem('zoroPollVote');
        if (saved) { const radio = document.querySelector(`input[name="girl"][value="${saved}"]`); if (radio) radio.checked = true; }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const selected = document.querySelector('input[name="girl"]:checked');
            if (!selected) { alert('Выбери девушку для Зоро!'); return; }
            const vote = selected.value;
            localStorage.setItem('zoroPollVote', vote);
            let stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
            stats[vote] = (stats[vote] || 0) + 1;
            localStorage.setItem('zoroPollStats', JSON.stringify(stats));
            showResults(stats);
            form.querySelector('button').textContent = 'Голос учтён! ✅';
        });
        const stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
        if (Object.keys(stats).length > 0) showResults(stats);
    }
    function showResults(stats) {
        if (!results) return;
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let html = '<h4>🏆 Результаты:</h4><ul style="list-style: none; padding: 0;">';
        const names = { tashigi: 'Ташиги', hyori: 'Хёри', robin: 'Робин', nami: 'Нами', kuina: 'Куина', other: 'Другая' };
        for (const [key, count] of Object.entries(stats)) {
            const percent = ((count / total) * 100).toFixed(1);
            html += `<li style="padding: 8px 0; border-bottom: 1px solid #2a3a2a;">${names[key] || key}: ${count} голосов (${percent}%)</li>`;
        }
        html += `</ul><p style="margin-top: 15px; font-weight: 700; color: var(--gold);">Всего голосов: ${total}</p>`;
        results.innerHTML = html;
    }
});

// ПЕЧАТАНИЕ ЦИТАТЫ
document.addEventListener('DOMContentLoaded', () => {
    const quote = document.querySelector('.hero-quote');
    if (quote) {
        const text = quote.innerHTML;
        quote.innerHTML = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) { quote.innerHTML = text.substring(0, i + 1); i++; }
            else { clearInterval(timer); }
        }, 25);
    }
});

// АВТОПЕРЕВОД (кнопка в меню)
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.createElement('a');
    langBtn.href = '#';
    langBtn.textContent = '🌍 Язык';
    langBtn.style.cssText = 'color: #b8c0b8; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; padding: 5px 0; border-bottom: 2px solid transparent; transition: 0.3s;';
    langBtn.onmouseover = () => { langBtn.style.color = '#1a8a3a'; langBtn.style.borderBottomColor = '#1a8a3a'; };
    langBtn.onmouseout = () => { langBtn.style.color = '#b8c0b8'; langBtn.style.borderBottomColor = 'transparent'; };
    langBtn.onclick = (e) => {
        e.preventDefault();
        const lang = prompt('Выбери язык: ru, en, kk, ja, zh');
        if (lang) {
            document.querySelectorAll('.hero-quote, .section-subtitle, h2, h3, p, .btn, .counter-label, .footer-copy p').forEach(el => {
                const text = el.textContent;
                fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`)
                    .then(r => r.json())
                    .then(data => { if (data && data[0]) { el.textContent = data[0][0][0]; } })
                    .catch(() => alert('Ошибка перевода. Попробуй позже.'));
            });
        }
    };
    document.querySelector('.nav').appendChild(langBtn);
});

console.log('⚔️ Сайт Зоро загружен! Все анимации активированы! ⚔️');
