// UI Controller for Ethical Paraphraser
document.addEventListener('DOMContentLoaded', () => {
    const paraphraser = new EthicalParaphraser();

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const detectorTab = document.getElementById('detectorTab');
    const paraphraserTab = document.getElementById('paraphraserTab');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show/hide tab content
            if (tabName === 'detector') {
                detectorTab.classList.add('active');
                paraphraserTab.classList.remove('active');
            } else {
                detectorTab.classList.remove('active');
                paraphraserTab.classList.add('active');
            }
        });
    });

    // Paraphraser elements
    const paraTextInput = document.getElementById('paraTextInput');
    const paraphraseBtn = document.getElementById('paraphraseBtn');
    const paraClearBtn = document.getElementById('paraClearBtn');
    const paraWordCount = document.getElementById('paraWordCount');
    const paraphraseLevel = document.getElementById('paraphraseLevel');
    const paraProgressSection = document.getElementById('paraProgressSection');
    const paraProgressText = document.getElementById('paraProgressText');
    const paraProgressBar = document.getElementById('paraProgressBar');
    const paraResultsSection = document.getElementById('paraResultsSection');

    // Word count for paraphraser
    paraTextInput.addEventListener('input', () => {
        const words = paraTextInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        paraWordCount.textContent = `${words.length} palabra${words.length !== 1 ? 's' : ''}`;
    });

    // Paraphrase button
    paraphraseBtn.addEventListener('click', async () => {
        const text = paraTextInput.value.trim();

        if (text.length < 10) {
            alert('Por favor, ingresa al menos 10 caracteres para parafrasear.');
            return;
        }

        // Show progress
        paraProgressSection.style.display = 'block';
        paraResultsSection.style.display = 'none';
        paraphraseBtn.disabled = true;
        paraphraseBtn.textContent = 'Parafraseando...';

        try {
            const level = paraphraseLevel.value;
            const results = await paraphraser.paraphrase(text, level, (message, progress) => {
                paraProgressText.textContent = message;
                paraProgressBar.style.width = `${progress}%`;
            });

            displayParaphraseResults(results);
        } catch (error) {
            alert('Error al parafrasear el texto: ' + error.message);
            console.error(error);
        } finally {
            paraProgressSection.style.display = 'none';
            paraphraseBtn.disabled = false;
            paraphraseBtn.textContent = 'Parafrasear Texto';
        }
    });

    // Clear button for paraphraser
    paraClearBtn.addEventListener('click', () => {
        paraTextInput.value = '';
        paraWordCount.textContent = '0 palabras';
        paraResultsSection.style.display = 'none';
        paraProgressSection.style.display = 'none';
    });

    function displayParaphraseResults(results) {
        paraResultsSection.style.display = 'block';

        // Display warnings if any
        const warningsContainer = document.getElementById('warningsContainer');
        if (results.warnings && results.warnings.length > 0) {
            warningsContainer.style.display = 'block';
            warningsContainer.innerHTML = results.warnings.map(warning => `
                <div class="warning-box ${warning.severity}">
                    <strong>⚠️ ${warning.type === 'quotation' ? 'Cita detectada' :
                                   warning.type === 'citation' ? 'Referencia detectada' :
                                   'Advertencia de derechos de autor'}</strong>
                    <p>${warning.message}</p>
                </div>
            `).join('');
        } else {
            warningsContainer.style.display = 'none';
        }

        // Display original text
        document.getElementById('originalTextDisplay').textContent = results.original;

        // Display alternatives
        const alternativesContainer = document.getElementById('alternativesContainer');
        alternativesContainer.innerHTML = results.alternatives.map((alt, index) => `
            <div class="alternative-card">
                <div class="alternative-header">
                    <h4>Alternativa ${index + 1}</h4>
                    <button class="copy-btn" onclick="copyToClipboard('alt${index}', this)">
                        📋 Copiar
                    </button>
                </div>
                <div class="alternative-text" id="alt${index}">${alt.text}</div>
                <div class="alternative-explanation">
                    <strong>Cambios aplicados:</strong> ${alt.explanation}
                </div>
            </div>
        `).join('');

        // Display citation suggestions
        const citationAdvice = document.getElementById('citationAdvice');
        citationAdvice.innerHTML = '<ul>' +
            results.citationSuggestions.advice.map(advice =>
                `<li>${advice}</li>`
            ).join('') +
            '</ul>';

        // Update citation format examples
        document.getElementById('apaFormat').textContent = results.citationSuggestions.apa;
        document.getElementById('mlaFormat').textContent = results.citationSuggestions.mla;
        document.getElementById('chicagoFormat').textContent = results.citationSuggestions.chicago;

        // Display metadata
        document.getElementById('metaLevel').textContent = results.level;
        document.getElementById('metaTone').textContent = results.metadata.tone;
        document.getElementById('metaFidelity').textContent = results.metadata.fidelityCheck;

        // Scroll to results
        paraResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Global function for copying text
    window.copyToClipboard = function(elementId, button) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            const originalText = button.textContent;
            button.textContent = '✓ Copiado';
            button.style.backgroundColor = '#4CAF50';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Error copying text:', err);
            alert('No se pudo copiar el texto. Por favor, cópialo manualmente.');
        } finally {
            document.body.removeChild(textarea);
        }
    };
});
