// ==UserScript==
// @name         GameMale Forum Assistant & Smart Translator
// @namespace    https://github.com/mik001/devil-in-the-basement-guide-
// @version      1.0.0
// @description  Assistente intelligente per GameMale: traduce l'interfaccia, evidenzia link di download e password di scompattazione (解压码), e assiste nella registrazione.
// @author       Antigravity
// @match        *://*.gamemale.com/*
// @match        *://gamemale.com/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // 1. STILI GRAFICI INIETTATI
    const styles = `
        .gm-helper-badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 4px;
            margin-right: 5px;
            text-transform: uppercase;
        }
        .gm-badge-game { background: #3b82f6; color: #fff; }
        .gm-badge-guro { background: #ef4444; color: #fff; }
        .gm-badge-pw { background: #f59e0b; color: #000; cursor: pointer; }
        .gm-badge-link { background: #10b981; color: #fff; cursor: pointer; }
        .gm-pw-box {
            background: #1e293b;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 8px 12px;
            margin: 10px 0;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: monospace;
        }
        .gm-copy-btn {
            background: #f59e0b;
            color: #000;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        }
        .gm-copy-btn:hover { background: #d97706; }
        .gm-trans-sub {
            display: block;
            font-size: 12px;
            color: #94a3b8;
            font-weight: normal;
            margin-top: 2px;
        }
        #gm-floating-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #0f172a;
            border: 1px solid #334155;
            color: #f8fafc;
            border-radius: 10px;
            padding: 12px 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            z-index: 999999;
            font-family: sans-serif;
            font-size: 12px;
            max-width: 320px;
        }
        #gm-floating-panel h4 {
            margin: 0 0 6px 0;
            color: #38bdf8;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(styles);
    } else {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    // 2. DIZIONARIO TRADUZIONI ELEMENTI ESSENZIALI
    const dict = {
        '单机游戏': 'Giochi Standalone / PC',
        '重口': 'Gore / Crudo / Hardcore',
        '和谐': 'Per Adulti (R18)',
        '解压码': 'Password Archivio',
        '密码': 'Password',
        '提取码': 'Codice Estrazione',
        '百度网盘': 'Baidu Drive',
        '楼主': 'Autore Post (LZ)',
        '悬赏': 'Richiesta / Taglia',
        '汉化': 'Tradotto / Patch',
        '生肉': 'Lingua Originale',
        '立即注册': 'Registrati Ora',
        '登录': 'Accedi',
        '退出': 'Disconnetti',
        '用户名': 'Nome Utente',
        '密码': 'Password',
        '确认密码': 'Conferma Password',
        'Email 地址': 'Indirizzo Email',
        '安全提问': 'Domanda di Sicurezza',
        '验证码': 'Codice di Verifica'
    };

    // 3. EVIDENZIAMENTO TAG E TITOLI NELLE LISTE
    function highlightTags() {
        const links = document.querySelectorAll('a.xst, a[href*="thread-"]');
        links.forEach(a => {
            if (a.dataset.gmParsed) return;
            a.dataset.gmParsed = 'true';

            const text = a.textContent;
            if (text.includes('重口') || text.includes('R18G') || text.includes('重口和谐')) {
                const badge = document.createElement('span');
                badge.className = 'gm-helper-badge gm-badge-guro';
                badge.textContent = 'GORE';
                a.parentNode.insertBefore(badge, a);
            }
            if (text.includes('单机') || text.includes('RPG') || text.includes('ACT')) {
                const badge = document.createElement('span');
                badge.className = 'gm-helper-badge gm-badge-game';
                badge.textContent = 'GAME';
                a.parentNode.insertBefore(badge, a);
            }
        });
    }

    // 4. ESTRAZIONE AUTOMATICA PASSWORD E LINK BAIJU / DRIVE
    function scanPostContent() {
        const postBodies = document.querySelectorAll('.t_f, .pcb');
        let extractedPw = [];
        let extractedLinks = [];

        postBodies.forEach(p => {
            const html = p.innerHTML;

            // Cerca password di scompattazione: 解压码: xxx oppure 密码: xxx
            const pwRegex = /(?:解压[码密]|密[码碼]|PW|Password)[：:\s]*([a-zA-Z0-9_\-@\.]+)/gi;
            let match;
            while ((match = pwRegex.exec(p.innerText)) !== null) {
                if (match[1] && match[1].length >= 2 && !['http', 'https', 'www'].includes(match[1].toLowerCase())) {
                    extractedPw.push(match[1]);
                }
            }

            // Cerca link Baidu con codice
            const baiduRegex = /(https:\/\/pan\.baidu\.com\/s\/[a-zA-Z0-9_\-]+)\s*(?:提取码[：:\s]*([a-zA-Z0-9]{4}))?/g;
            let bMatch;
            while ((bMatch = baiduRegex.exec(html)) !== null) {
                extractedLinks.push({
                    url: bMatch[1],
                    code: bMatch[2] || ''
                });
            }
        });

        if (extractedPw.length > 0 || extractedLinks.length > 0) {
            injectFloatingPanel(extractedPw, extractedLinks);
        }
    }

    // 5. PANNELLO FLUTTANTE RAPIDO
    function injectFloatingPanel(passwords, links) {
        if (document.getElementById('gm-floating-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'gm-floating-panel';

        let html = '<h4>🎮 GameMale Assistant <span style="cursor:pointer;" onclick="this.parentElement.parentElement.remove()">✕</span></h4>';

        if (passwords.length > 0) {
            html += '<div style="margin-bottom:8px;"><strong>🔑 Password Rilevate:</strong>';
            passwords.forEach(pw => {
                html += `
                    <div class="gm-pw-box">
                        <span>${pw}</span>
                        <button class="gm-copy-btn" onclick="navigator.clipboard.writeText('${pw}'); this.textContent='Copiato!';">Copia</button>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (links.length > 0) {
            html += '<div><strong>🔗 Link Download:</strong><ul style="padding-left:16px; margin:4px 0;">';
            links.forEach(l => {
                html += `<li><a href="${l.url}" target="_blank" style="color:#38bdf8;">Apri Link Baidu</a> ${l.code ? '(Cod: <strong>' + l.code + '</strong>)' : ''}</li>`;
            });
            html += '</ul></div>';
        }

        panel.innerHTML = html;
        document.body.appendChild(panel);
    }

    // 6. TRADUZIONE FORM DI REGISTRAZIONE SE SEI IN member.php?mod=register
    function handleRegistrationPage() {
        if (!window.location.href.includes('register') && !document.querySelector('form[name="register"]')) return;

        const labels = document.querySelectorAll('label, th, td');
        labels.forEach(el => {
            const t = el.textContent.trim();
            for (const [cn, it] of Object.entries(dict)) {
                if (t === cn && !el.dataset.translated) {
                    el.dataset.translated = 'true';
                    const sub = document.createElement('span');
                    sub.className = 'gm-trans-sub';
                    sub.textContent = `(${it})`;
                    el.appendChild(sub);
                }
            }
        });
    }

    // ESECUZIONE
    highlightTags();
    scanPostContent();
    handleRegistrationPage();

    // Rilancia su aggiornamenti dinamici
    const observer = new MutationObserver(() => {
        highlightTags();
        handleRegistrationPage();
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
