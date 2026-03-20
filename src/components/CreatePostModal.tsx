import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Loader2, Send, Mic, MicOff, Sparkles, Youtube, Linkedin, Bot, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';
import { generateContent, type PostCommand } from '../services/agentService';

// ── Web Speech API types (browser-native, no package needed) ──────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ── Slash commands ─────────────────────────────────────────────────────────────
const COMMANDS = [
  { cmd: '/post'     as PostCommand, label: 'VIA Post',   icon: Sparkles, color: 'text-via-accent', desc: 'Viral social post for Bharat' },
  { cmd: '/linkedin' as PostCommand, label: 'LinkedIn',   icon: Linkedin, color: 'text-blue-400',   desc: 'Professional long-form post' },
  { cmd: '/youtube'  as PostCommand, label: 'YouTube',    icon: Youtube,  color: 'text-red-400',    desc: 'Video title + description' },
  { cmd: '/task'     as PostCommand, label: 'Agent Task', icon: Bot,      color: 'text-via-gold',   desc: 'Run an agent workflow' },
] as const;

type CommandKey = PostCommand;

// ── Component ─────────────────────────────────────────────────────────────────
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (content: string, imageUrl?: string) => Promise<void>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Command state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCommand, setActiveCommand] = useState<CommandKey | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect voice support on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  // Show command picker when content starts with "/"
  useEffect(() => {
    if (content.startsWith('/') && !activeCommand) {
      setShowCommands(true);
    } else if (!content.startsWith('/')) {
      setShowCommands(false);
    }
  }, [content, activeCommand]);

  // ── Voice recognition ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening…');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');

      // Normalise "slash post" / "slash task" spoken commands to /cmd
      const normalised = transcript
        .replace(/^slash\s+/i, '/')
        .replace(/\bslash post\b/gi, '/post')
        .replace(/\bslash linkedin\b/gi, '/linkedin')
        .replace(/\bslash youtube\b/gi, '/youtube')
        .replace(/\bslash task\b/gi, '/task');

      setContent(normalised);
      setVoiceStatus(event.results[event.results.length - 1].isFinal ? 'Got it!' : 'Hearing you…');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setVoiceStatus(event.error === 'not-allowed' ? 'Mic blocked — check browser permissions' : 'Couldn\'t hear that, try again');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setVoiceStatus(''), 2000);
      recognitionRef.current = null;
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleMic = useCallback(() => {
    if (isListening) { stopListening(); } else { startListening(); }
  }, [isListening, startListening, stopListening]);

  // ── Slash command execution ────────────────────────────────────────────────
  const runCommand = useCallback(async (cmd: CommandKey, topicOverride?: string) => {
    // Extract topic: everything after the command token
    const topic = topicOverride
      ?? (content.replace(new RegExp(`^${cmd}\\s*`, 'i'), '').trim()
      || 'innovation in Bharat');

    setActiveCommand(cmd);
    setShowCommands(false);
    setIsGenerating(true);
    setError('');

    try {
      const generated = await generateContent(cmd, topic, user.displayName);
      setContent(generated);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } catch (err) {
      setError('Generation failed — you can still write manually');
    } finally {
      setIsGenerating(false);
    }
  }, [content, user.displayName]);

  // Handle pressing Enter or Tab to confirm a command
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showCommands) return;
    const matched = COMMANDS.find(c => content.startsWith(c.cmd));
    if (matched && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      runCommand(matched.cmd);
    }
  }, [showCommands, content, runCommand]);

  // ── Post save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!content.trim()) { setError('Please write something first'); return; }
    setIsSaving(true);
    setError('');
    try {
      await onSave(content, imageUrl || undefined);
      setContent('');
      setImageUrl('');
      setActiveCommand(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    recognitionRef.current?.abort();
    setIsListening(false);
    setActiveCommand(null);
    setShowCommands(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-via-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg bg-via-dark border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                  {user.avatarEmoji || '🇮🇳'}
                </div>
                <div>
                  <h2 className="font-bold text-sm flex items-center gap-2">
                    Create Post
                    {activeCommand && (
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 ${
                        activeCommand === '/post' ? 'text-via-accent' :
                        activeCommand === '/linkedin' ? 'text-blue-400' :
                        activeCommand === '/youtube' ? 'text-red-400' : 'text-via-gold'
                      }`}>
                        {activeCommand.slice(1)}
                      </span>
                    )}
                  </h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">
                    {isListening ? '🔴 Listening…' : voiceStatus || 'Sharing with Bharat'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Slash command picker */}
              <AnimatePresence>
                {showCommands && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {COMMANDS.map((cmd) => {
                      const Icon = cmd.icon;
                      const isMatch = content.toLowerCase().startsWith(cmd.cmd);
                      return (
                        <button
                          key={cmd.cmd}
                          onClick={() => runCommand(cmd.cmd)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                            isMatch
                              ? 'bg-white/10 border-white/20'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <Icon size={16} className={cmd.color} />
                          <div>
                            <div className={`text-xs font-bold ${cmd.color}`}>{cmd.label}</div>
                            <div className="text-[10px] text-white/40">{cmd.desc}</div>
                          </div>
                          {isMatch && <ChevronRight size={12} className="ml-auto text-white/40" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Voice status bar */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 2.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1 h-4 bg-red-400 rounded-full origin-bottom"
                        />
                      ))}
                    </div>
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
                      Listening — say a command or your post
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generating state */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-via-accent/10 border border-via-accent/20"
                  >
                    <Sparkles size={14} className="text-via-accent animate-pulse" />
                    <span className="text-via-accent text-xs font-bold uppercase tracking-widest">
                      Agent is writing…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  autoFocus
                  placeholder={`What's happening in your part of Bharat?\n\nTip: type / or tap the mic to use voice commands\n  /post  /linkedin  /youtube  /task`}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (activeCommand && !e.target.value.startsWith('/')) setActiveCommand(null);
                  }}
                  onKeyDown={handleKeyDown}
                  rows={5}
                  disabled={isGenerating}
                  className="w-full bg-transparent text-base text-white placeholder:text-white/20 focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
                />
                {/* Command hint when empty */}
                {!content && !isListening && !isGenerating && (
                  <div className="absolute bottom-0 right-0 flex gap-1 pointer-events-none">
                    {COMMANDS.map(c => (
                      <span key={c.cmd} className="text-[9px] font-bold text-white/15 uppercase tracking-widest">{c.cmd}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image input */}
              {showImageInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors"
                  />
                </motion.div>
              )}

              {error && <p className="text-red-400 text-xs ml-2">{error}</p>}

              {/* Action bar */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {/* Mic button */}
                  {voiceSupported && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMic}
                      title={isListening ? 'Stop listening' : 'Speak your post or command'}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isListening
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </motion.button>
                  )}

                  {/* Image button */}
                  <button
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      showImageInput ? 'bg-via-accent text-white' : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <ImageIcon size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Image</span>
                  </button>

                  {/* Quick command buttons */}
                  {!isGenerating && !activeCommand && (
                    <button
                      onClick={() => { setContent('/'); textareaRef.current?.focus(); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-white/30 hover:text-via-accent hover:bg-white/5 transition-colors"
                      title="Open command menu"
                    >
                      <Sparkles size={15} />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">AI</span>
                    </button>
                  )}

                  {/* Clear generated content */}
                  {activeCommand && !isGenerating && (
                    <button
                      onClick={() => { setContent(''); setActiveCommand(null); textareaRef.current?.focus(); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving || isGenerating || !content.trim()}
                  className="px-8 py-3 rounded-xl bg-via-accent text-white font-bold flex items-center justify-center gap-2 hover:bg-via-accent/80 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
