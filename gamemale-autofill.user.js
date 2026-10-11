// ==UserScript==
// @name         GameMale Registration Quiz Auto-Filler (100% Verified Answers)
// @namespace    https://github.com/mik001/devil-in-the-basement-guide-
// @version      1.2.0
// @description  Compila automaticamente il quiz di registrazione di GameMale (plugin k_qareg) con le risposte ufficiali corrette verificate dal forum.
// @author       Antigravity
// @match        *://*.gamemale.com/plugin.php?id=k_qareg*
// @match        *://gamemale.com/plugin.php?id=k_qareg*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const styles = `
        #gm-autofill-bar {
            position: fixed;
            top: 60px;
            right: 20px;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border: 2px solid #38bdf8;
            box-shadow: 0 10px 25px rgba(0,0,0,0.6);
            border-radius: 12px;
            padding: 14px 18px;
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #fff;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 320px;
        }
        .gm-fill-btn {
            background: #0284c7;
            color: #fff;
            border: none;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }
        .gm-fill-btn:hover { background: #0369a1; transform: translateY(-1px); }
        .gm-submit-btn {
            background: #10b981;
            color: #fff;
            border: none;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }
        .gm-submit-btn:hover { background: #059669; }
        .gm-highlight-green {
            background: rgba(34, 197, 94, 0.25) !important;
            border-radius: 4px;
            padding: 2px 4px;
            font-weight: bold;
            color: #4ade80 !important;
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(styles);
    } else {
        const s = document.createElement('style');
        s.textContent = styles;
        document.head.appendChild(s);
    }

    // RISPOSTE UFFICIALI E VERIFICATE DAI FORUM GAMEMALE:
    // Q1:  14_3 (艾尔登法环 - Elden Ring)
    // Q2:  13_1 (是 - Sì)
    // Q3:  10_3 (拉比克 - Rubick! Non Lux)
    // Q4:  9_4  (哼 - Heng)
    // Q5:  2_1, 2_2, 2_3, 2_4, 2_5 (TUTTE E 5 LE OPZIONI, anche 新人报道贴 è sanzionato!)
    // Q6:  3_1, 3_2, 3_3, 3_4, 3_5, 3_6, 3_7 (TUTTE E 7 LE OPZIONI!)
    // Q7:  12_2 (南宁 - Nanning! Dal meme di Zhou Yinting / 仙都)
    // Q8:  11_6 (马 - Cavallo)
    // Q9:  1_2  (宁缺毋滥 - Motto del forum)
    // Q10: 8_1  (上古卷轴5 - Skyrim)

    const correctIds = [
        '14_3',
        '13_1',
        '10_3',
        '9_4',
        '2_1', '2_2', '2_3', '2_4', '2_5',
        '3_1', '3_2', '3_3', '3_4', '3_5', '3_6', '3_7',
        '12_2',
        '11_6',
        '1_2',
        '8_1'
    ];

    function fillForm(andSubmit = false) {
        let count = 0;

        // Reset radio e checkbox
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        correctIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.checked = true;
                count++;
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    label.classList.add('gm-highlight-green');
                }
            }
        });

        const statusEl = document.getElementById('gm-status-text');
        if (statusEl) {
            statusEl.innerHTML = `🎯 <strong>${count} campi</strong> selezionati con le risposte corrette del forum!`;
            statusEl.style.color = '#4ade80';
        }

        if (andSubmit) {
            const submitBtn = document.querySelector('button[name="qaregsubmit"]') || document.querySelector('button[type="submit"]');
            if (submitBtn) {
                setTimeout(() => submitBtn.click(), 300);
            }
        }
    }

    function createUI() {
        if (document.getElementById('gm-autofill-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'gm-autofill-bar';
        bar.innerHTML = `
            <div style="font-weight:bold; font-size:14px; color:#38bdf8;">⚡ GameMale Auto-Fill v1.2</div>
            <div id="gm-status-text" style="font-size:12px; color:#94a3b8;">Risposte verificate per Q3 (拉比克), Q5 (Tutte 5), Q7 (南宁).</div>
            <button class="gm-fill-btn" id="gm-btn-fill">⚡ Compila Risposte Esatte</button>
            <button class="gm-submit-btn" id="gm-btn-submit">🚀 Compila & Invia Subito</button>
        `;
        document.body.appendChild(bar);

        document.getElementById('gm-btn-fill').addEventListener('click', (e) => {
            e.preventDefault();
            fillForm(false);
        });

        document.getElementById('gm-btn-submit').addEventListener('click', (e) => {
            e.preventDefault();
            fillForm(true);
        });
    }

    createUI();
    setTimeout(() => fillForm(false), 500);

})();
