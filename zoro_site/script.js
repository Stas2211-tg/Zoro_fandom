// =========================================================
// 1. АНИМАЦИЯ СЧЁТЧИКОВ (при скролле до них)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter-number');
    
    // Функция запуска счетчиков
    function startCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 секунды
            const stepTime = 20; // обновление каждые 20мс
            const steps = duration / stepTime;
            const increment = target / steps;
            
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
            }, stepTime);
        });
    }

    // Отслеживаем, когда блок со счетчиками появляется в зоне видимости
    const countersSection = document.querySelector('.counters');
    if (countersSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
                observer.disconnect(); // Запускаем только один раз
            }
        }, { threshold: 0.3 });
        observer.observe(countersSection);
    }
});

// =========================================================
// 2. ПЛАВНАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.hero-text, .hero-image, .crew-card, .counter-item, .crew-wano'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// =========================================================
// 3. АНИМАЦИЯ РАЗРЕЗА ПО КЛИКУ НА ЛОГОТИП
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    const slashEffect = document.querySelector('.slash-effect');

    if (logo && slashEffect) {
        logo.addEventListener('click', () => {
            // Запускаем анимацию разреза
            slashEffect.style.animation = 'none';
            setTimeout(() => {
                slashEffect.style.animation = 'slash 1.5s ease-in-out forwards';
            }, 10);
            
            // Через 1.5 секунды возвращаем фоновую анимацию
            setTimeout(() => {
                slashEffect.style.animation = 'slash 6s linear infinite';
            }, 1600);
        });
    }
});

// =========================================================
// 4. ОПРОС "ЛУЧШАЯ ДЕВУШКА ДЛЯ ЗОРО" (с сохранением)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const pollForm = document.getElementById('zoro-poll');
    const pollResults = document.getElementById('poll-results');

    if (pollForm) {
        // Загружаем сохранённый голос
        const savedVote = localStorage.getItem('zoroPollVote');
        if (savedVote) {
            const radio = document.querySelector(`input[name="girl"][value="${savedVote}"]`);
            if (radio) radio.checked = true;
        }

        // Обработка отправки
        pollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selected = document.querySelector('input[name="girl"]:checked');
            if (!selected) {
                alert('Выбери девушку для Зоро!');
                return;
            }

            const vote = selected.value;
            localStorage.setItem('zoroPollVote', vote);
            
            // Получаем текущую статистику
            let stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
            stats[vote] = (stats[vote] || 0) + 1;
            localStorage.setItem('zoroPollStats', JSON.stringify(stats));

            showPollResults(stats);
            pollForm.querySelector('button').textContent = 'Голос учтён! ✅';
        });

        // Показываем результаты при загрузке
        const stats = JSON.parse(localStorage.getItem('zoroPollStats')) || {};
        if (Object.keys(stats).length > 0) {
            showPollResults(stats);
        }
    }

    function showPollResults(stats) {
        if (!pollResults) return;
        
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let html = '<h4>Результаты:</h4><ul>';
        
        const names = {
            'tashigi': 'Ташиги',
            'hyori': 'Хёри',
            'robin': 'Робин',
            'nami': 'Нами',
            'kuina': 'Куина',
            'other': 'Другая'
        };

        for (const [key, count] of Object.entries(stats)) {
            const percent = ((count / total) * 100).toFixed(1);
            const name = names[key] || key;
            html += `<li>${name}: ${count} голосов (${percent}%)</li>`;
        }
        html += `</ul><p>Всего голосов: ${total}</p>`;
        pollResults.innerHTML = html;
    }
});

