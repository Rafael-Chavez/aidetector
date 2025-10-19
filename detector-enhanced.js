// Enhanced Spanish AI Text Detector with Hugging Face API Integration
class EnhancedSpanishAIDetector {
    constructor() {
        this.apiKey = CONFIG.HUGGINGFACE_API_KEY;
        this.modelUrl = CONFIG.API_URL + CONFIG.PERPLEXITY_MODEL;
        this.isApiEnabled = this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';

        this.aiPatterns = {
            connectors: [
                'sin embargo', 'no obstante', 'por lo tanto', 'en consecuencia',
                'asimismo', 'además', 'por otro lado', 'en primer lugar',
                'en segundo lugar', 'finalmente', 'por consiguiente', 'es decir',
                'en otras palabras', 'cabe destacar', 'es importante señalar',
                'vale la pena mencionar', 'en este sentido', 'de esta manera'
            ],
            formulaicPhrases: [
                'es importante destacar que', 'cabe señalar que', 'es fundamental',
                'resulta evidente que', 'es necesario mencionar', 'conviene recordar',
                'no cabe duda de que', 'es preciso señalar', 'vale la pena destacar',
                'en la actualidad', 'hoy en día', 'en el contexto de',
                'con el fin de', 'a fin de', 'con el propósito de',
                'de acuerdo con', 'en relación con', 'respecto a',
                'en un contexto moderno', 'estas habilidades', 'igualmente esenciales',
                'un líder que', 'la capacidad de', 'demostró una', 'permitió que',
                'fomenta un ambiente', 'genera cooperación', 'asegura que',
                'son claves para', 'mantener cohesión', 'objetivo compartido',
                'va de la mano con', 'demostrando que'
            ],
            perfectStructures: [
                'mediante', 'a través de', 'en virtud de', 'en función de',
                'en base a', 'con respecto a', 'en cuanto a', 'por ende',
                'a su vez', 'dicho', 'mencionado', 'citado anteriormente'
            ]
        };
    }

    async analyze(text, onProgress) {
        if (!text || text.trim().length < 50) {
            return null;
        }

        // Calculate local metrics first
        if (onProgress) onProgress('Analizando patrones lingüísticos...', 20);

        const metrics = {
            uniformity: this.calculateUniformity(text),
            complexity: this.calculateLexicalComplexity(text),
            sentenceVariation: this.calculateSentenceVariation(text),
            patterns: this.detectRepetitivePatterns(text),
            naturalness: this.calculateNaturalness(text),
            connectors: this.analyzeConnectors(text),
            burstiness: this.calculateBurstiness(text),
            manipulation: this.detectManipulation(text)
        };

        // If API is enabled, get perplexity scores
        let perplexityScore = null;
        let apiMetrics = null;

        if (this.isApiEnabled) {
            try {
                if (onProgress) onProgress('Calculando perplejidad con IA...', 50);
                apiMetrics = await this.calculateAPIPerplexity(text);
                perplexityScore = apiMetrics.perplexity;
                metrics.perplexity = this.normalizePerplexity(perplexityScore);
            } catch (error) {
                console.error('Error calculating perplexity:', error);
                if (onProgress) onProgress('Continuando con análisis local...', 70);
            }
        }

        if (onProgress) onProgress('Calculando probabilidad final...', 80);

        const probability = this.calculateAIProbability(metrics, this.isApiEnabled);
        const sentenceScores = await this.analyzeSentences(text);

        if (onProgress) onProgress('Análisis completado', 100);

        return {
            probability,
            metrics,
            perplexityScore,
            apiMetrics,
            sentenceScores,
            verdict: this.getVerdict(probability),
            usingAPI: this.isApiEnabled
        };
    }

