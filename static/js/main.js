// Flag JS availability so CSS can safely hide .term-out for the reveal effect
document.documentElement.classList.add('js');

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

document.addEventListener('click', function (e) {
    if (e.target.closest('#mobile-menu a')) {
        const menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.remove('open');
    }
});

// ===== Typing Engine =====
function typeText(el, text, speed = 35) {
    return new Promise((resolve) => {
        let i = 0;
        el.textContent = '';
        el.classList.add('typing');
        const tick = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(tick, speed + Math.random() * 40);
            } else {
                el.classList.remove('typing');
                resolve();
            }
        };
        tick();
    });
}

// ===== Scroll-Triggered Command Execution =====
// Elements with .term-cmd[data-cmd] get typed out when visible,
// then their sibling .term-out fades in like command output.
const cmdObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(async (entry) => {
            if (!entry.isIntersecting) return;
            cmdObserver.unobserve(entry.target);
            const el = entry.target;
            const cmd = el.dataset.cmd || '';
            const prompt = el.dataset.prompt || '$ ';
            const promptSpan = document.createElement('span');
            promptSpan.className = 'text-term-green';
            promptSpan.textContent = prompt;
            const cmdSpan = document.createElement('span');
            el.textContent = '';
            el.appendChild(promptSpan);
            el.appendChild(cmdSpan);
            await typeText(cmdSpan, cmd);
            // Reveal all outputs tied to this command
            const block = el.closest('.term-block') || el.parentElement;
            block.querySelectorAll('.term-out').forEach((out, idx) => {
                setTimeout(() => out.classList.add('executed'), idx * 120);
            });
        });
    },
    { threshold: 0.3 }
);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.term-cmd').forEach((el) => cmdObserver.observe(el));
});

// ===== Interactive Terminal Prompt =====
const TERM_COMMANDS = {
    help: () => [
        'Available commands:',
        '  about        cd into about section',
        '  skills       list installed skills',
        '  projects     browse ~/projects',
        '  work         view work history',
        '  blog         open the blog',
        '  contact      run contact script',
        '  whoami       who am I?',
        '  history      show command history',
        '  matrix       follow the white rabbit',
        '  clear        clear terminal history',
        '  sudo hire-me you know you want to',
        '',
        'tips: ↑/↓ recall history · Tab autocompletes',
    ],
    whoami: () => ['alok — Python developer. Builds fast, scalable backends. Currently accepting interesting problems.'],
    ls: () => ['about/  skills/  projects/  work/  blog/  contact.sh  mission.txt'],
    'cat mission.txt': () => ['Building fast, scalable backends that power real products.'],
    about: () => { location.href = '/#about'; return ['Navigating to ~/about ...']; },
    skills: () => { location.href = '/#skills'; return ['Listing skills ...']; },
    projects: () => { location.href = '/#projects'; return ['Opening ~/projects ...']; },
    work: () => { location.href = '/#experience'; return ['Loading work history ...']; },
    experience: () => { location.href = '/#experience'; return ['Loading work history ...']; },
    blog: () => { location.href = '/blog'; return ['Opening blog ...']; },
    contact: () => { location.href = '/#contact'; return ['Running ./contact.sh ...']; },
    'sudo hire-me': () => ['[sudo] password for visitor: ********', 'Access granted. Redirecting to contact form...', () => location.href = '/#contact'],
    sudo: () => ['visitor is not in the sudoers file. This incident will be reported. ;)'],
    pwd: () => ['/home/alok/portfolio'],
    date: () => [new Date().toString()],
    exit: () => ['There is no escape. Try "contact" instead.'],
    vim: () => ['E37: No write since last change. (You are now stuck in vim forever.)'],
    python: () => ['Python 3.13.0 (portfolio build)', '>>> import alok', '>>> alok.status', "'available for work'"],
    matrix: () => { startMatrixRain(); return ['Wake up, Neo... (click anywhere or press Esc to exit)']; },
    neofetch: () => ['Scroll up — it ran when you got here. ;)'],
    uptime: () => [document.getElementById('session-uptime')?.textContent || 'up forever'],
};

