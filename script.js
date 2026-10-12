/**
 * Recipe Scaler - Client-Side Interactive Application
 * Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const scalerForm = document.getElementById('scalerForm');
  const dishNameInput = document.getElementById('dishName');
  const recipeServingsInput = document.getElementById('recipeServings');
  const servingsWantedInput = document.getElementById('servingsWanted');

  const ingInputs = [
    {
      name: document.getElementById('ingName1'),
      amount: document.getElementById('ingAmount1'),
      unit: document.getElementById('ingUnit1'),
    },
    {
      name: document.getElementById('ingName2'),
      amount: document.getElementById('ingAmount2'),
      unit: document.getElementById('ingUnit2'),
    },
    {
      name: document.getElementById('ingName3'),
      amount: document.getElementById('ingAmount3'),
      unit: document.getElementById('ingUnit3'),
    },
  ];

  const messageBanner = document.getElementById('messageBanner');
  const messageText = document.getElementById('messageText');
  const messageCloseBtn = document.getElementById('messageCloseBtn');

  const resultsPlaceholder = document.getElementById('resultsPlaceholder');
  const resultsContent = document.getElementById('resultsContent');
  const resultsDishTitle = document.getElementById('resultsHeading');
  const displayOrigServings = document.getElementById('displayOrigServings');
  const displayTargetServings = document.getElementById('displayTargetServings');
  const displayScaleFactor = document.getElementById('displayScaleFactor');
  const scaledItemsList = document.getElementById('scaledItemsList');

  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const printBtn = document.getElementById('printBtn');
  const resetBtn = document.getElementById('resetBtn');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const quickButtons = document.querySelectorAll('.quick-buttons .btn-chip');

  const STORAGE_KEY = 'recipe_scaler_state_v1';

  // --- Helper Functions ---

  /**
   * Show a feedback notification message
   * @param {string} msg 
   * @param {'error' | 'success'} type 
   */
  function showMessage(msg, type = 'error') {
    messageBanner.className = `message-banner ${type}`;
    messageText.textContent = msg;
    messageBanner.classList.remove('hidden');
    messageBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Hide the message banner
   */
  function hideMessage() {
    messageBanner.classList.add('hidden');
    messageText.textContent = '';
  }

  /**
   * Clear and hide results, showing the empty placeholder state
   */
  function hideResults() {
    resultsContent.classList.add('hidden');
    resultsPlaceholder.classList.remove('hidden');
    scaledItemsList.innerHTML = '';
  }

  /**
   * Format decimal numbers cleanly (e.g. 5 instead of 5.00, or 2.33)
   * @param {number} num 
   * @returns {string}
   */
  function formatNumber(num) {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    // Up to 3 decimal places without trailing zeros
    const rounded = Math.round(num * 1000) / 1000;
    return parseFloat(rounded.toFixed(2)).toString();
  }

  /**
   * Approximate kitchen fractions for common cooking measures (optional enhancement)
   * @param {number} val 
   * @returns {string | null}
   */
  function getKitchenFraction(val) {
    if (val <= 0) return null;
    const whole = Math.floor(val);
    const remainder = val - whole;

    const commonFractions = [
      { decimal: 0.125, fraction: '⅛' },
      { decimal: 0.25, fraction: '¼' },
      { decimal: 0.333, fraction: '⅓' },
      { decimal: 0.375, fraction: '⅜' },
      { decimal: 0.5, fraction: '½' },
      { decimal: 0.625, fraction: '⅝' },
      { decimal: 0.666, fraction: '⅔' },
      { decimal: 0.75, fraction: '¾' },
      { decimal: 0.875, fraction: '⅞' }
    ];

    for (const item of commonFractions) {
      if (Math.abs(remainder - item.decimal) < 0.04) {
        return whole > 0 ? `${whole} ${item.fraction}` : item.fraction;
      }
    }
    return null;
  }

  /**
   * Validate inputs and scale recipe
   * Mandatory Feature 3: new amount = (original amount * servings wanted) / servings the recipe
   * Mandatory Feature 4: Show a message, and no result, if either serving number is empty, zero or negative
   * @param {boolean} isInitialRestore - true if called from localStorage reload
   * @returns {boolean} whether scaling succeeded
   */
  function processRecipeScaling(isInitialRestore = false) {
    hideMessage();

    const dishName = dishNameInput.value.trim();
    const recipeServingsRaw = recipeServingsInput.value.trim();
    const servingsWantedRaw = servingsWantedInput.value.trim();

    // 1. Mandatory Rule 4: If either serving number is empty, zero, or negative -> show message and NO result.
    if (!recipeServingsRaw || !servingsWantedRaw) {
      showMessage('Please provide both serving numbers. Recipe servings and wanted servings cannot be empty.', 'error');
      hideResults();
      if (!isInitialRestore) saveStateToStorage(false);
      return false;
    }

    const recipeServings = parseFloat(recipeServingsRaw);
    const servingsWanted = parseFloat(servingsWantedRaw);

    if (isNaN(recipeServings) || isNaN(servingsWanted)) {
      showMessage('Serving numbers must be valid numerical values.', 'error');
      hideResults();
      if (!isInitialRestore) saveStateToStorage(false);
      return false;
    }

    if (recipeServings <= 0 && servingsWanted <= 0) {
      showMessage('Both recipe servings and wanted servings must be positive numbers greater than zero.', 'error');
      hideResults();
      if (!isInitialRestore) saveStateToStorage(false);
      return false;
    }

    if (recipeServings <= 0) {
      showMessage("The original recipe servings must be greater than zero (cannot be empty, 0, or negative).", 'error');
      hideResults();
      if (!isInitialRestore) saveStateToStorage(false);
      return false;
    }

    if (servingsWanted <= 0) {
      showMessage("The wanted servings must be greater than zero (cannot be empty, 0, or negative).", 'error');
      hideResults();
      if (!isInitialRestore) saveStateToStorage(false);
      return false;
    }

    // 2. Validate dish name (helpful context)
    const displayDish = dishName || 'Untitled Recipe';

    // 3. Validate ingredients
    const ingredientsData = [];
    for (let i = 0; i < 3; i++) {
      const nameVal = ingInputs[i].name.value.trim() || `Ingredient ${i + 1}`;
      const amountRaw = ingInputs[i].amount.value.trim();
      const unitVal = ingInputs[i].unit.value.trim();

      if (!amountRaw) {
        showMessage(`Please specify an amount for "${nameVal}". Ingredient amounts cannot be empty.`, 'error');
        hideResults();
        if (!isInitialRestore) saveStateToStorage(false);
        return false;
      }

      const amountVal = parseFloat(amountRaw);
      if (isNaN(amountVal) || amountVal < 0) {
        showMessage(`Ingredient amount for "${nameVal}" must be a valid number (0 or greater).`, 'error');
        hideResults();
        if (!isInitialRestore) saveStateToStorage(false);
        return false;
      }

      ingredientsData.push({
        name: nameVal,
        originalAmount: amountVal,
        unit: unitVal
      });
    }

    // 4. Calculate new amounts:
    // "Show each new amount , worked out as the original amount times servings wanted, divided by servings the recipe"
    const scaleFactor = servingsWanted / recipeServings;

    const scaledResults = ingredientsData.map(ing => {
      const calculatedAmount = (ing.originalAmount * servingsWanted) / recipeServings;
      return {
        ...ing,
        newAmount: calculatedAmount,
        fraction: getKitchenFraction(calculatedAmount)
      };
    });

    // 5. Render Results to DOM
    renderResults(displayDish, recipeServings, servingsWanted, scaleFactor, scaledResults);

    // 6. Mandatory Rule 5: Persist state so result remains visible after reload
    saveStateToStorage(true);

    return true;
  }

  /**
   * Render the scaled recipe in the results panel
   */
  function renderResults(dishName, origServings, targetServings, scaleFactor, ingredients) {
    resultsDishTitle.textContent = dishName;
    displayOrigServings.textContent = formatNumber(origServings);
    displayTargetServings.textContent = formatNumber(targetServings);
    displayScaleFactor.textContent = `${formatNumber(scaleFactor)}×`;

    // Clear previous items
    scaledItemsList.innerHTML = '';

    ingredients.forEach((ing) => {
      const card = document.createElement('div');
      card.className = 'scaled-card';

      const unitText = ing.unit ? ` ${ing.unit}` : '';
      const fractionBadge = ing.fraction ? `<div class="scaled-fraction">≈ ${ing.fraction}${unitText}</div>` : '';
      const formulaBreakdown = `(${formatNumber(ing.originalAmount)} × ${formatNumber(targetServings)}) ÷ ${formatNumber(origServings)}`;

      card.innerHTML = `
        <div class="scaled-meta">
          <div class="scaled-name">${escapeHtml(ing.name)}</div>
          <div class="scaled-calc-detail">
            Base: ${formatNumber(ing.originalAmount)}${unitText} &bull; ${formulaBreakdown}
          </div>
        </div>
        <div class="scaled-result-display">
          <div class="scaled-amount-badge">
            ${formatNumber(ing.newAmount)}
            ${ing.unit ? `<span class="unit">${escapeHtml(ing.unit)}</span>` : ''}
          </div>
          ${fractionBadge}
        </div>
      `;

      scaledItemsList.appendChild(card);
    });

    // Toggle visibility
    resultsPlaceholder.classList.add('hidden');
    resultsContent.classList.remove('hidden');
  }

  /**
   * Escape HTML to prevent XSS injection
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Mandatory Feature 5: Save state to localStorage so it persists after page reload
   * @param {boolean} hasValidCalculation 
   */
  function saveStateToStorage(hasValidCalculation) {
    try {
      const state = {
        dishName: dishNameInput.value,
        recipeServings: recipeServingsInput.value,
        servingsWanted: servingsWantedInput.value,
        ingredients: ingInputs.map(item => ({
          name: item.name.value,
          amount: item.amount.value,
          unit: item.unit.value,
        })),
        hasCalculated: Boolean(hasValidCalculation)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Unable to persist to localStorage:', e);
    }
  }

  /**
   * Mandatory Feature 5: Restore state from localStorage upon reload
   */
  function restoreStateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const state = JSON.parse(raw);
      if (!state) return;

      if (state.dishName !== undefined) dishNameInput.value = state.dishName;
      if (state.recipeServings !== undefined) recipeServingsInput.value = state.recipeServings;
      if (state.servingsWanted !== undefined) servingsWantedInput.value = state.servingsWanted;

      if (Array.isArray(state.ingredients)) {
        state.ingredients.forEach((ing, i) => {
          if (ingInputs[i]) {
            if (ing.name !== undefined) ingInputs[i].name.value = ing.name;
            if (ing.amount !== undefined) ingInputs[i].amount.value = ing.amount;
            if (ing.unit !== undefined) ingInputs[i].unit.value = ing.unit;
          }
        });
      }

      // If the user previously had a valid calculation active, re-calculate and show results immediately!
      if (state.hasCalculated === true) {
        processRecipeScaling(true);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }

  // --- Event Listeners ---

  // Form submission
  scalerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processRecipeScaling(false);
  });

  // Close message banner button
  messageCloseBtn.addEventListener('click', hideMessage);

  // Quick preset scale buttons for servings wanted
  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const scaleMultiplier = btn.getAttribute('data-scale');
      const stepValue = btn.getAttribute('data-step');

      let currentWanted = parseFloat(servingsWantedInput.value);
      const originalServings = parseFloat(recipeServingsInput.value);

      if (scaleMultiplier) {
        const mult = parseFloat(scaleMultiplier);
        if (!isNaN(originalServings) && originalServings > 0) {
          // Base it on original servings
          const computed = originalServings * mult;
          servingsWantedInput.value = formatNumber(computed);
        } else if (!isNaN(currentWanted) && currentWanted > 0) {
          servingsWantedInput.value = formatNumber(currentWanted * mult);
        } else {
          servingsWantedInput.value = formatNumber(4 * mult);
        }
      } else if (stepValue) {
        const delta = parseFloat(stepValue);
        const base = !isNaN(currentWanted) && currentWanted > 0 ? currentWanted : (originalServings || 4);
        const nextVal = Math.max(1, base + delta);
        servingsWantedInput.value = formatNumber(nextVal);
      }

      // Trigger recalculation if already showing results
      if (!resultsContent.classList.contains('hidden')) {
        processRecipeScaling(false);
      } else {
        saveStateToStorage(false);
      }
    });
  });

  // Load sample recipe button
  loadSampleBtn.addEventListener('click', () => {
    dishNameInput.value = 'Classic Fluffy Pancakes';
    recipeServingsInput.value = '4';
    servingsWantedInput.value = '10';

    ingInputs[0].name.value = 'All-Purpose Flour';
    ingInputs[0].amount.value = '200';
    ingInputs[0].unit.value = 'grams';

    ingInputs[1].name.value = 'Whole Milk';
    ingInputs[1].amount.value = '300';
    ingInputs[1].unit.value = 'ml';

    ingInputs[2].name.value = 'Granulated Sugar';
    ingInputs[2].amount.value = '30';
    ingInputs[2].unit.value = 'grams';

    hideMessage();
    processRecipeScaling(false);
  });

  // Reset all button
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all fields and clear saved recipe data?')) {
      dishNameInput.value = '';
      recipeServingsInput.value = '';
      servingsWantedInput.value = '';

      ingInputs.forEach(item => {
        item.name.value = '';
        item.amount.value = '';
        item.unit.value = '';
      });

      hideMessage();
      hideResults();

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }
    }
  });

  // Copy scaled recipe to clipboard
  copyBtn.addEventListener('click', async () => {
    const dish = resultsDishTitle.textContent;
    const orig = displayOrigServings.textContent;
    const target = displayTargetServings.textContent;
    const factor = displayScaleFactor.textContent;

    const cards = scaledItemsList.querySelectorAll('.scaled-card');
    let ingredientText = '';
    cards.forEach(card => {
      const name = card.querySelector('.scaled-name')?.textContent || '';
      const amount = card.querySelector('.scaled-amount-badge')?.textContent.replace(/\s+/g, ' ').trim() || '';
      ingredientText += `• ${name}: ${amount}\n`;
    });

    const fullText = `Recipe: ${dish}\nScaled: ${orig} servings ➔ ${target} servings (${factor})\n\nIngredients:\n${ingredientText}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        // Fallback for older environments
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      const originalText = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied!';
      setTimeout(() => {
        copyBtnText.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Unable to copy automatically. Please copy from the screen.');
    }
  });

  // Print recipe button
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Auto-save form inputs on change
  const allFormInputs = [
    dishNameInput,
    recipeServingsInput,
    servingsWantedInput,
    ...ingInputs.flatMap(i => [i.name, i.amount, i.unit])
  ];

  allFormInputs.forEach(input => {
    input.addEventListener('input', () => {
      // If results are currently visible, recalculate on serving or amount changes if valid
      const hasResult = !resultsContent.classList.contains('hidden');
      if (hasResult) {
        // Check if serving inputs are still valid; if not, rule 4 applies
        const rVal = parseFloat(recipeServingsInput.value.trim());
        const wVal = parseFloat(servingsWantedInput.value.trim());
        if (isNaN(rVal) || isNaN(wVal) || rVal <= 0 || wVal <= 0) {
          hideResults();
          showMessage("Serving numbers cannot be empty, zero, or negative.", "error");
          saveStateToStorage(false);
          return;
        }
        processRecipeScaling(false);
      } else {
        saveStateToStorage(false);
      }
    });
  });

  // Restore state on load (Mandatory Feature 5)
  restoreStateFromStorage();
});