    async calculateAPIPerplexity(text) {
        const sentences = this.getSentences(text);
        const perplexities = [];

        // Analyze each sentence for perplexity
        for (let i = 0; i < Math.min(sentences.length, 10); i++) {
            const sentence = sentences[i];
            if (sentence.length < 10) continue;

            try {
                const response = await fetch(this.modelUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: sentence,
                        options: { wait_for_model: true }
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    // Calculate pseudo-perplexity from model output
                    const ppl = this.extractPerplexity(result, sentence);
                    if (ppl) perplexities.push(ppl);
                }

                // Rate limiting: wait between requests
                await this.sleep(200);
            } catch (error) {
                console.warn('Error analyzing sentence:', error);
            }
        }

        if (perplexities.length === 0) {
            throw new Error('No perplexity scores calculated');
        }

        // Calculate average and variance
        const avgPerplexity = perplexities.reduce((a, b) => a + b, 0) / perplexities.length;
        const variance = perplexities.reduce((sum, ppl) =>
            sum + Math.pow(ppl - avgPerplexity, 2), 0) / perplexities.length;

        return {
            perplexity: avgPerplexity,
            variance: variance,
            samples: perplexities.length
        };
    }

    extractPerplexity(modelResult, sentence) {
        // The GPT-2 model returns token probabilities
        // We need to calculate perplexity from these

        if (!modelResult || !Array.isArray(modelResult)) {
            // If we get generated text, use length-based heuristic
            return this.estimatePerplexity(sentence);
        }

        // Try to extract from model output
        try {
            if (modelResult[0] && modelResult[0].score) {
                // Convert score to perplexity-like metric
                return Math.exp(-modelResult[0].score);
            }
        } catch (error) {
            console.warn('Could not extract perplexity:', error);
        }

        return this.estimatePerplexity(sentence);
    }

    estimatePerplexity(sentence) {
        // Fallback: estimate perplexity based on linguistic features
        const words = sentence.split(/\s+/);
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const diversity = uniqueWords.size / words.length;

        // More diverse = higher perplexity (more human-like)
        // Less diverse = lower perplexity (more AI-like)
        return 20 + (diversity * 50);
    }

    normalizePerplexity(perplexity) {
        // Convert perplexity to 0-100 score
        // Lower perplexity = higher AI probability
        const { PERPLEXITY_LOW, PERPLEXITY_HIGH } = CONFIG.THRESHOLDS;

        if (perplexity <= PERPLEXITY_LOW) return 100; // Very likely AI
        if (perplexity >= PERPLEXITY_HIGH) return 0;  // Very likely human

        // Linear interpolation
        const score = ((PERPLEXITY_HIGH - perplexity) / (PERPLEXITY_HIGH - PERPLEXITY_LOW)) * 100;
        return Math.max(0, Math.min(100, score));
    }

    calculateBurstiness(text) {
        const sentences = this.getSentences(text);
        if (sentences.length < 3) return 50;

        const lengths = sentences.map(s => s.split(/\s+/).length);

        // Calculate variance in sentence lengths
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) =>
            sum + Math.pow(len - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Calculate coefficient of variation (CV)
        const cv = stdDev / avg;

        // Higher CV = more burstiness = more human-like
        // Normalize to 0-100 scale (inverted for AI probability)
        const burstiness = Math.min(100, cv * 150);

        // Return inverted score (low burstiness = high AI probability)
        return Math.max(0, 100 - burstiness);
    }

