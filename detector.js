// Spanish AI Text Detector
class SpanishAIDetector {
    constructor() {
        this.aiPatterns = {
            // Common AI connectors and transitions in Spanish
            connectors: [
                'sin embargo', 'no obstante', 'por lo tanto', 'en consecuencia',
                'asimismo', 'además', 'por otro lado', 'en primer lugar',
                'en segundo lugar', 'finalmente', 'por consiguiente', 'es decir',
                'en otras palabras', 'cabe destacar', 'es importante señalar',
                'vale la pena mencionar', 'en este sentido', 'de esta manera'
            ],
            // Formulaic phrases common in AI-generated Spanish text
            formulaicPhrases: [
                'es importante destacar que', 'cabe señalar que', 'es fundamental',
                'resulta evidente que', 'es necesario mencionar', 'conviene recordar',
                'no cabe duda de que', 'es preciso señalar', 'vale la pena destacar',
                'en la actualidad', 'hoy en día', 'en el contexto de',
                'con el fin de', 'a fin de', 'con el propósito de',
                'de acuerdo con', 'en relación con', 'respecto a'
            ],
            // Very formal or overly perfect structures
            perfectStructures: [
                'mediante', 'a través de', 'en virtud de', 'en función de',
                'en base a', 'con respecto a', 'en cuanto a', 'por ende',
                'a su vez', 'dicho', 'mencionado', 'citado anteriormente'
            ]
        };
    }

    analyze(text) {
        if (!text || text.trim().length < 50) {
            return null;
        }

        const metrics = {
            uniformity: this.calculateUniformity(text),
            complexity: this.calculateLexicalComplexity(text),
            sentenceVariation: this.calculateSentenceVariation(text),
            patterns: this.detectRepetitivePatterns(text),
            naturalness: this.calculateNaturalness(text),
            connectors: this.analyzeConnectors(text)
        };

        const probability = this.calculateAIProbability(metrics);
        const sentenceScores = this.analyzeSentences(text);

        return {
            probability,
            metrics,
            sentenceScores,
            verdict: this.getVerdict(probability)
        };
    }

    calculateUniformity(text) {
        const sentences = this.getSentences(text);
        if (sentences.length < 2) return 0;

        const lengths = sentences.map(s => s.split(/\s+/).length);
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Low standard deviation indicates high uniformity (AI trait)
        const uniformityScore = Math.max(0, 100 - (stdDev * 5));
        return Math.min(100, uniformityScore);
    }

    calculateLexicalComplexity(text) {
        const words = text.toLowerCase().match(/\b[a-záéíóúñü]+\b/g) || [];
        const uniqueWords = new Set(words);
        const lexicalDiversity = (uniqueWords.size / words.length) * 100;

        // AI tends to have moderate-high lexical diversity
        // Very high (>70) or very low (<30) suggests human
        if (lexicalDiversity > 70 || lexicalDiversity < 30) {
            return Math.max(0, 100 - Math.abs(50 - lexicalDiversity));
        }
        return 60 + (lexicalDiversity - 50);
    }

    calculateSentenceVariation(text) {
        const sentences = this.getSentences(text);
        if (sentences.length < 3) return 50;

        // Analyze sentence structure patterns
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

        // Calculate pattern similarity
        let similarityScore = 0;
        for (let i = 0; i < structures.length - 1; i++) {
            const s1 = structures[i];
            const s2 = structures[i + 1];
            const diff = Math.abs(s1.wordCount - s2.wordCount);
            if (diff < 3) similarityScore += 20; // Very similar length
        }

        return Math.min(100, similarityScore);
    }

    detectRepetitivePatterns(text) {
        const lowerText = text.toLowerCase();
        let patternScore = 0;

        // Check for formulaic phrases
        this.aiPatterns.formulaicPhrases.forEach(phrase => {
            const count = (lowerText.match(new RegExp(phrase, 'g')) || []).length;
            patternScore += count * 15;
        });

        // Check for perfect structures
        this.aiPatterns.perfectStructures.forEach(structure => {
            const count = (lowerText.match(new RegExp('\\b' + structure + '\\b', 'g')) || []).length;
            patternScore += count * 10;
        });

        return Math.min(100, patternScore);
    }

    calculateNaturalness(text) {
        const lowerText = text.toLowerCase();
        let unnaturalScore = 0;

        // Check for lack of contractions and colloquialisms
        const colloquialisms = ['pues', 'bueno', 'o sea', 'entonces', 'claro', 'vale', 'okay'];
        const hasColloquialisms = colloquialisms.some(word =>
            lowerText.includes(' ' + word + ' ') || lowerText.startsWith(word + ' ')
        );

        if (!hasColloquialisms) unnaturalScore += 30;

        // Check for overly perfect grammar markers
        const perfectMarkers = ['así pues', 'por consiguiente', 'en consecuencia'];
        perfectMarkers.forEach(marker => {
            if (lowerText.includes(marker)) unnaturalScore += 10;
        });

        // AI rarely uses exclamations or questions
        const exclamations = (text.match(/!/g) || []).length;
        const questions = (text.match(/\?/g) || []).length;
        const sentences = this.getSentences(text).length;

        if (sentences > 0) {
            const emotionalRatio = (exclamations + questions) / sentences;
            if (emotionalRatio < 0.1) unnaturalScore += 20;
        }

        return Math.min(100, unnaturalScore);
    }

