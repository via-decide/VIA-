import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Eye,
  EyeOff,
  Hand,
  Loader2,
  Radar,
  Rocket,
  ShieldCheck,
  Watch,
} from 'lucide-react';
import {
  loadOnboardingProtocolSchema,
  normalizeProtocolSelection,
  type ProtocolCardOption,
  type ProtocolPreference,
  type ProtocolSchema,
  type SovereignProtocolSelection,
} from '../services/onboardingProtocolService';

interface SovereignProtocolModalProps {
  googleUserName: string;
  onComplete: (payload: { schema: ProtocolSchema; selection: SovereignProtocolSelection }) => Promise<void>;
}

const TOTAL_STEPS = 3;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  'glowing-hand': Hand,
};

const preferenceOptionIcon = (preferenceId: string, optionId: string) => {
  if (preferenceId === 'casio_gbd_200_bridge') {
    return optionId === 'enable' ? Watch : ShieldCheck;
  }

  if (preferenceId === 'telemetry_visibility') {
    return optionId === 'live_ops' ? Eye : EyeOff;
  }

  return optionId === 'live_ops' ? Activity : Radar;
};

const stepTitleStyles = 'text-[11px] uppercase tracking-[0.35em] text-cyan-300/75 font-semibold';
const panelStyles = 'rounded-[28px] border border-cyan-400/20 bg-black/50 shadow-[0_0_45px_rgba(34,211,238,0.12)] backdrop-blur-2xl';

function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index <= step ? 'w-10 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]' : 'w-5 bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

