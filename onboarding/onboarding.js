(function () {
  'use strict';

  let currentStep = 1;
  let selectedRole = '';
  let selectedGoal = '';
  let onboardingElement = null;
  let resetButton = null;

  const roleOptions = [
    'Founder',
    'Buyer',
    'Student',
    'MSME'
  ];

  const goalOptions = {
    Founder: [
      'Validate a startup idea',
      'Reach first customers',
      'Build a better pitch'
    ],
    Buyer: [
      'Find trustworthy products',
      'Compare options quickly',
      'Make smarter purchases'
    ],
    Student: [
      'Discover learning tools',
      'Plan skill growth',
      'Stay consistent every week'
    ],
    MSME: [
      'Grow local sales',
      'Digitize business operations',
      'Build repeat customer demand'
    ]
  };

  function ensureResetButton() {
    if (resetButton) return;
    resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'via-onboarding-reset';
    resetButton.textContent = 'Reset onboarding';
    resetButton.addEventListener('click', function () {
      localStorage.removeItem('via_onboarded');
      window.location.reload();
    });
    document.body.appendChild(resetButton);
  }

  function getPlanItems() {
    const roleLabel = selectedRole || 'User';
    const goalLabel = selectedGoal || 'your goal';
    return [
      'Generated plan for your goal...',
      roleLabel + ' path selected for: ' + goalLabel + '.',
      'Explore recommendations and next actions tailored to your journey.',
      'Use VIA to keep learning, discovering, and moving faster.'
    ];
  }

  function closeOnboarding(destination) {
    localStorage.setItem('via_onboarded', 'true');
    if (onboardingElement) {
      onboardingElement.remove();
      onboardingElement = null;
    }
    if (destination === 'discover' && typeof window.switchLayer === 'function') {
      window.switchLayer('discover');
    } else if (destination === 'feed' && typeof window.switchLayer === 'function') {
      window.switchLayer('feed');
    }
  }

  function renderStep() {
    if (!onboardingElement) return;

    const progressMarkup = [1, 2, 3, 4].map(function (step) {
      return '<span class="' + (step <= currentStep ? 'is-active' : '') + '"></span>';
    }).join('');

    let title = '';
    let copy = '';
    let bodyMarkup = '';

    if (currentStep === 1) {
      title = 'What do you want to do?';
      copy = 'Choose the path that best matches how you want to use VIA.';
      bodyMarkup = '<div class="via-onboarding-options">' + roleOptions.map(function (role) {
        const selectedClass = selectedRole === role ? ' is-selected' : '';
        return '<button type="button" class="via-onboarding-option' + selectedClass + '" data-role="' + role + '">' + role + '</button>';
      }).join('') + '</div>';
    } else if (currentStep === 2) {
      title = 'What do you want to achieve?';
      copy = 'Pick a goal so VIA can shape your starting path.';
      bodyMarkup = '<div class="via-onboarding-options">' + (goalOptions[selectedRole] || []).map(function (goal) {
        const selectedClass = selectedGoal === goal ? ' is-selected' : '';
        return '<button type="button" class="via-onboarding-option' + selectedClass + '" data-goal="' + goal + '">' + goal + '</button>';
      }).join('') + '</div>';
    } else if (currentStep === 3) {
      title = 'Your starter plan';
      copy = 'Here is a tailored first step based on what you selected.';
      bodyMarkup = '<div class="via-onboarding-plan"><strong>' + (selectedRole || 'Your') + ' focus: ' + (selectedGoal || 'Explore VIA') + '</strong><ul>' + getPlanItems().map(function (item) {
        return '<li>' + item + '</li>';
      }).join('') + '</ul></div><button type="button" class="via-onboarding-next" data-next-step="4">Next</button>';
    } else {
      title = 'You are ready';
      copy = 'Choose how you want to enter VIA right now.';
      bodyMarkup = '<div class="via-onboarding-actions">'
        + '<button type="button" class="via-onboarding-action is-primary" data-complete="feed">Continue to VIA<small>Jump into the main feed.</small></button>'
        + '<button type="button" class="via-onboarding-action" data-complete="discover">Explore Feed<small>Start with discovery mode.</small></button>'
        + '</div>';
    }

    onboardingElement.innerHTML = ''
      + '<div class="via-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="via-onboarding-title">'
      + '  <div class="via-onboarding-step">Step ' + currentStep + ' of 4</div>'
      + '  <h2 class="via-onboarding-title" id="via-onboarding-title">' + title + '</h2>'
      + '  <p class="via-onboarding-copy">' + copy + '</p>'
      + bodyMarkup
      + '  <div class="via-onboarding-progress">' + progressMarkup + '</div>'
      + '</div>';

    const firstInteractive = onboardingElement.querySelector('button');
    if (firstInteractive) firstInteractive.focus();
  }

  function showOnboarding() {
    ensureResetButton();
    if (onboardingElement) return;

    currentStep = 1;
    selectedRole = '';
    selectedGoal = '';

    onboardingElement = document.createElement('div');
    onboardingElement.className = 'via-onboarding-overlay';
    onboardingElement.addEventListener('click', function (event) {
      if (event.target === onboardingElement && currentStep === 4) {
        closeOnboarding('feed');
      }
    });

    onboardingElement.addEventListener('click', function (event) {
      const role = event.target.getAttribute('data-role');
      const goal = event.target.getAttribute('data-goal');
      const nextStep = event.target.getAttribute('data-next-step');
      const complete = event.target.getAttribute('data-complete');

      if (role) {
        selectedRole = role;
        selectedGoal = '';
        currentStep = 2;
        renderStep();
        return;
      }

      if (goal) {
        selectedGoal = goal;
        currentStep = 3;
        renderStep();
        return;
      }

      if (nextStep) {
        currentStep = Number(nextStep);
        renderStep();
        return;
      }

      if (complete) {
        closeOnboarding(complete);
      }
    });

    document.body.appendChild(onboardingElement);
    renderStep();
  }

  window.showOnboarding = showOnboarding;

  window.addEventListener('load', function () {
    ensureResetButton();
    if (!localStorage.getItem('via_onboarded')) {
      showOnboarding();
    }
  });
})();
