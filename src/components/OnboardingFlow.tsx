import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, MapPin, ChevronRight, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  displayName: string;
  username: string;
  avatarEmoji: string;
  bio: string;
  city: string;
}

interface OnboardingFlowProps {
  initialDisplayName?: string;
  initialUsername?: string;
  onComplete: (data: OnboardingData) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_OPTIONS = [
  '🇮🇳','🦁','🐯','🦊','🐺','🦋','🌸','⚡','🔥','🌊',
  '🌙','✨','🎭','🎨','🎵','🏆','💡','🌿','🦅','🐉',
  '🌺','🎯','💎','🚀','🌈','🦄','🐧','🦚','🍀','🌙',
];

const CITY_OPTIONS = [
  'Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata',
  'Pune','Ahmedabad','Jaipur','Lucknow','Surat','Kanpur',
  'Nagpur','Indore','Bhopal','Visakhapatnam','Patna','Vadodara',
];

const TOTAL_STEPS = 5;

// ─── Step animations ─────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ─── Progress Dots ────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === step ? 28 : 8,
          backgroundColor: i < step ? '#FF3D00' : i === step ? '#FF3D00' : 'rgba(255,255,255,0.15)',
        }}
        transition={{ duration: 0.3 }}
        className="h-2 rounded-full"
      />
    ))}
  </div>
);

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