    analyzeConnectors(text) {
        const lowerText = text.toLowerCase();
        const sentences = this.getSentences(text);
        let connectorScore = 0;

        // Count connector usage
        let connectorCount = 0;
        this.aiPatterns.connectors.forEach(connector => {
            const matches = (lowerText.match(new RegExp('\\b' + connector + '\\b', 'g')) || []).length;
            connectorCount += matches;
        });

        const connectorDensity = connectorCount / sentences.length;

        // AI tends to use connectors frequently (0.3-0.7 per sentence)
        if (connectorDensity > 0.3 && connectorDensity < 0.7) {
            connectorScore = 70;
        } else if (connectorDensity >= 0.7) {
            connectorScore = 85;
        } else {
            connectorScore = 30;
        }

        return connectorScore;
    }

    calculateAIProbability(metrics) {
        // Weighted combination of all metrics
        const weights = {
            uniformity: 0.20,
            complexity: 0.15,
            sentenceVariation: 0.15,
            patterns: 0.25,
            naturalness: 0.15,
            connectors: 0.10
        };

        let probability = 0;
        Object.keys(weights).forEach(key => {
            probability += metrics[key] * weights[key];
        });

        return Math.round(probability);
    }

    analyzeSentences(text) {
        const sentences = this.getSentences(text);
        return sentences.map(sentence => {
            const lowerSentence = sentence.toLowerCase();
            let score = 30; // Base score

            // Check for AI patterns in this sentence
            this.aiPatterns.formulaicPhrases.forEach(phrase => {
                if (lowerSentence.includes(phrase)) score += 20;
            });

            this.aiPatterns.connectors.forEach(connector => {
                if (lowerSentence.includes(connector)) score += 10;
            });

            this.aiPatterns.perfectStructures.forEach(structure => {
                if (new RegExp('\\b' + structure + '\\b').test(lowerSentence)) score += 15;
            });

            // Check sentence length uniformity
            const wordCount = sentence.split(/\s+/).length;
            if (wordCount >= 15 && wordCount <= 25) score += 10; // AI sweet spot

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
            ]
        };

        const range = ranges[type].find(r => value <= r.max);
        return range || ranges[type][ranges[type].length - 1];
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    const detector = new SpanishAIDetector();
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const wordCount = document.getElementById('wordCount');
    const resultsSection = document.getElementById('resultsSection');

    // Word count update
    textInput.addEventListener('input', () => {
        const words = textInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        wordCount.textContent = `${words.length} palabra${words.length !== 1 ? 's' : ''}`;
    });

    // Analyze button
    analyzeBtn.addEventListener('click', () => {
        const text = textInput.value.trim();

        if (text.length < 50) {
            alert('Por favor, ingresa al menos 50 caracteres para analizar.');
            return;
        }

        const results = detector.analyze(text);
        displayResults(results, text);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        wordCount.textContent = '0 palabras';
        resultsSection.style.display = 'none';
    });

    function displayResults(results, originalText) {
        // Show results section
        resultsSection.style.display = 'block';

        // Update probability
        const probabilityScore = document.getElementById('probabilityScore');
        const probabilityFill = document.getElementById('probabilityFill');
        const verdict = document.getElementById('verdict');

        probabilityScore.textContent = `${results.probability}%`;
        probabilityFill.style.width = `${results.probability}%`;

        // Color code the probability bar
        probabilityFill.className = 'probability-fill';
        if (results.probability >= 75) {
            probabilityFill.classList.add('high');
        } else if (results.probability >= 50) {
            probabilityFill.classList.add('medium');
        } else {
            probabilityFill.classList.add('low');
        }

        verdict.innerHTML = `
            <strong>${results.verdict.text}</strong>
            <p>${results.verdict.description}</p>
        `;
        verdict.className = `verdict ${results.verdict.level}`;

        // Update metrics
        updateMetric('uniformity', results.metrics.uniformity, detector);
        updateMetric('complexity', results.metrics.complexity, detector);
        updateMetric('sentenceVariation', results.metrics.sentenceVariation, detector);
        updateMetric('patterns', results.metrics.patterns, detector);
        updateMetric('naturalness', results.metrics.naturalness, detector);
        updateMetric('connectors', results.metrics.connectors, detector);

        // Highlight text
        highlightText(originalText, results.sentenceScores);

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateMetric(metricId, value, detector) {
        const element = document.getElementById(metricId);
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
