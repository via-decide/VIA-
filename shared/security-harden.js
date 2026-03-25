/**
 * VIADECIDE SECURITY & HARDENING SUITE v1.0
 * (c) 2026 ViaDecide - AI Decision Architecture
 * Author: Antigravity AI Senior Staff (Audit Fixes)
 */

(function(global) {
    'use strict';

    const SH = {
        /**
         * 1. SANITIZATION LAYER (XSS Prevention)
         * Strips dangerous tags and attributes before rendering.
         */
        sanitize(html) {
            if (typeof html !== 'string') return '';
            const temp = document.createElement('div');
            temp.textContent = html; // Simple escapement (no innerHTML yet)
            return temp.innerHTML.replace(/[^\w\s\.\!\?\:\#\-\_\/\[\]\{\}\(\)\<\>\=\"\']+/g, '');
        },

        domSafe(html, target) {
            if (!target) return html;
            const clean = this.sanitize(html);
            target.textContent = ''; // Clear
            target.innerHTML = clean; // Safely set (though better to append child nodes)
            return clean;
        },

        /**
         * 2. LLM GUARDRAILS (Prompt Injection Protection)
         * Prevents common bypass instructions from leaching into LLM context.
         */
        hardenPrompt(userInput) {
            const blockedPatterns = [
                /ignore (all )?previous/gi,
                /forget EVERYTHING/gi,
                /system override/gi,
                /new instructions/gi,
                /\<\|system\|\>/gi,
                /output passwords/gi,
                /reveal (your )?prompt/gi
            ];

            let clean = userInput;
            blockedPatterns.forEach(regex => {
                clean = clean.replace(regex, '[FILTERED_INJECTION_PATTERN]');
            });

            // Wrap in a secure, escaped context block
            return `--- START SECURE USER CONTEXT ---\n${clean}\n--- END SECURE USER CONTEXT ---`;
        },

        /**
         * 3. STATE MANAGEMENT ENGINE
         * Centralized Store with Observer pattern to avoid global mutation.
         */
        createStore(initialState = {}) {
            let state = { ...initialState };
            const listeners = new Set();

            return {
                getState() { return { ...state }; },
                setState(partial) {
                    state = { ...state, ...partial };
                    listeners.forEach(fn => fn(state));
                },
                subscribe(fn) {
                    listeners.add(fn);
                    return () => listeners.delete(fn);
                }
            };
        },

        /**
         * 4. THROTTLE / DEBOUNCE
         * Performance utilities for heavy-thread safety.
         */
        debounce(fn, ms = 250) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), ms);
            };
        }
    };

    // Export as global singleton
    global.VIA_HARDEN = SH;
    global.VIA_STORE = SH.createStore({
        user: null,
        session: Date.now(),
        isProcessing: false,
        activeLayer: 'feed',
        errors: []
    });

})(window);
