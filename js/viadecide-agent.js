(function(global) {
    'use strict';

    const Agent = {
        isOpen: false,
        
        init() {
            this.render();
            this.bindEvents();
        },

        render() {
            const html = `
                <div id="agent-console" class="agent-console">
                    <div class="agent-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <h2 style="font-family:'Syne', sans-serif; font-weight:800; font-size:1.5rem; color:#fff;">VIA AGENT</h2>
                                <p style="font-size:0.8rem; color:rgba(255,255,255,0.5); margin-top:2px;">2026 Sovereign AI Core</p>
                            </div>
                            <button onclick="closeAgent()" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">×</button>
                        </div>
                        
                        <div id="agent-chat" style="height:250px; overflow-y:auto; margin-top:1.5rem; padding-right:10px; display:flex; flex-direction:column; gap:12px; scrollbar-width:none;">
                            <div class="agent-msg bot">Hello. I am the VIA Agent. I can help you find tools, browse directories, or generate content for your feed. What shall we do today?</div>
                        </div>

                        <div class="agent-input-wrap" style="position:relative; margin-top:1.5rem;">
                            <input type="text" id="agent-input" class="agent-input" placeholder="Type a command (e.g. /pull news, /kutch, /write)..." autocomplete="off">
                            <div style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--saffron); font-size:0.8rem; font-weight:800; opacity:0.6;">↵</div>
                        </div>
                        
                        <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                            <button class="agent-chip" onclick="agentCommand('/kutch')">📍 Kutch Map</button>
                            <button class="agent-chip" onclick="agentCommand('/pull')">🔄 Sync Feed</button>
                            <button class="agent-chip" onclick="agentCommand('/write')">✍️ Write Post</button>
                        </div>
                    </div>
                </div>
                <style>
                    .agent-msg { padding: 12px 16px; border-radius: 18px; font-size: 0.9rem; line-height: 1.4; max-width: 85%; }
                    .agent-msg.bot { background: rgba(255,103,31,0.1); border: 1px solid rgba(255,103,31,0.2); color: #fff; align-self: flex-start; border-bottom-left-radius: 4px; }
                    .agent-msg.user { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); align-self: flex-end; border-bottom-right-radius: 4px; }
                    .agent-chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 99px; padding: 6px 12px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                    .agent-chip:hover { border-color: var(--saffron); color: var(--saffron); background: rgba(255,103,31,0.05); }
                </style>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        },

        bindEvents() {
            const input = document.getElementById('agent-input');
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleInput(input.value);
                    input.value = '';
                }
            });
        },

        open() {
            document.getElementById('agent-console').classList.add('open');
            this.isOpen = true;
            setTimeout(() => document.getElementById('agent-input').focus(), 100);
        },

        close() {
            document.getElementById('agent-console').classList.remove('open');
            this.isOpen = false;
        },

        addMessage(text, role = 'bot') {
            const chat = document.getElementById('agent-chat');
            const msg = document.createElement('div');
            msg.className = `agent-msg ${role}`;
            msg.textContent = text;
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
        },

        handleInput(val) {
            const cmd = val.trim();
            if (!cmd) return;
            
            this.addMessage(cmd, 'user');
            
            if (cmd.startsWith('/')) {
                this.execute(cmd);
            } else {
                this.addMessage("I am currently processing commands starting with '/'. Try /help to see what I can do.");
            }
        },

        execute(cmd) {
            const [base, ...args] = cmd.split(' ');
            
            switch(base.toLowerCase()) {
                case '/help':
                    this.addMessage("Available commands:\n/kutch - Explore Kutch Map\n/pull - Fetch latest feed content\n/write [text] - Stage a new post\n/tools - List 2026 toolset");
                    break;
                case '/kutch':
                    this.addMessage("Redirecting you to the Kutch Digital Map... Opening interactive player.");
                    setTimeout(() => window.location.href = '/Business-Directory', 1500);
                    break;
                case '/pull':
                    this.addMessage("Syncing with Bharat Content Mesh... Pulling 20 new data packets.");
                    if (window.refreshFeed) window.refreshFeed();
                    break;
                case '/write':
                    const body = args.join(' ');
                    if (!body) {
                        this.addMessage("Please provide the text for the post. Usage: /write [your story]");
                    } else {
                        this.addMessage(`Drafting: "${body.substring(0, 30)}..."`);
                        this.addMessage("Post staged in your profile. Send /confirm to publish.");
                        this._draft = body;
                    }
                    break;
                case '/confirm':
                    if (this._draft) {
                        this.addMessage("Publishing to VIA network...");
                        if (window.SocialCore && window.SocialCore.createPost) {
                            window.SocialCore.createPost({ body: this._draft }).then(() => {
                                this.addMessage("✅ Post live on global feed.");
                                this._draft = null;
                            });
                        }
                    } else {
                        this.addMessage("Nothing to confirm. Use /write first.");
                    }
                    break;
                default:
                    this.addMessage(`Unknown command: ${base}. Type /help for assistance.`);
            }
        }
    };

    global.openAgent = () => Agent.open();
    global.closeAgent = () => Agent.close();
    global.agentCommand = (cmd) => {
        const input = document.getElementById('agent-input');
        input.value = cmd;
        input.focus();
    };

    document.addEventListener('DOMContentLoaded', () => Agent.init());

})(window);
