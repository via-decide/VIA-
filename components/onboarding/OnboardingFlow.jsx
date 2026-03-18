import React, { useEffect, useMemo, useState } from 'react';
import './OnboardingFlow.css';

const ROLE_OPTIONS = ['Founder', 'Buyer', 'Student', 'MSME'];

const INTENT_OPTIONS = {
  Founder: ['Build a product', 'Plan backend/frontend', 'Validate idea'],
  Buyer: ['Compare solutions', 'Shortlist vendors', 'Prepare requirements'],
  Student: ['Start a project', 'Learn a roadmap', 'Build a portfolio'],
  MSME: ['Improve operations', 'Digitize workflow', 'Find growth ideas'],
};

const TOTAL_STEPS = 5;

function generateOutput(role, intent) {
  return {
    title: 'Generated Plan',
    content: `This is a structured output for ${role.toLowerCase()}s who want to ${intent.toLowerCase()}.`,
  };
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [intent, setIntent] = useState('');
  const [output, setOutput] = useState(null);

  const intents = useMemo(() => INTENT_OPTIONS[role] || [], [role]);

  useEffect(() => {
    if (step === 3 && role && intent) {
      setOutput(generateOutput(role, intent));
    }
  }, [step, role, intent]);

  const handleRoleSelect = (nextRole) => {
    setRole(nextRole);
    setIntent('');
    setOutput(null);
    setStep(2);
  };

  const handleIntentSelect = (nextIntent) => {
    setIntent(nextIntent);
    setOutput(null);
    setStep(3);
  };

  const handleAction = (action) => {
    console.log(action, { role, intent, output });

    if (action === 'Modify') {
      setStep(2);
      return;
    }

    if (action === 'Run Again') {
      setOutput(generateOutput(role, intent));
      return;
    }

    if (action === 'Post to Feed') {
      setStep(5);
    }
  };

  const renderProgress = () => (
    <div className="onboarding-progress" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
      <div className="onboarding-progress__bar" aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const itemStep = index + 1;
          const stateClass = itemStep < step ? 'is-complete' : itemStep === step ? 'is-active' : '';

          return <span key={itemStep} className={`onboarding-progress__dot ${stateClass}`.trim()} />;
        })}
      </div>
      <p className="onboarding-progress__label">Step {step} → Step {TOTAL_STEPS}</p>
    </div>
  );

  return (
    <section className="onboarding-flow">
      <div className="onboarding-flow__shell">
        {renderProgress()}

        <div className="onboarding-card" key={step}>
          {step === 1 && (
            <div className="onboarding-step">
              <p className="onboarding-step__eyebrow">Welcome</p>
              <h2>What do you want to do today?</h2>
              <div className="onboarding-options">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`onboarding-option ${role === option ? 'is-selected' : ''}`.trim()}
                    onClick={() => handleRoleSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step">
              <p className="onboarding-step__eyebrow">{role}</p>
              <h2>Pick your first move</h2>
              <div className="onboarding-options">
                {intents.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`onboarding-option ${intent === option ? 'is-selected' : ''}`.trim()}
                    onClick={() => handleIntentSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button type="button" className="onboarding-link" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          )}

          {step === 3 && output && (
            <div className="onboarding-step onboarding-step--result">
              <p className="onboarding-step__eyebrow">{role} → {intent}</p>
              <div className="onboarding-result-card">
                <span className="onboarding-result-card__badge">Ready</span>
                <h2>{output.title}</h2>
                <p>{output.content}</p>
              </div>
              <button type="button" className="onboarding-primary" onClick={() => setStep(4)}>
                Continue
              </button>
            </div>
          )}

          {step === 4 && output && (
            <div className="onboarding-step onboarding-step--actions">
              <p className="onboarding-step__eyebrow">Next</p>
              <div className="onboarding-result-card">
                <h2>{output.title}</h2>
                <p>{output.content}</p>
              </div>
              <div className="onboarding-actions">
                {['Post to Feed', 'Modify', 'Run Again'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    className={`onboarding-action ${action === 'Post to Feed' ? 'is-primary' : ''}`.trim()}
                    onClick={() => handleAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="onboarding-step onboarding-step--complete">
              <p className="onboarding-step__eyebrow">Complete</p>
              <h2>You created your first output</h2>
              <div className="onboarding-actions onboarding-actions--stacked">
                <button type="button" className="onboarding-action is-primary" onClick={() => console.log('Explore Feed')}>
                  Explore Feed
                </button>
                <button type="button" className="onboarding-action" onClick={() => console.log('Use More Tools')}>
                  Use More Tools
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
