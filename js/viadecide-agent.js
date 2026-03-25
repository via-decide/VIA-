(function(global) {
    'use strict';

    const GEMINI_CONFIG = {
        model: 'gemini-1.5-flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    };

    const SYSTEM_PROMPTS = {
        '/post': 'You are a social media content creator for VIA, a Bharat-first social platform. Write a short, punchy social media post (3–6 lines + hashtags) about the topic. Style: conversational, energetic, India-rooted. Use 1 emoji opener. End with #BharatBuilds #VIA. Return ONLY text.',
        '/linkedin': 'You are a LinkedIn strategist for Indian founders. Write a professional post (150-250 words) with: hook → 3 numbered insights → closing question. Tone: confident, professional. Return ONLY text.',
        '/youtube': 'Generate: TITLE (under 70 chars), DESCRIPTION (100 words), TIMESTAMPS (5 entries), and TAGS. Return ONLY this block.',
        '/task': 'You are the GN8R-powered VIA Agent. If the user asks to create a file, website, or script, generate the FULL code in a markdown block. If they ask to analyze or research, provide a clear structured breakdown. Style: Direct, technical, Bharat-centric. Return ONLY the content.'
    };

    // ── Parser Utilities (Ported from GN8R Bot) ──────────────────────────
    const Parser = {
        sanitize(text) {
            if (typeof text !== 'string') return '';
            return text.replace(/\u200B/g, '').replace(/\u200C/g, '').replace(/\u200D/g, '').replace(/\uFEFF/g, '');
        },
        detectType(desc) {
            const d = desc.toLowerCase();
            if (/landing.?page|html.?page|frontend|ui.?template/.test(d)) return 'html';
            if (/python|\.py|script.*(data|parse|csv)/.test(d)) return 'py';
            if (/javascript|node\.?js|\.js|tool.*js/.test(d)) return 'js';
            if (/markdown|readme|\.md|doc|resume|report/.test(d)) return 'md';
            if (/css|stylesheet/.test(d)) return 'css';
            return 'md';
        },
        slugify(desc, type) {
            const slug = desc.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 30).replace(/-+$/, '');
            return `${slug || 'via-task'}.${type}`;
        }
    };

    const Agent = {
        isOpen: false,
        _history: [],
        
        init() {
            this.render();
            this.bindEvents();
        },

        render() {
            const existing = document.getElementById('agent-console');
            if (existing) existing.remove();

            const user = window.currentUser || (window.VIA && window.VIA.user);
            const guest = !user || user.is_guest;
            const html = `
                <div id="agent-console" class="agent-console">
                    <div class="agent-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <h2 style="font-family:'Syne', sans-serif; font-weight:800; font-size:1.5rem; color:#fff;">VIA AGENT</h2>
                                <p style="font-size:0.8rem; color:rgba(255,255,255,0.5); margin-top:2px;">Sovereign AI Command Layer</p>
                            </div>
                            <button onclick="closeAgent()" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer; padding:5px;">×</button>
                        </div>
                        
                        ${guest ? `
                            <div style="text-align:center; padding:3rem 1rem;">
                                <div style="font-size:3rem; margin-bottom:1rem; filter: grayscale(1) opacity(0.5);">🤖</div>
                                <h3 style="font-family:'Syne', sans-serif; font-weight:700; color:#fff; margin-bottom:0.5rem;">VIA Agent</h3>
                                <p style="font-size:0.9rem; color:rgba(255,255,255,0.6); margin-bottom:2rem;">Your AI command layer. Sign in to activate.</p>
                                <button onclick="closeAgent(); VIA.openAuth()" class="via-agent-btn" style="width:100%; padding:1rem; background:var(--saffron); border:none; color:#fff; border-radius:12px; font-weight:800; cursor:pointer;">SIGN IN TO ACCESS</button>
                            </div>
                        ` : `
                            <div id="agent-chat" style="height:320px; overflow-y:auto; margin-top:1.5rem; padding-right:10px; display:flex; flex-direction:column; gap:12px; scrollbar-width:none;">
                                <div class="agent-msg bot">Connected to VIA Orchestration Mesh. I am your sovereign agent. Use <strong>/post</strong>, <strong>/task</strong>, or just <strong>ask anything</strong> to begin.</div>
                            </div>

                            <div class="agent-input-wrap" style="position:relative; margin-top:1.5rem;">
                                <input type="text" id="agent-input" class="agent-input" placeholder="Type a task or command..." autocomplete="off">
                                <div style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--saffron); font-size:0.8rem; font-weight:800; opacity:0.6;">↵</div>
                            </div>
                            
                            <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button class="agent-chip" onclick="Agent.quickCommand('/post ')">✍️ /post</button>
                                <button class="agent-chip" onclick="Agent.quickCommand('/task ')">⚙️ /task</button>
                                <button class="agent-chip" onclick="Agent.quickCommand('/help')">❓ /help</button>
                            </div>
                        `}
                    </div>
                </div>
                <style>
                    .agent-msg { padding: 12px 16px; border-radius: 18px; font-size: 0.85rem; line-height: 1.5; max-width: 90%; word-wrap: break-word; white-space: pre-wrap; animation: msgIn 0.3s ease-out; }
                    @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .agent-msg.bot { background: rgba(112, 0, 255, 0.1); border: 1px solid rgba(112, 0, 255, 0.2); color: #fff; align-self: flex-start; border-bottom-left-radius: 4px; }
                    .agent-msg.user { background: rgba(255,103,31,0.1); border: 1px solid rgba(255,103,31,0.2); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
                    .agent-msg.error { background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.2); color: #ff8080; align-self: center; }
                    .agent-chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 99px; padding: 6px 14px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                    .agent-chip:hover { border-color: var(--saffron); transform: translateY(-2px); }
                    .agent-code-block { background: #000; border: 1px solid #333; padding: 10px; border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #0f0; margin: 8px 0; overflow-x: auto; }
                </style>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        },

        bindEvents() {
            const input = document.getElementById('agent-input');
            if (!input) return;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleInput(input.value);
                    input.value = '';
                }
            });
        },

        open() {
            this.render();
            this.bindEvents();
            document.getElementById('agent-console').classList.add('open');
            this.isOpen = true;
            const input = document.getElementById('agent-input');
            if (input) setTimeout(() => input.focus(), 150);
        },

        close() {
            const el = document.getElementById('agent-console');
            if (el) el.classList.remove('open');
            this.isOpen = false;
        },

        quickCommand(cmd) {
            const input = document.getElementById('agent-input');
            if (!input) return;
            input.value = cmd;
            input.focus();
        },

        addMessage(text, role = 'bot') {
            const chat = document.getElementById('agent-chat');
            if (!chat) return;
            const msg = document.createElement('div');
            msg.className = `agent-msg ${role}`;
            
            // Detect code blocks
            if (text.includes('```')) {
                const parts = text.split('```');
                let html = '';
                for (let i = 0; i < parts.length; i++) {
                    if (i % 2 === 1) {
                        html += `<div class="agent-code-block">${Parser.sanitize(parts[i])}</div>`;
                    } else {
                        html += parts[i].replace(/\n/g, '<br>');
                    }
                }
                msg.innerHTML = html;
            } else {
                msg.innerHTML = text.replace(/\n/g, '<br>');
            }
            
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
        },

        async handleInput(val) {
            const raw = val.trim();
            if (!raw) return;
            const input = Parser.sanitize(raw);
            this.addMessage(input, 'user');
            
            let cmd;
            let topic;

            if (input.startsWith('/')) {
                const parts = input.split(' ');
                cmd = parts[0].toLowerCase();
                topic = parts.slice(1).join(' ');
            } else {
                // Natural Language Intent Discovery (Bot-inspired heuristics)
                const low = input.toLowerCase();
                
                // 1. Check for Repo Task keywords if no explicit repo: tag
                const repoKeywords = ['commit', 'pull request', 'pr', 'branch', 'merge', 'repository', 'repo:'];
                const hasRepoIntent = repoKeywords.some(k => low.includes(k));
                
                if (low.includes('write') && low.includes('linkedin')) cmd = '/linkedin';
                else if (low.includes('write') && (low.includes('post') || low.includes('tweet'))) cmd = '/post';
                else if (low.includes('video') || low.includes('youtube') || low.includes('title')) cmd = '/youtube';
                else if (low.includes('help') || low.includes('commands')) cmd = '/help';
                else if (low.includes('session') || low.includes('id')) cmd = '/id';
                else {
                    cmd = '/task';
                    if (hasRepoIntent && !low.includes('repo:')) {
                        this.addMessage("<em>Note: To run a GitHub task, use the format 'repo: owner/repo'. Proceeding with standalone synthesis...</em>");
                    }
                }
                
                topic = input;
                this.addMessage(`<em>Routing as ${cmd} packet...</em>`);
            }

            await this.execute(cmd, topic);
        },

        async execute(base, args) {
            const apiKey = window.GEMINI_API_KEY || localStorage.getItem('via_gemini_key');

            switch(base) {
                case '/help':
                    this.addMessage("<strong>GN8R Command Layer 2.0</strong><br>/task [goal] — Generate code or files<br>/post [topic] — Viral social post<br>/linkedin [topic] — Professional post<br>/youtube [topic] — Video strategy<br>/help — Show this menu");
                    break;
                case '/id':
                    this.addMessage(`State: Synchronized<br>Mesh: Bharat-Core-01<br>Latency: 42ms`);
                    break;
                case '/post':
                case '/linkedin':
                case '/youtube':
                case '/task':
                    if (!args) {
                        this.addMessage(`Please provide a description. Usage: ${base} [topic]`, 'error');
                        return;
                    }
                    this.addMessage(`<em>Agent is synthesizing ${base} packet...</em>`);
                    await this.runGemini(base, args, apiKey);
                    break;
                default:
                    this.addMessage(`Unknown protocol: ${base}. Defaulting to task synthesis...`);
                    await this.runGemini('/task', base + ' ' + args, apiKey);
            }
        },

        async runGemini(command, topic, apiKey) {
            if (!apiKey) {
                const fallback = this.getFallback(command, topic);
                setTimeout(() => {
                    this.addMessage(fallback);
                    this.logRun(command, topic, fallback);
                }, 800);
                return;
            }

            try {
                const prompt = SYSTEM_PROMPTS[command] || SYSTEM_PROMPTS['/task'];
                const res = await fetch(`${GEMINI_CONFIG.endpoint}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: prompt }] },
                        contents: [{ role: 'user', parts: [{ text: topic }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
                    })
                });

                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                const data = await res.json();
                const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "Synthesis failed.";
                this.addMessage(output);
                this.logRun(command, topic, output);

                // Add filename suggestion for tasks
                if (command === '/task') {
                    const type = Parser.detectType(topic);
                    const filename = Parser.slugify(topic, type);
                    this.addMessage(`💡 Suggested filename: <strong>${filename}</strong>`);
                }

            } catch (err) {
                this.addMessage(`Network error in agent layer. ${err.message}`, 'error');
                const fallback = this.getFallback(command, topic);
                this.addMessage(fallback);
            }
        },

        getFallback(cmd, topic) {
            const t = topic.trim() || 'this topic';
            if (cmd === '/post') return `🔥 ${t} is changing the game in India right now! \n\n#BharatBuilds #VIA #India`;
            if (cmd === '/linkedin') return `Reflecting on ${t} and its impact for Indian founders. \n\nConsistency beats shortcuts. \n\n#Growth #BharatBuilds`;
            return `[Synthesis Fallback]\nConfiguring GEMINI_API_KEY required for real-time code generation. Outputting placeholder for ${t}.`;
        },

        async logRun(command, topic, output) {
            const user = window.currentUser || (window.VIA && window.VIA.user);
            if (!user || user.is_guest || !window.viaFirebase || !window.viaFirebase.db) return;
            try {
                await window.viaFirebase.db.collection('agent_runs').add({
                    uid: user.id || user.uid,
                    command,
                    topic,
                    output: output.slice(0, 500),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.warn('[Agent] Log failed:', e.message);
            }
        }
    };

    global.openAgent = () => Agent.open();
    global.closeAgent = () => Agent.close();
    global.AgentManager = Agent;

    document.addEventListener('DOMContentLoaded', () => Agent.init());

})(window);

