// ==UserScript==
// @name         GameMale Registration Quiz Auto-Filler (100% Accurate)
// @namespace    https://github.com/mik001/devil-in-the-basement-guide-
// @version      1.1.0
// @description  Compila automaticamente il quiz di registrazione di GameMale (plugin k_qareg) con tutte le risposte corrette verificate al 100%.
// @author       Antigravity
// @match        *://*.gamemale.com/plugin.php?id=k_qareg*
// @match        *://gamemale.com/plugin.php?id=k_qareg*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // STILI PER IL BOTTONE E GLI EVIDENZIATORI
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
            max-width: 300px;
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
        .gm-fill-btn:hover {
            background: #0369a1;
            transform: translateY(-1px);
        }
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
        .gm-submit-btn:hover {
            background: #059669;
        }
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

    // LISTA DEGLI ID ESATTI RICAVATI DALL'HTML UFFICIALE:
    // Q1 (14): 14_3 (艾尔登法环)
    // Q2 (13): 13_1 (是)
    // Q3 (10): 10_2 (拉克丝)
    // Q4 (9):  9_4  (哼)
    // Q5 (2):  2_1, 2_3, 2_4, 2_5 (字数低于50字, 复制粘贴, 纯水贴, 只有图片)
    // Q6 (3):  3_1, 3_2, 3_3, 3_4, 3_5, 3_6, 3_7 (Tutte le 7 opzioni!)
    // Q7 (12): 12_1 (成都)
    // Q8 (11): 11_6 (马)
    // Q9 (1):  1_2  (宁缺毋滥)
    // Q10 (8): 8_1  (上古卷轴5)

    const correctIds = [
        // Q1
        '14_3',
        // Q2
        '13_1',
        // Q3
        '10_2',
        // Q4
        '9_4',
        // Q5 (Multipla - tutte tranne 2_2 新人报道)
        '2_1', '2_3', '2_4', '2_5',
        // Q6 (Multipla - tutte e 7!)
        '3_1', '3_2', '3_3', '3_4', '3_5', '3_6', '3_7',
        // Q7
        '12_1',
        // Q8
        '11_6',
        // Q9
        '1_2',
        // Q10
        '8_1'
    ];

    function fillForm(andSubmit = false) {
        let count = 0;

        // Deseleziona prima tutte le checkbox per sicurezza
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        correctIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.checked = true;
                count++;

                // Evidenzia visivamente l'etichetta associata
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    label.classList.add('gm-highlight-green');
                }
            }
        });

        const statusEl = document.getElementById('gm-status-text');
        if (statusEl) {
            statusEl.innerHTML = `✅ <strong>${count} campi</strong> compilati al 100%!`;
            statusEl.style.color = '#4ade80';
        }

        if (andSubmit) {
            const submitBtn = document.querySelector('button[name="qaregsubmit"]') || document.querySelector('button[type="submit"]');
            if (submitBtn) {
                setTimeout(() => submitBtn.click(), 400);
            }
        }
    }

    function createUI() {
        const bar = document.createElement('div');
        bar.id = 'gm-autofill-bar';
        bar.innerHTML = `
            <div style="font-weight:bold; font-size:14px; color:#38bdf8;">⚡ GameMale Auto-Fill</div>
            <div id="gm-status-text" style="font-size:12px; color:#94a3b8;">Pronto per compilare le 10 risposte corrette.</div>
            <button class="gm-fill-btn" id="gm-btn-fill">⚡ Compila Risposte (1-Click)</button>
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
    // Compila automaticamente appena la pagina è pronta
    setTimeout(() => fillForm(false), 500);

})();
