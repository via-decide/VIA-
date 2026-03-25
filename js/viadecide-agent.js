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
        '/task': 'You are the VIA Agent. Execute the task concisely. If content request: generate it. If research: provide structured summary. Return ONLY the result.'
    };

    const Agent = {
        isOpen: false,
        _draft: null,
        
        init() {
            this.render();
            // Try to recover agent state from Firestore if user is signed in
            this.bindEvents();
        },

        render() {
            // Remove existing console if any
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
                            <div id="agent-chat" style="height:300px; overflow-y:auto; margin-top:1.5rem; padding-right:10px; display:flex; flex-direction:column; gap:12px; scrollbar-width:none;">
                                <div class="agent-msg bot">Connected to VIA Orchestration Mesh. I am your sovereign agent. Use <strong>/post</strong>, <strong>/task</strong>, or <strong>/help</strong> to begin.</div>
                            </div>

                            <div class="agent-input-wrap" style="position:relative; margin-top:1.5rem;">
                                <input type="text" id="agent-input" class="agent-input" placeholder="Enter /command or ask anything..." autocomplete="off">
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
            this.render(); // Re-render to check guest status
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
            msg.innerHTML = text.replace(/\n/g, '<br>');
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
        },

        async handleInput(val) {
            const cmd = val.trim();
            if (!cmd) return;
            this.addMessage(cmd, 'user');
            
            if (cmd.startsWith('/')) {
                await this.execute(cmd);
            } else {
                // Default to a task/chat if no slash
                await this.execute('/task ' + cmd);
            }
        },

        async execute(cmd) {
            const parts = cmd.split(' ');
            const base = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');

            const apiKey = window.GEMINI_API_KEY || localStorage.getItem('via_gemini_key');

            switch(base) {
                case '/help':
                    this.addMessage("<strong>Command Engine 1.0</strong><br>/post [topic] — Viral content<br>/linkedin [topic] — Prof. insights<br>/youtube [topic] — Video brief<br>/task [goal] — Freeform agent execution<br>/id — Show current session hash");
                    break;
                case '/id':
                    this.addMessage(`User: ${window.currentUser?.id.slice(0,8)}...<br>State: Synchronized<br>Mesh: Bharat-Core-01`);
                    break;
                case '/post':
                case '/linkedin':
                case '/youtube':
                case '/task':
                    if (!args) {
                        this.addMessage(`Please provide a topic. Usage: ${base} [topic]`, 'error');
                        return;
                    }
                    this.addMessage(`<em>Agent is synthesizing ${base} packet...</em>`);
                    await this.runGemini(base, args, apiKey);
                    break;
                default:
                    this.addMessage(`Unknown protocol: ${base}. Defaulting to task synthesis...`);
                    await this.runGemini('/task', cmd, apiKey);
            }
        },

        async runGemini(command, topic, apiKey) {
            if (!apiKey) {
                console.warn('[Agent] No GEMINI_API_KEY found. Using orchestration fallbacks.');
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
                        generationConfig: { temperature: 0.8, maxOutputTokens: 600 }
                    })
                });

                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                const data = await res.json();
                const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "Synthesis failed.";
                this.addMessage(output);
                this.logRun(command, topic, output);
            } catch (err) {
                this.addMessage(`Network error in agent layer. Falling back to local templates.`, 'error');
                const fallback = this.getFallback(command, topic);
                this.addMessage(fallback);
            }
        },

        getFallback(cmd, topic) {
            const t = topic.trim() || 'this topic';
            if (cmd === '/post') return `🔥 ${t} is changing the game in India right now! \n\nBharat builds are finally scaling at global speed. Who else is watching this space? \n\n#BharatBuilds #VIA #India`;
            if (cmd === '/linkedin') return `I've been reflecting on ${t} and its impact on the Bharat ecosystem. \n\nKey takeaway: Consistency and local context beat pure capital every time. \n\nAre you building for the next billion? Let\'s discuss.`;
            return `[Agent Response: ${t}]\nProcessed locally. Configure GEMINI_API_KEY for sovereign synthesis.`;
        },

        async logRun(command, topic, output) {
            const user = window.currentUser;
            if (!user || user.is_guest || !window.viaFirebase || !window.viaFirebase.db) return;
            try {
                await window.viaFirebase.db.collection('agent_runs').add({
                    uid: user.id,
                    command,
                    topic,
                    output,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.warn('[Agent] Failed to log run:', e.message);
            }
        }
    };

    global.openAgent = () => Agent.open();
    global.closeAgent = () => Agent.close();
    global.AgentManager = Agent; // Export for internal tool use

    document.addEventListener('DOMContentLoaded', () => Agent.init());

})(window);