// ===== Matrix Rain Easter Egg =====
function startMatrixRain() {
    if (document.getElementById('matrix-canvas')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(13,17,23,0.92);cursor:pointer;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソ0123456789ABCDEF$#@*+-';
    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols).fill(1);

    const interval = setInterval(() => {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3fb950';
        ctx.font = fontSize + 'px monospace';
        drops.forEach((y, i) => {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 50);

    const stop = () => {
        clearInterval(interval);
        canvas.remove();
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') stop(); };
    canvas.addEventListener('click', stop);
    document.addEventListener('keydown', onKey);
}

function initInteractiveTerminal() {
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    if (!input || !history) return;

    const cmdHistory = [];
    let historyIdx = -1;

    const print = (text, cls = 'text-term-text') => {
        const line = document.createElement('p');
        line.className = cls + ' whitespace-pre-wrap';
        line.textContent = text;
        history.appendChild(line);
    };

    input.addEventListener('keydown', (e) => {
        // Recall previous commands with arrow keys, like a real shell
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length === 0) return;
            historyIdx = historyIdx <= 0 ? 0 : historyIdx - 1;
            input.value = cmdHistory[historyIdx];
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx === -1) return;
            historyIdx++;
            if (historyIdx >= cmdHistory.length) {
                historyIdx = -1;
                input.value = '';
            } else {
                input.value = cmdHistory[historyIdx];
            }
            return;
        }

        // Tab completion against known commands
        if (e.key === 'Tab') {
            e.preventDefault();
            const partial = input.value.trim().toLowerCase();
            if (!partial) return;
            const matches = Object.keys(TERM_COMMANDS).filter((c) => c.startsWith(partial));
            if (matches.length === 1) {
                input.value = matches[0];
            } else if (matches.length > 1) {
                print(matches.join('    '), 'text-term-muted');
                history.parentElement.scrollTop = history.parentElement.scrollHeight;
            }
            return;
        }

        if (e.key !== 'Enter') return;
        const raw = input.value.trim();
        input.value = '';
        if (!raw) return;
        cmdHistory.push(raw);
        historyIdx = -1;

        print('➜ ~ ' + raw, 'text-term-muted');

        const cmd = raw.toLowerCase();
        if (cmd === 'clear') {
            history.innerHTML = '';
            return;
        }
        if (cmd === 'history') {
            cmdHistory.forEach((c, i) => print(`  ${String(i + 1).padStart(3)}  ${c}`));
            history.parentElement.scrollTop = history.parentElement.scrollHeight;
            return;
        }

        const handler = TERM_COMMANDS[cmd] || TERM_COMMANDS[cmd.split(' ')[0]];
        if (handler) {
            const out = handler();
            out.forEach((line) => {
                if (typeof line === 'function') {
                    setTimeout(line, 900);
                } else {
                    print(line);
                }
            });
        } else {
            print(`command not found: ${raw} — try "help"`, 'text-term-red');
        }
        history.parentElement.scrollTop = history.parentElement.scrollHeight;
    });

    // Focus input when clicking anywhere in the terminal body
    const heroTerminal = document.getElementById('hero-terminal');
    if (heroTerminal) {
        heroTerminal.addEventListener('click', (e) => {
            if (!e.target.closest('a, button, input, textarea')) input.focus();
        });
    }
}

// ===== Navbar Clock =====
function initClock() {
    const clock = document.getElementById('nav-clock');
    if (!clock) return;
    const update = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    };
    update();
    setInterval(update, 1000);
}

// ===== Footer Uptime =====
function initUptime() {
    const uptime = document.getElementById('session-uptime');
    if (!uptime) return;
    const start = Date.now();
    const update = () => {
        const s = Math.floor((Date.now() - start) / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        uptime.textContent = `up ${h}h ${m % 60}m ${s % 60}s`;
    };
    update();
    setInterval(update, 1000);
}

// ===== Scroll-Spy Nav Highlighting =====
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;
    const navLinks = document.querySelectorAll('nav a[href^="/#"]');

    const spy = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach((link) => {
                    const active = link.getAttribute('href') === `/#${id}`;
                    link.classList.toggle('nav-active', active);
                });
            });
        },
        { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((s) => spy.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
    initInteractiveTerminal();
    initClock();
    initUptime();
    initScrollSpy();
});