const StepWelcome: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-10">
    {/* Background blobs */}
    <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-via-accent/25 blur-[140px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-via-gold/15 blur-[140px] rounded-full pointer-events-none" />

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      className="relative"
    >
      <div className="w-28 h-28 bg-via-accent rounded-[2.2rem] mx-auto flex items-center justify-center shadow-2xl shadow-via-accent/50">
        <Sparkles className="w-14 h-14 text-white" />
      </div>
      {/* Orbiting ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-12px] rounded-[2.8rem] border-2 border-dashed border-via-accent/30"
      />
    </motion.div>

    <div className="space-y-3 relative z-10">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="font-syne font-extrabold text-6xl tracking-tighter text-white"
      >
        VIA
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="font-syne font-bold text-via-gold text-sm uppercase tracking-[0.25em]"
      >
        Bharat's Social Platform
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 text-base leading-relaxed max-w-xs mx-auto"
      >
        Let's set up your identity. It takes 30 seconds.
      </motion.p>
    </div>

    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onNext}
      className="relative z-10 w-full max-w-xs py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-via-accent/40"
    >
      Let's Go
      <ArrowRight size={20} strokeWidth={2.5} />
    </motion.button>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-white/20 text-xs font-bold uppercase tracking-widest relative z-10"
    >
      1000 credits waiting for you ✨
    </motion.p>
  </div>
);

// ─── Step 1: Display Name ─────────────────────────────────────────────────────

const StepName: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}> = ({ value, onChange, onNext }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400); }, []);

  return (
    <div className="flex flex-col justify-between h-full px-6 pt-8 pb-12">
      <div className="space-y-8">
        {/* Step label */}
        <div className="space-y-1">
          <span className="text-via-accent text-xs font-bold uppercase tracking-[0.25em]">Step 1 of {TOTAL_STEPS}</span>
          <h2 className="font-syne font-extrabold text-4xl text-white leading-tight">
            What should<br />we call you?
          </h2>
          <p className="text-white/40 text-sm">This is your display name — you can change it anytime.</p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Your name…"
              maxLength={30}
              className="w-full bg-white/5 border-2 border-white/10 focus:border-via-accent rounded-2xl px-5 py-5 text-white text-2xl font-syne font-bold placeholder:text-white/20 focus:outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && value.trim() && onNext()}
            />
            {value.trim() && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-via-accent flex items-center justify-center"
              >
                <Check size={16} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </div>
          <p className="text-white/20 text-xs text-right font-mono">{value.length}/30</p>
        </div>

        {/* Suggestion chips */}
        <div className="space-y-2">
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Quick picks</span>
          <div className="flex flex-wrap gap-2">
            {['Explorer', 'Creator', 'Builder', 'Dreamer', 'Pioneer'].map(s => (
              <button
                key={s}
                onClick={() => onChange(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  value === s
                    ? 'bg-via-accent border-via-accent text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-via-accent/50 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        disabled={!value.trim()}
        className="w-full py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity shadow-2xl shadow-via-accent/30"
      >
        Continue <ArrowRight size={20} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

// ─── Step 2: Avatar ───────────────────────────────────────────────────────────

const StepAvatar: React.FC<{
  selected: string;
  onSelect: (e: string) => void;
  onNext: () => void;
}> = ({ selected, onSelect, onNext }) => (
  <div className="flex flex-col justify-between h-full px-6 pt-8 pb-12">
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-via-accent text-xs font-bold uppercase tracking-[0.25em]">Step 2 of {TOTAL_STEPS}</span>
        <h2 className="font-syne font-extrabold text-4xl text-white leading-tight">
          Pick your<br />avatar
        </h2>
        <p className="text-white/40 text-sm">This is how you'll appear across VIA.</p>
      </div>

      {/* Selected preview */}
      <motion.div
        key={selected}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-via-accent flex items-center justify-center text-5xl shadow-2xl shadow-via-accent/20">
          {selected}
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-3">
        {AVATAR_OPTIONS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(emoji)}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border-2 ${
              selected === emoji
                ? 'border-via-accent bg-via-accent/20 shadow-lg shadow-via-accent/20'
                : 'border-transparent bg-white/5 hover:bg-white/10'
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onNext}
      className="w-full py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-via-accent/30"
    >
      Continue <ArrowRight size={20} strokeWidth={2.5} />
    </motion.button>
  </div>
);

// ─── Step 3: Bio ──────────────────────────────────────────────────────────────

const StepBio: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}> = ({ value, onChange, onNext, onSkip }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 400); }, []);

  return (
    <div className="flex flex-col justify-between h-full px-6 pt-8 pb-12">
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-via-accent text-xs font-bold uppercase tracking-[0.25em]">Step 3 of {TOTAL_STEPS}</span>
          <h2 className="font-syne font-extrabold text-4xl text-white leading-tight">
            What's your<br />vibe?
          </h2>
          <p className="text-white/40 text-sm">A short line about you. Optional.</p>
        </div>

        <div className="space-y-2">
          <textarea
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Builder. Thinker. Bharat-first. 🇮🇳"
            maxLength={120}
            rows={4}
            className="w-full bg-white/5 border-2 border-white/10 focus:border-via-accent rounded-2xl px-5 py-4 text-white text-base font-medium placeholder:text-white/20 focus:outline-none transition-colors resize-none leading-relaxed"
          />
          <p className="text-white/20 text-xs text-right font-mono">{value.length}/120</p>
        </div>

        {/* Prompt suggestions */}
        <div className="space-y-2">
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Try one</span>
          <div className="space-y-2">
            {[
              "Building things for Bharat 🇮🇳",
              "Creator. Explorer. Always learning.",
              "Digital nomad navigating India's startup scene.",
            ].map(p => (
              <button
                key={p}
                onClick={() => onChange(p)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/8 hover:border-via-accent/40 hover:bg-white/8 text-white/50 hover:text-white/80 text-sm transition-all"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-via-accent/30"
        >
          Continue <ArrowRight size={20} strokeWidth={2.5} />
        </motion.button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

// ─── Step 4: City ─────────────────────────────────────────────────────────────

const StepCity: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}> = ({ value, onChange, onNext, onSkip }) => (
  <div className="flex flex-col justify-between h-full px-6 pt-8 pb-12">
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-via-accent text-xs font-bold uppercase tracking-[0.25em]">Step 4 of {TOTAL_STEPS}</span>
        <h2 className="font-syne font-extrabold text-4xl text-white leading-tight">
          Where are<br />you based?
        </h2>
        <p className="text-white/40 text-sm">Helps us connect you with your city's community.</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your city…"
          className="w-full bg-white/5 border-2 border-white/10 focus:border-via-accent rounded-2xl pl-10 pr-5 py-4 text-white font-medium placeholder:text-white/20 focus:outline-none transition-colors"
        />
      </div>

      {/* City chips */}
      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
        {CITY_OPTIONS.filter(c =>
          !value || c.toLowerCase().includes(value.toLowerCase())
        ).map(city => (
          <motion.button
            key={city}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(city)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              value === city
                ? 'bg-via-accent border-via-accent text-white shadow-lg shadow-via-accent/20'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-via-accent/50 hover:text-white'
            }`}
          >
            {city}
          </motion.button>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-via-accent/30"
      >
        Continue <ArrowRight size={20} strokeWidth={2.5} />
      </motion.button>
      <button
        onClick={onSkip}
        className="w-full py-2 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
      >
        Skip for now
      </button>
    </div>
  </div>
);

// ─── Step 5: Done ─────────────────────────────────────────────────────────────

const StepDone: React.FC<{
  data: OnboardingData;
  onComplete: () => void;
  isSaving: boolean;
}> = ({ data, onComplete, isSaving }) => {
  const rewards = [
    { icon: '✨', label: '1,000 Credits', sub: 'Welcome bonus' },
    { icon: '⚡', label: 'Level 1', sub: 'Your journey begins' },
    { icon: '🏆', label: 'Founder Badge', sub: 'Early adopter' },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full px-6 pt-12 pb-12 text-center">
      <div className="space-y-8 w-full">
        {/* Animated avatar */}
        <div className="relative mx-auto w-28 h-28">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="w-28 h-28 rounded-3xl bg-gradient-to-br from-via-accent to-via-gold flex items-center justify-center text-5xl shadow-2xl shadow-via-accent/40"
          >
            {data.avatarEmoji}
          </motion.div>
          {/* Pulse rings */}
          {[1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border-2 border-via-accent"
            />
          ))}
        </div>

        <div className="space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-syne font-extrabold text-4xl text-white"
          >
            You're all set,<br />{data.displayName}!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm"
          >
            Welcome to VIA — Bharat's social platform.
          </motion.p>
        </div>

        {/* Reward cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3"
        >
          {rewards.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1"
            >
              <div className="text-2xl">{r.icon}</div>
              <div className="text-white font-bold text-xs leading-tight">{r.label}</div>
              <div className="text-white/30 text-[10px]">{r.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onComplete}
        disabled={isSaving}
        className="w-full py-5 rounded-2xl bg-via-accent text-white font-syne font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-via-accent/40 disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
            />
            Setting up…
          </>
        ) : (
          <>
            <Zap size={20} className="fill-white" />
            Enter VIA
            <ChevronRight size={20} strokeWidth={2.5} />
          </>
        )}
      </motion.button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialDisplayName = '',
  initialUsername = '',
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    displayName: initialDisplayName,
    username: initialUsername,
    avatarEmoji: '🇮🇳',
    bio: '',
    city: '',
  });

  const update = (field: keyof OnboardingData) => (value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await onComplete(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-via-dark flex flex-col overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-via-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-via-gold/8 blur-[100px] rounded-full pointer-events-none" />

      {/* Top bar — only shown on steps 1–4 */}
      <AnimatePresence>
        {step > 0 && step < TOTAL_STEPS && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between px-6 pt-14 pb-4 flex-shrink-0"
          >
            <button
              onClick={() => go(step - 1)}
              className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              ← Back
            </button>
            <ProgressDots step={step - 1} total={TOTAL_STEPS - 1} />
            <div className="w-12" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {step === 0 && <StepWelcome onNext={() => go(1)} />}
            {step === 1 && (
              <StepName
                value={data.displayName}
                onChange={update('displayName')}
                onNext={() => go(2)}
              />
            )}
            {step === 2 && (
              <StepAvatar
                selected={data.avatarEmoji}
                onSelect={update('avatarEmoji')}
                onNext={() => go(3)}
              />
            )}
            {step === 3 && (
              <StepBio
                value={data.bio}
                onChange={update('bio')}
                onNext={() => go(4)}
                onSkip={() => go(4)}
              />
            )}
            {step === 4 && (
              <StepCity
                value={data.city}
                onChange={update('city')}
                onNext={() => go(5)}
                onSkip={() => go(5)}
              />
            )}
            {step === 5 && (
              <StepDone
                data={data}
                onComplete={handleFinish}
                isSaving={isSaving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