    calculateUniformity(text) {
        const sentences = this.getSentences(text);
        if (sentences.length < 2) return 0;

        const lengths = sentences.map(s => s.split(/\s+/).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // AI text typically has sentence lengths between 15-30 words with low variance
        let uniformityScore = Math.max(0, 100 - (stdDev * 4));

        // Bonus points if average length is in AI sweet spot (20-28 words)
        if (avg >= 20 && avg <= 28) {
            uniformityScore = Math.min(100, uniformityScore + 15);
        }

        // More points for very low standard deviation
        if (stdDev < 5) {
            uniformityScore = Math.min(100, uniformityScore + 20);
        }

        return Math.min(100, uniformityScore);
    }

    calculateLexicalComplexity(text) {
        const words = text.toLowerCase().match(/\b[a-záéíóúñü]+\b/g) || [];
        const uniqueWords = new Set(words);
        const lexicalDiversity = (uniqueWords.size / words.length) * 100;

        if (lexicalDiversity > 70 || lexicalDiversity < 30) {
            return Math.max(0, 100 - Math.abs(50 - lexicalDiversity));
        }
        return 60 + (lexicalDiversity - 50);
    }

    calculateSentenceVariation(text) {
        const sentences = this.getSentences(text);
        if (sentences.length < 3) return 50;

        const structures = sentences.map(s => {
            const words = s.trim().split(/\s+/);
            return {
                startsWithCapital: /^[A-ZÁÉÍÓÚÑ]/.test(s),
                hasComma: s.includes(','),
                hasColon: s.includes(':'),
                hasSemicolon: s.includes(';'),
                wordCount: words.length
            };
        });

        let similarityScore = 0;
        for (let i = 0; i < structures.length - 1; i++) {
            const s1 = structures[i];
            const s2 = structures[i + 1];
            const diff = Math.abs(s1.wordCount - s2.wordCount);
            if (diff < 3) similarityScore += 20;
        }

        return Math.min(100, similarityScore);
    }

    detectRepetitivePatterns(text) {
        const lowerText = text.toLowerCase();
        let patternScore = 0;

        // Detect phrase stuffing attacks (same phrase repeated many times)
        const sentences = this.getSentences(text);
        const phraseStuffingPatterns = [
            'conviene destacar que', 'es importante señalar', 'cabe mencionar que',
            'vale la pena', 'es fundamental', 'resulta evidente'
        ];

        phraseStuffingPatterns.forEach(phrase => {
            const count = (lowerText.match(new RegExp(phrase, 'g')) || []).length;
            if (count > sentences.length * 0.5) {
                // If phrase appears in more than 50% of sentences, it's stuffing
                patternScore += 50; // Heavy penalty
            } else if (count >= 3) {
                // Same phrase 3+ times is suspicious
                patternScore += count * 25;
            }
        });

        this.aiPatterns.formulaicPhrases.forEach(phrase => {
            const count = (lowerText.match(new RegExp(phrase, 'g')) || []).length;
            if (count === 1) {
                patternScore += 20;  // Single occurrence
            } else if (count >= 2) {
                patternScore += count * 30;  // Multiple occurrences are very suspicious
            }
        });

        this.aiPatterns.perfectStructures.forEach(structure => {
            const count = (lowerText.match(new RegExp('\\b' + structure + '\\b', 'g')) || []).length;
            patternScore += count * 15;
        });

        return Math.min(100, patternScore);
    }

    calculateNaturalness(text) {
        const lowerText = text.toLowerCase();
        let unnaturalScore = 0;

        const colloquialisms = ['pues', 'bueno', 'o sea', 'entonces', 'claro', 'vale', 'okay'];
        const hasColloquialisms = colloquialisms.some(word =>
            lowerText.includes(' ' + word + ' ') || lowerText.startsWith(word + ' ')
        );

        if (!hasColloquialisms) unnaturalScore += 35;  // Increased from 30

        const perfectMarkers = ['así pues', 'por consiguiente', 'en consecuencia', 'igualmente'];
        perfectMarkers.forEach(marker => {
            if (lowerText.includes(marker)) unnaturalScore += 12;  // Increased from 10
        });

        const exclamations = (text.match(/!/g) || []).length;
        const questions = (text.match(/\?/g) || []).length;
        const sentences = this.getSentences(text).length;

        if (sentences > 0) {
            const emotionalRatio = (exclamations + questions) / sentences;
            if (emotionalRatio < 0.1) unnaturalScore += 25;  // Increased from 20
        }

        // Check for overly formal paragraph structure
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
        if (paragraphs.length >= 3) {
            // AI often creates 3 well-structured paragraphs
            const lengths = paragraphs.map(p => p.split(/\s+/).length);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            if (avgLength > 40 && avgLength < 80) {
                unnaturalScore += 15;
            }
        }

        return Math.min(100, unnaturalScore);
    }

    analyzeConnectors(text) {
        const lowerText = text.toLowerCase();
        const sentences = this.getSentences(text);
        let connectorScore = 0;

        let connectorCount = 0;
        this.aiPatterns.connectors.forEach(connector => {
            const matches = (lowerText.match(new RegExp('\\b' + connector + '\\b', 'g')) || []).length;
            connectorCount += matches;
        });

        const connectorDensity = connectorCount / sentences.length;

        if (connectorDensity > 0.3 && connectorDensity < 0.7) {
            connectorScore = 70;
        } else if (connectorDensity >= 0.7) {
            connectorScore = 85;
        } else {
            connectorScore = 30;
        }

        return connectorScore;
    }

    detectManipulation(text) {
        let manipulationScore = 0;

        // Check for unnatural capitalization (missing capitals, all lowercase)
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        let lowercaseStarts = 0;

        sentences.forEach(sentence => {
            if (sentence.length > 0 && sentence[0] === sentence[0].toLowerCase()) {
                lowercaseStarts++;
            }
        });

        const lowercaseRatio = lowercaseStarts / sentences.length;
        if (lowercaseRatio > 0.5) {
            // More than 50% of sentences start lowercase = manipulation
            manipulationScore += 60;
        }

        // Check for run-on sentences (very long sentences without proper punctuation)
        const avgSentenceLength = text.length / sentences.length;
        if (avgSentenceLength > 200) {
            manipulationScore += 40;
        }

        // Check for suspicious paragraph structure (single paragraph wall of text)
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        const words = text.split(/\s+/).length;
        if (paragraphs.length === 1 && words > 100) {
            // Single paragraph with 100+ words often indicates manipulation
            manipulationScore += 30;
        }

        return Math.min(100, manipulationScore);
    }

    calculateAIProbability(metrics, usingAPI) {
        let weights;

        if (usingAPI && metrics.perplexity !== undefined) {
            // Enhanced weights when using API
            weights = {
                perplexity: 0.30,      // Perplexity is the most reliable indicator
                burstiness: 0.18,      // Burstiness is also very important
                patterns: 0.18,        // Increased from 0.12
                manipulation: 0.12,    // NEW: Detect anti-detection tricks
                uniformity: 0.08,
                naturalness: 0.08,     // Increased from 0.05
                complexity: 0.03,
                sentenceVariation: 0.03
            };
        } else {
            // Local-only weights - rebalanced for better accuracy
            weights = {
                patterns: 0.28,        // Slightly decreased to make room for manipulation
                naturalness: 0.18,
                manipulation: 0.15,    // NEW: High weight for detecting tricks
                uniformity: 0.15,
                sentenceVariation: 0.12,
                connectors: 0.10,
                complexity: 0.02
            };
        }

        let probability = 0;
        Object.keys(weights).forEach(key => {
            if (metrics[key] !== undefined) {
                probability += metrics[key] * weights[key];
            }
        });

        // If manipulation is detected, add a bonus
        if (metrics.manipulation && metrics.manipulation > 50) {
            probability = Math.min(100, probability + 10);
        }

        return Math.round(probability);
    }

    async analyzeSentences(text) {
        const sentences = this.getSentences(text);
        return sentences.map(sentence => {
            const lowerSentence = sentence.toLowerCase();
            let score = 30;

            this.aiPatterns.formulaicPhrases.forEach(phrase => {
                if (lowerSentence.includes(phrase)) score += 20;
            });

            this.aiPatterns.connectors.forEach(connector => {
                if (lowerSentence.includes(connector)) score += 10;
            });

            this.aiPatterns.perfectStructures.forEach(structure => {
                if (new RegExp('\\b' + structure + '\\b').test(lowerSentence)) score += 15;
            });

            const wordCount = sentence.split(/\s+/).length;
            if (wordCount >= 15 && wordCount <= 25) score += 10;

            return Math.min(100, score);
        });
    }

    getSentences(text) {
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    getVerdict(probability) {
        if (probability >= 75) {
            return {
                text: 'Alta probabilidad de ser generado por IA',
                level: 'high',
                description: 'El texto presenta múltiples características típicas de contenido generado por inteligencia artificial.'
            };
        } else if (probability >= 50) {
            return {
                text: 'Probabilidad moderada de ser generado por IA',
                level: 'medium',
                description: 'El texto muestra algunos patrones que podrían indicar generación por IA, pero no es concluyente.'
            };
        } else if (probability >= 25) {
            return {
                text: 'Baja probabilidad de ser generado por IA',
                level: 'low',
                description: 'El texto presenta características más propias de escritura humana que de IA.'
            };
        } else {
            return {
                text: 'Muy baja probabilidad de ser generado por IA',
                level: 'very-low',
                description: 'El texto muestra claros rasgos de escritura humana natural.'
            };
        }
    }

    getMetricDescription(value, type) {
        const ranges = {
            uniformity: [
                { max: 30, text: 'Baja', class: 'low' },
                { max: 60, text: 'Media', class: 'medium' },
                { max: 100, text: 'Alta', class: 'high' }
            ],
            complexity: [
                { max: 40, text: 'Baja', class: 'low' },
                { max: 70, text: 'Media', class: 'medium' },
                { max: 100, text: 'Alta', class: 'high' }
            ],
            sentenceVariation: [
                { max: 30, text: 'Alta variación', class: 'low' },
                { max: 60, text: 'Variación media', class: 'medium' },
                { max: 100, text: 'Baja variación', class: 'high' }
            ],
            patterns: [
                { max: 30, text: 'Pocos patrones', class: 'low' },
                { max: 60, text: 'Algunos patrones', class: 'medium' },
                { max: 100, text: 'Muchos patrones', class: 'high' }
            ],
            naturalness: [
                { max: 30, text: 'Natural', class: 'low' },
                { max: 60, text: 'Moderadamente formal', class: 'medium' },
                { max: 100, text: 'Muy formal/artificial', class: 'high' }
            ],
            connectors: [
                { max: 40, text: 'Uso bajo', class: 'low' },
                { max: 70, text: 'Uso moderado', class: 'medium' },
                { max: 100, text: 'Uso alto', class: 'high' }
            ],
            burstiness: [
                { max: 30, text: 'Alta variabilidad', class: 'low' },
                { max: 60, text: 'Variabilidad media', class: 'medium' },
                { max: 100, text: 'Baja variabilidad', class: 'high' }
            ],
            perplexity: [
                { max: 30, text: 'Baja (IA)', class: 'high' },
                { max: 60, text: 'Media', class: 'medium' },
                { max: 100, text: 'Alta (Humano)', class: 'low' }
            ],
            manipulation: [
                { max: 30, text: 'No detectada', class: 'low' },
                { max: 60, text: 'Posible manipulación', class: 'medium' },
                { max: 100, text: 'Manipulación detectada', class: 'high' }
            ]
        };

        const range = ranges[type]?.find(r => value <= r.max);
        return range || { text: '-', class: 'low' };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    const detector = new EnhancedSpanishAIDetector();
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const wordCount = document.getElementById('wordCount');
    const resultsSection = document.getElementById('resultsSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressSection = document.getElementById('progressSection');

    // Check API status
    if (!detector.isApiEnabled) {
        showApiWarning();
    }

    // Word count update
    textInput.addEventListener('input', () => {
        const words = textInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        wordCount.textContent = `${words.length} palabra${words.length !== 1 ? 's' : ''}`;
    });

    // Analyze button
    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (text.length < 50) {
            alert('Por favor, ingresa al menos 50 caracteres para analizar.');
            return;
        }

        // Show progress
        progressSection.style.display = 'block';
        resultsSection.style.display = 'none';
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analizando...';

        try {
            const results = await detector.analyze(text, (message, progress) => {
                progressText.textContent = message;
                progressBar.style.width = `${progress}%`;
            });

            displayResults(results, text);
        } catch (error) {
            alert('Error al analizar el texto: ' + error.message);
            console.error(error);
        } finally {
            progressSection.style.display = 'none';
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analizar Texto';
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        wordCount.textContent = '0 palabras';
        resultsSection.style.display = 'none';
        progressSection.style.display = 'none';
    });

    function showApiWarning() {
        const warning = document.createElement('div');
        warning.className = 'api-warning';
        warning.innerHTML = `
            <strong>⚠️ Modo Local</strong> - Para mayor precisión, configura tu API key de Hugging Face en
            <a href="config.js" target="_blank">config.js</a>.
            <a href="https://huggingface.co/settings/tokens" target="_blank">Obtener API key gratis</a>
        `;
        document.querySelector('.input-section').prepend(warning);
    }

    function displayResults(results, originalText) {
        resultsSection.style.display = 'block';

        const probabilityScore = document.getElementById('probabilityScore');
        const probabilityFill = document.getElementById('probabilityFill');
        const verdict = document.getElementById('verdict');

        probabilityScore.textContent = `${results.probability}%`;
        probabilityFill.style.width = `${results.probability}%`;

        probabilityFill.className = 'probability-fill';
        if (results.probability >= 75) {
            probabilityFill.classList.add('high');
        } else if (results.probability >= 50) {
            probabilityFill.classList.add('medium');
        } else {
            probabilityFill.classList.add('low');
        }

        let verdictHTML = `
            <strong>${results.verdict.text}</strong>
            <p>${results.verdict.description}</p>
        `;

        if (results.usingAPI && results.perplexityScore) {
            verdictHTML += `<p class="api-badge">✓ Análisis mejorado con IA (Perplejidad: ${results.perplexityScore.toFixed(2)})</p>`;
        }

        verdict.innerHTML = verdictHTML;
        verdict.className = `verdict ${results.verdict.level}`;

        // Update metrics
        updateMetric('uniformity', results.metrics.uniformity, detector);
        updateMetric('complexity', results.metrics.complexity, detector);
        updateMetric('sentenceVariation', results.metrics.sentenceVariation, detector);
        updateMetric('patterns', results.metrics.patterns, detector);
        updateMetric('naturalness', results.metrics.naturalness, detector);
        updateMetric('connectors', results.metrics.connectors, detector);
        updateMetric('manipulation', results.metrics.manipulation, detector);

        // Show additional metrics if using API
        if (results.metrics.burstiness !== undefined) {
            const burstinessItem = document.getElementById('burstinessItem');
            if (burstinessItem) burstinessItem.style.display = 'flex';
            updateMetric('burstiness', results.metrics.burstiness, detector);
        }
        if (results.metrics.perplexity !== undefined) {
            const perplexityItem = document.getElementById('perplexityItem');
            if (perplexityItem) perplexityItem.style.display = 'flex';
            updateMetric('perplexity', results.metrics.perplexity, detector);
        }

        highlightText(originalText, results.sentenceScores);

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateMetric(metricId, value, detector) {
        const element = document.getElementById(metricId);
        if (!element) return;

        const description = detector.getMetricDescription(value, metricId);
        element.innerHTML = `<span class="metric-badge ${description.class}">${description.text}</span>`;
    }

    function highlightText(text, sentenceScores) {
        const highlightedTextDiv = document.getElementById('highlightedText');
        const sentences = text.split(/([.!?]+)/);
        let html = '';
        let scoreIndex = 0;

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            if (sentence.match(/[.!?]+/)) {
                html += sentence;
            } else if (sentence.trim().length > 0) {
                const score = sentenceScores[scoreIndex] || 0;
                let className = '';

                if (score >= 70) {
                    className = 'highlight-high';
                } else if (score >= 50) {
                    className = 'highlight-medium';
                } else {
                    className = 'highlight-low';
                }

                html += `<span class="${className}" title="Puntuación IA: ${score}%">${sentence}</span>`;
                scoreIndex++;
            }
        }

        highlightedTextDiv.innerHTML = html;
    }
});