// =========================================================
// 5. ИНТЕРАКТИВНАЯ КАРТА (для map.html)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const mapPoints = document.querySelectorAll('.map-point');
    const infoBox = document.getElementById('location-info');

    if (mapPoints.length > 0 && infoBox) {
        mapPoints.forEach(point => {
            point.addEventListener('click', () => {
                const location = point.getAttribute('data-location');
                const info = getLocationInfo(location);
                infoBox.innerHTML = `
                    <h3>${info.name}</h3>
                    <p><strong>История:</strong> ${info.history}</p>
                    <p><strong>Значение для Зоро:</strong> ${info.significance}</p>
                    ${info.battles ? `<p><strong>Битвы:</strong> ${info.battles}</p>` : ''}
                `;
                infoBox.style.display = 'block';
                
                // Подсветка активной точки
                mapPoints.forEach(p => p.classList.remove('active'));
                point.classList.add('active');
            });
        });
    }

    function getLocationInfo(location) {
        const data = {
            'shimotsuki': {
                name: 'Деревня Шимотсуки',
                history: 'Родная деревня Зоро. Здесь он тренировался в додзё Иссин под руководством отца Куины.',
                significance: 'Место, где Зоро дал клятву стать величайшим фехтовальщиком в мире.',
                battles: ''
            },
            'shellstown': {
                name: 'Шеллс-Таун',
                history: 'Военный городок, где Зоро был заключён в тюрьму пиратами Моргана.',
                significance: 'Здесь Зоро встретил Луффи и впервые решил стать пиратом.',
                battles: 'Против капитана Моргана (победа)'
            },
            'arlongpark': {
                name: 'Арлонг-парк',
                history: 'Парк рыбо-людей, где Арлонг терроризировал деревню Нами.',
                significance: 'Первая серьёзная битва, где Зоро показал преданность команде.',
                battles: 'Против Хачи (победа)'
            },
            'enieslobby': {
                name: 'Эниес Лобби',
                history: 'Крепость Мирового правительства, остров правосудия.',
                significance: 'Зоро раскрыл силу Асуры (9 мечей).',
                battles: 'Против Каку (победа с Асурой)'
            },
            'sabaody': {
                name: 'Сабаоди',
                history: 'Архипелаг с мангровыми деревьями, место работорговли.',
                significance: 'Зоро разнёс аукцион рабов, показав ненависть к несправедливости.',
                battles: 'Против Пацифисты (поражение)'
            },
            'punkhazard': {
                name: 'Панк Хазард',
                history: 'Остров огня и льда, лаборатория Цезаря Клоуна.',
                significance: 'Зоро получил новый шрам.',
                battles: 'Против Моне (победа)'
            },
            'wano': {
                name: 'Страна Вано',
                history: 'Страна самураев, где раскрылась родословная Зоро.',
                significance: 'Зоро получил меч Энма и победил Кинга.',
                battles: 'Против Кинга (победа), против Кайдо (ранил его)'
            }
        };
        return data[location] || { name: 'Неизвестно', history: '...', significance: '...', battles: '' };
    }
});

// =========================================================
// 6. АНИМАЦИЯ ПАРЯЩИХ МЕЧЕЙ НА СТРАНИЦЕ МЕЧЕЙ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const swordCards = document.querySelectorAll('.sword-card');
    if (swordCards.length > 0) {
        swordCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05) translateY(-15px)';
                card.style.boxShadow = '0 20px 60px rgba(123, 47, 190, 0.3)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) translateY(0)';
                card.style.boxShadow = 'none';
            });
        });
    }
});

// =========================================================
// 7. ЭФФЕКТ ПЕЧАТАНИЯ ТЕКСТА ДЛЯ ГЛАВНОЙ ЦИТАТЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const quoteElement = document.querySelector('.hero-quote');
    if (quoteElement) {
        const originalText = quoteElement.innerHTML;
        quoteElement.innerHTML = '';
        
        // Эффект печатания для текста (упрощённый)
        let index = 0;
        const text = originalText;
        const timer = setInterval(() => {
            if (index < text.length) {
                quoteElement.innerHTML = text.substring(0, index + 1);
                index++;
            } else {
                clearInterval(timer);
            }
        }, 30);
    }
});

// =========================================================
// 8. МЕГА-АНИМАЦИЯ РАЗРЕЗА ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const slash = document.querySelector('.slash-effect');
    if (slash) {
        // Запускаем эпичный разрез при загрузке
        slash.style.animation = 'none';
        setTimeout(() => {
            slash.style.animation = 'slash 1.5s ease-in-out forwards';
        }, 100);
        setTimeout(() => {
            slash.style.animation = 'slash 6s linear infinite';
        }, 1600);
    }
});

// =========================================================
// 9. БОНУС: ЗВУКОВОЙ ЭФФЕКТ МЕЧА (опционально)
// =========================================================
// Раскомментируй, если хочешь добавить звук при клике на баннер
/*
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('click', () => {
            const audio = new Audio('https://www.soundjay.com/misc/sword-01.wav');
            audio.play().catch(e => console.log('Звук отключён браузером'));
        });
    }
});
*/

console.log('⚔️ Сайт Зоро загружен! Мечи наточены, анимации активированы. ⚔️');