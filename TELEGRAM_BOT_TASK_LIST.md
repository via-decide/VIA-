# 🤖 TELEGRAM BOT MISSION CONTROL: PHASE 1 & 2

## Mission: Build Infrastructure & Core Services
**Task Status**: Pending Execute
**Priority**: HIGH

### 1. FRONTEND: UI/UX & ROUTING (Shell Foundation)
- [ ] **Implement router.js**: Core engine for parsing `/tool/{id}` and handling cross-tool navigation.
- [ ] **Build Shell index.html**: Create the global layout including the sidebar, header, and the main tool carrier (iframe).
- [ ] **Implement Global Search**: Client-side search across all 44 tools via `nav-registry.json`.
- [ ] **Responsive Design Polish**: Ensure the sidebar collapses on mobile and the tool-runner area adapts to any screen size.

### 2. BACKEND: AUTH & STATE SERVICES
- [ ] **Implement Auth Service (`/services/auth-service.js`)**:
    - [ ] Sign-up logic (User registration data flow).
    - [ ] Login logic (Token management & protected tool access).
    - [ ] Auth state persistence.
- [ ] **Implement State Bridge (`/services/state-bridge.js`)**:
    - [ ] LocalStorage-based sharing logic.
    - [ ] postMessage listener for cross-tool communication.
- [ ] **Environment Config (`/services/config.js`)**:
    - [ ] API endpoint mapping.
    - [ ] Feature flagging for new vs. legacy tools.

### 3. TOOL MIGRATION: CONTENT & LOGIC (Phase 2)
- [ ] **Batch 1 (Critical Path)**:
    - [ ] `decide.engine-tools`: Copy source, update manifest, test in shell.
    - [ ] `decide.engine`: Restore licensing/demo functionality.
    - [ ] `cohort`: Ensure Remotion build folder is served correctly.
- [ ] **Batch 2 (Core Logic Restore)**:
    - [ ] `food.decider`: Restore Google Maps integration.
    - [ ] `PromptAlchemy`: Re-link OpenAI/Anthropic API logic to central `config.js`.
    - [ ] `creator-tool`: Ensure new tool saving logic correctly outputs to the monorepo structure.

### 4. GIT OPERATIONS (Telegram Bot Priority)
- [ ] **Archive 44 Legacy Repos**: Set to read-only and add the migration README notice.
- [ ] **Deploy Initial Monorepo**: Push Phase 0 structure to the new `viadecide/viadecide` master repo.
- [ ] **Initialize Vercel Project**: Link the monorepo for production deployment at `www.viadecide.com`.

---
## HOW TO EXECUTE (For Telegram Bot)
1. **Send command**: `/task-execute [TASK_NAME]`
2. **Review output**: Bot reads `outputs/TELEGRAM_BOT_TASK_LIST.md` and generates pull requests for the selected bullet points.
3. **Verify**: Check PR diffs against the `VIADECIDE_CONSOLIDATION_BLUEPRINT.md`.