function ProtocolCard({ option, selected, onSelect }: { option: ProtocolCardOption; selected: boolean; onSelect: () => void }) {
  const Icon = iconMap[option.icon || 'rocket'] || Rocket;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-300 ${
        selected
          ? 'border-cyan-300/70 bg-cyan-300/12 shadow-[0_0_35px_rgba(34,211,238,0.25)]'
          : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/35 hover:bg-cyan-300/[0.04]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_45%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.22em] text-cyan-100">{option.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/35">{option.summary}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/65">{option.description}</p>
          <div className="flex flex-wrap gap-2">
            {option.tags?.map((tag) => (
              <span key={tag} className="rounded-full border border-cyan-300/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className={`mt-1 h-4 w-4 rounded-full border ${selected ? 'border-cyan-200 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]' : 'border-white/25'}`} />
      </div>
    </button>
  );
}

function PreferenceBlock({
  preference,
  value,
  onChange,
}: {
  preference: ProtocolPreference;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">{preference.label}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">{preference.summary}</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          {preference.control}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {preference.options.map((option) => {
          const Icon = preferenceOptionIcon(preference.id, option.id);
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-[22px] border p-4 text-left transition-all duration-300 ${
                selected
                  ? 'border-cyan-300/70 bg-cyan-300/12 shadow-[0_0_28px_rgba(34,211,238,0.18)]'
                  : 'border-white/10 bg-black/20 hover:border-cyan-300/35 hover:bg-cyan-300/[0.03]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SovereignProtocolModal: React.FC<SovereignProtocolModalProps> = ({ googleUserName, onComplete }) => {
  const [schema, setSchema] = useState<ProtocolSchema | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selection, setSelection] = useState<SovereignProtocolSelection>({
    orchestrationProfile: '',
    defaultStartMode: '',
    operationalPreferences: {},
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const nextSchema = await loadOnboardingProtocolSchema();
      if (!active) return;
      setSchema(nextSchema);
      setSelection(normalizeProtocolSelection({}, nextSchema));
    })();
    return () => {
      active = false;
    };
  }, []);

  const currentStep = useMemo(() => schema?.steps[step] || null, [schema, step]);

  const canAdvance = useMemo(() => {
    if (!schema || !currentStep) return false;
    if (currentStep.id === 'orchestration_profile') return Boolean(selection.orchestrationProfile);
    if (currentStep.id === 'default_start_mode') return Boolean(selection.defaultStartMode);
    return Object.keys(selection.operationalPreferences).length >= currentStep.options.length;
  }, [currentStep, schema, selection]);

  const handleNext = async () => {
    if (!schema) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    try {
      await onComplete({ schema, selection: normalizeProtocolSelection(selection, schema) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] overflow-hidden bg-[rgba(2,8,20,0.82)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_32%)]" />
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`relative w-full max-w-6xl overflow-hidden ${panelStyles}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_35%,transparent_65%,rgba(34,211,238,0.05))]" />
          <div className="relative grid min-h-[680px] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-white/8 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className={stepTitleStyles}>Welcome Protocol</p>
                  <div>
                    <h1 className="font-syne text-2xl font-extrabold uppercase tracking-[0.12em] text-white sm:text-3xl">
                      {schema?.headline} {googleUserName || 'OPERATOR'}
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-white/55">{schema?.subheadline || 'Loading sovereign startup manifest…'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <StepProgress step={step} />
                  <div className="space-y-3">
                    {schema?.steps.map((item, index) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border px-4 py-3 transition-all ${
                          index === step
                            ? 'border-cyan-300/45 bg-cyan-300/10 text-white'
                            : 'border-white/8 bg-white/[0.02] text-white/45'
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em]">Step {index + 1}</p>
                        <p className="mt-2 text-sm font-semibold">{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.04] p-4 text-sm leading-6 text-cyan-50/80">
                  The protocol schema is hydrated from depot files and committed against your validated Google identity before the main dashboard unlocks.
                </div>
              </div>
            </aside>

            <section className="flex min-h-[680px] flex-col p-6 sm:p-8">
              {!schema || !currentStep ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm uppercase tracking-[0.28em] text-cyan-100">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Hydrating depot schema
                  </div>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep.id}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="flex-1 space-y-6"
                    >
                      <div className="space-y-3 border-b border-white/8 pb-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={stepTitleStyles}>Step {step + 1} of {TOTAL_STEPS}</p>
                            <h2 className="mt-3 font-syne text-3xl font-extrabold tracking-[0.06em] text-white sm:text-4xl">
                              {currentStep.title}
                            </h2>
                          </div>
                          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
                            Sovereign Config
                          </div>
                        </div>
                        <p className="max-w-3xl text-sm leading-7 text-white/55">
                          {step === 0 && 'Choose the mission posture that should bias VIA recommendations, launcher defaults, and future operator tooling.'}
                          {step === 1 && 'Select which module should be staged as your primary launch corridor after initialization completes.'}
                          {step === 2 && 'Lock in wearable bridging and telemetry visibility before the session is authorized.'}
                        </p>
                      </div>

                      {currentStep.id === 'orchestration_profile' && (
                        <div className="grid gap-4 xl:grid-cols-2">
                          {currentStep.options.map((option) => (
                            <ProtocolCard
                              key={option.id}
                              option={option}
                              selected={selection.orchestrationProfile === option.id}
                              onSelect={() => setSelection((current) => ({ ...current, orchestrationProfile: option.id }))}
                            />
                          ))}
                        </div>
                      )}

                      {currentStep.id === 'default_start_mode' && (
                        <div className="grid gap-4 xl:grid-cols-2">
                          {currentStep.options.map((option) => (
                            <ProtocolCard
                              key={option.id}
                              option={{ ...option, tags: [option.module?.toUpperCase() || 'MODULE'] }}
                              selected={selection.defaultStartMode === option.id}
                              onSelect={() => setSelection((current) => ({ ...current, defaultStartMode: option.id }))}
                            />
                          ))}
                        </div>
                      )}

                      {currentStep.id === 'operational_preferences' && (
                        <div className="space-y-4">
                          {currentStep.options.map((preference) => (
                            <PreferenceBlock
                              key={preference.id}
                              preference={preference}
                              value={selection.operationalPreferences[preference.storageKey] || ''}
                              onChange={(value) => setSelection((current) => ({
                                ...current,
                                operationalPreferences: {
                                  ...current.operationalPreferences,
                                  [preference.storageKey]: value,
                                },
                              }))}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-6 flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep((current) => Math.max(0, current - 1))}
                      disabled={step === 0 || saving}
                      className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/45 transition hover:border-cyan-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Previous Step
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
                        Step {step + 1} of {TOTAL_STEPS}
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canAdvance || saving}
                        className="inline-flex items-center justify-center rounded-full border border-cyan-200/65 bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-[0.28em] text-slate-950 shadow-[0_0_26px_rgba(34,211,238,0.75)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Initializing
                          </span>
                        ) : (
                          <motion.span
                            animate={{ boxShadow: ['0 0 0 rgba(34,211,238,0)', '0 0 20px rgba(34,211,238,0.55)', '0 0 0 rgba(34,211,238,0)'] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="rounded-full"
                          >
                            INITIALIZE SOVEREIGN SESSION
                          </motion.span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SovereignProtocolModal;
