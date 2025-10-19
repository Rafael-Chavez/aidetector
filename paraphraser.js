// Ethical Paraphrasing Assistant
// Helps users rewrite text while maintaining meaning and encouraging proper attribution

class EthicalParaphraser {
    constructor() {
        this.apiKey = CONFIG.HUGGINGFACE_API_KEY;
        this.isApiEnabled = this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';

        // Paraphrasing strategies for different levels
        this.strategies = {
            light: {
                name: 'Ligero',
                description: 'Cambios mínimos, principalmente sinónimos',
                preserveStructure: true,
                synonymIntensity: 0.3
            },
            moderate: {
                name: 'Moderado',
                description: 'Reestructuración de oraciones y vocabulario',
                preserveStructure: false,
                synonymIntensity: 0.6
            },
            heavy: {
                name: 'Profundo',
                description: 'Reescritura completa manteniendo el significado',
                preserveStructure: false,
                synonymIntensity: 0.9
            }
        };

        // Synonym banks for Spanish
        this.synonyms = {
            // Common verbs
            'hacer': ['realizar', 'ejecutar', 'llevar a cabo', 'efectuar'],
            'decir': ['expresar', 'manifestar', 'afirmar', 'indicar'],
            'tener': ['poseer', 'contar con', 'disponer de'],
            'ser': ['constituir', 'representar'],
            'estar': ['encontrarse', 'hallarse', 'ubicarse'],
            'dar': ['proporcionar', 'otorgar', 'brindar', 'suministrar'],
            'ver': ['observar', 'visualizar', 'contemplar', 'apreciar'],
            'saber': ['conocer', 'estar al tanto', 'tener conocimiento'],
            'poder': ['ser capaz de', 'tener la capacidad de'],
            'poner': ['colocar', 'ubicar', 'situar', 'disponer'],

            // Common adjectives
            'importante': ['relevante', 'significativo', 'trascendental', 'fundamental'],
            'grande': ['extenso', 'amplio', 'considerable', 'vasto'],
            'bueno': ['adecuado', 'apropiado', 'favorable', 'positivo'],
            'malo': ['inadecuado', 'desfavorable', 'negativo', 'perjudicial'],
            'nuevo': ['reciente', 'moderno', 'actual', 'innovador'],
            'viejo': ['antiguo', 'tradicional', 'previo', 'anterior'],
            'difícil': ['complejo', 'complicado', 'arduo', 'desafiante'],
            'fácil': ['sencillo', 'simple', 'accesible', 'elemental'],

            // Common nouns
            'problema': ['inconveniente', 'dificultad', 'obstáculo', 'contratiempo'],
            'solución': ['respuesta', 'resolución', 'alternativa', 'remedio'],
            'ejemplo': ['muestra', 'caso', 'ilustración', 'modelo'],
            'proceso': ['procedimiento', 'método', 'sistema', 'mecanismo'],
            'resultado': ['consecuencia', 'efecto', 'producto', 'desenlace'],
            'forma': ['manera', 'modo', 'método', 'procedimiento'],
            'idea': ['concepto', 'noción', 'pensamiento', 'planteamiento'],
            'persona': ['individuo', 'sujeto', 'ser humano'],

            // Connectors
            'sin embargo': ['no obstante', 'con todo', 'pese a ello', 'aun así'],
            'por lo tanto': ['por consiguiente', 'en consecuencia', 'por ende', 'de modo que'],
            'además': ['asimismo', 'igualmente', 'también', 'adicionalmente'],
            'por ejemplo': ['como muestra', 'a modo de ejemplo', 'verbigracia'],
            'en conclusión': ['en resumen', 'para concluir', 'en definitiva', 'finalmente']
        };

        // Sentence restructuring patterns
        this.restructurePatterns = [
            {
                // Active to passive transformation hints
                from: /(\w+)\s+(hace|realiza|ejecuta)\s+(.+)/i,
                suggest: 'Consider passive voice'
            },
            {
                // Long sentences can be split
                from: /,.*,.*,/,
                suggest: 'Consider splitting into multiple sentences'
            }
        ];
    }

    async paraphrase(text, level = 'moderate', onProgress) {
        if (!text || text.trim().length < 10) {
            throw new Error('El texto debe tener al menos 10 caracteres');
        }

        // Check if text appears to be a quotation or copyrighted
        const warningCheck = this.checkForCitations(text);

        if (onProgress) onProgress('Analizando texto original...', 10);

        // Generate 3 alternative paraphrases
        const alternatives = [];

        for (let i = 0; i < 3; i++) {
            if (onProgress) onProgress(`Generando alternativa ${i + 1}...`, 20 + (i * 25));

            let paraphrased;
            if (this.isApiEnabled) {
                // Use AI-powered paraphrasing
                paraphrased = await this.aiParaphrase(text, level, i);
            } else {
                // Use rule-based paraphrasing
                paraphrased = this.ruleBasedParaphrase(text, level, i);
            }

            alternatives.push({
                text: paraphrased,
                level: level,
                explanation: this.getExplanation(level, i)
            });
        }

        if (onProgress) onProgress('Generando recomendaciones...', 95);

        return {
            original: text,
            alternatives: alternatives,
            level: this.strategies[level].name,
            warnings: warningCheck,
            citationSuggestions: this.generateCitationSuggestions(text),
            metadata: {
                fidelityCheck: this.checkFidelity(text, alternatives[0].text),
                tone: this.analyzeTone(text),
                rewriteLevel: level
            }
        };
    }

    checkForCitations(text) {
        const warnings = [];

        // Check for quotation marks
        if (text.includes('"') || text.includes('"') || text.includes('"')) {
            warnings.push({
                type: 'quotation',
                message: 'El texto contiene comillas. Si es una cita, asegúrate de incluir la atribución apropiada.',
                severity: 'high'
            });
        }

        // Check for academic/formal patterns
        const academicPatterns = [
            'según', 'de acuerdo con', 'conforme a', 'tal como señala',
            'como indica', 'según lo establecido'
        ];

        academicPatterns.forEach(pattern => {
            if (text.toLowerCase().includes(pattern)) {
                warnings.push({
                    type: 'citation',
                    message: 'El texto parece hacer referencia a otras fuentes. Considera incluir citas apropiadas.',
                    severity: 'medium'
                });
            }
        });

        // Check for very long, formal text (might be copied)
        if (text.length > 500 && this.calculateFormality(text) > 0.7) {
            warnings.push({
                type: 'copyright',
                message: 'Texto extenso y formal detectado. Si proviene de una fuente publicada, verifica que tienes derecho a parafrasearlo y añade la cita correspondiente.',
                severity: 'high'
            });
        }

        return warnings;
    }

    calculateFormality(text) {
        const formalIndicators = [
            'mediante', 'a través de', 'en virtud de', 'en función de',
            'conforme', 'respectivo', 'correspondiente', 'pertinente',
            'asimismo', 'no obstante', 'por consiguiente', 'en consecuencia'
        ];

        let formalCount = 0;
        const lowerText = text.toLowerCase();

        formalIndicators.forEach(indicator => {
            const count = (lowerText.match(new RegExp('\\b' + indicator + '\\b', 'g')) || []).length;
            formalCount += count;
        });

        const words = text.split(/\s+/).length;
        return Math.min(1, formalCount / (words * 0.05));
    }

    async aiParaphrase(text, level, variant) {
        // Use Hugging Face translation or text generation models
        const models = {
            paraphrase: 'Narrativa/paraphrase-spanish',
            generation: 'PlanTL-GOB-ES/gpt2-large-bne'
        };

        const prompts = {
            light: `Parafrasea ligeramente este texto en español, usando sinónimos pero manteniendo la estructura: "${text}"`,
            moderate: `Reescribe este texto en español con diferentes palabras y estructura, manteniendo el significado: "${text}"`,
            heavy: `Reescribe completamente este texto en español con un enfoque diferente, preservando solo las ideas principales: "${text}"`
        };

        try {
            // Try paraphrase-specific model first
            const response = await fetch(CONFIG.API_URL + models.generation, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompts[level],
                    parameters: {
                        max_length: text.length + 100,
                        temperature: 0.7 + (variant * 0.15), // Vary temperature for different alternatives
                        top_p: 0.9,
                        do_sample: true
                    },
                    options: { wait_for_model: true }
                })
            });

            if (response.ok) {
                const result = await response.json();
                let paraphrased = '';

                if (Array.isArray(result) && result[0]?.generated_text) {
                    paraphrased = result[0].generated_text;
                    // Clean up the prompt from the result
                    paraphrased = paraphrased.replace(prompts[level], '').trim();
                }

                // Fallback to rule-based if result is empty or too similar
                if (!paraphrased || paraphrased.length < 10) {
                    return this.ruleBasedParaphrase(text, level, variant);
                }

                return paraphrased;
            }
        } catch (error) {
            console.warn('AI paraphrasing failed, using rule-based fallback:', error);
        }

        // Fallback to rule-based
        return this.ruleBasedParaphrase(text, level, variant);
    }

    ruleBasedParaphrase(text, level, variant) {
        let result = text;
        const strategy = this.strategies[level];

        // Split into sentences
        const sentences = this.getSentences(text);
        const paraphrasedSentences = [];

        sentences.forEach((sentence, index) => {
            let paraphrased = sentence;

            // Apply synonym replacement
            if (strategy.synonymIntensity > 0) {
                paraphrased = this.replaceSynonyms(paraphrased, strategy.synonymIntensity, variant);
            }

            // Restructure sentences for moderate and heavy levels
            if (!strategy.preserveStructure && level !== 'light') {
                paraphrased = this.restructureSentence(paraphrased, level, variant);
            }

            // For heavy level, sometimes combine or split sentences
            if (level === 'heavy' && sentences.length > 1) {
                if (index > 0 && Math.random() > 0.6) {
                    // Combine with previous sentence
                    const prev = paraphrasedSentences.pop();
                    paraphrased = this.combineSentences(prev, paraphrased);
                }
            }

            paraphrasedSentences.push(paraphrased);
        });

        result = paraphrasedSentences.join(' ');

        // Ensure variation between alternatives
        result = this.addVariation(result, variant);

        return result;
    }

    replaceSynonyms(text, intensity, variant) {
        let result = text;
        const words = text.split(/\b/);

        words.forEach((word, index) => {
            const lowerWord = word.toLowerCase();

            if (this.synonyms[lowerWord]) {
                // Use intensity and variant to decide whether to replace
                if (Math.random() < intensity) {
                    const synonymList = this.synonyms[lowerWord];
                    // Use variant to select different synonyms for different alternatives
                    const synonymIndex = (variant + Math.floor(Math.random() * synonymList.length)) % synonymList.length;
                    const replacement = synonymList[synonymIndex];

                    // Preserve capitalization
                    if (word[0] === word[0].toUpperCase()) {
                        words[index] = replacement.charAt(0).toUpperCase() + replacement.slice(1);
                    } else {
                        words[index] = replacement;
                    }
                }
            }
        });

        return words.join('');
    }

    restructureSentence(sentence, level, variant) {
        // Simple restructuring strategies
        const strategies = [
            // Strategy 0: Reverse clauses if there's a comma
            (s) => {
                const parts = s.split(',');
                if (parts.length === 2) {
                    return parts[1].trim() + ', ' + parts[0].trim().toLowerCase();
                }
                return s;
            },
            // Strategy 1: Change word order slightly
            (s) => s,
            // Strategy 2: Add transition words
            (s) => {
                const transitions = ['Cabe señalar que', 'Es importante notar que', 'Conviene destacar que'];
                if (!s.match(/^(Es|Cabe|Conviene)/)) {
                    return transitions[variant % transitions.length] + ' ' + s.toLowerCase();
                }
                return s;
            }
        ];

        const strategyIndex = variant % strategies.length;
        return strategies[strategyIndex](sentence);
    }

    combineSentences(sentence1, sentence2) {
        const connectors = ['además', 'asimismo', 'igualmente', 'por otro lado'];
        const connector = connectors[Math.floor(Math.random() * connectors.length)];

        // Remove period from first sentence
        const first = sentence1.replace(/\.$/, '');
        // Lowercase first letter of second sentence
        const second = sentence2.charAt(0).toLowerCase() + sentence2.slice(1);

        return `${first}; ${connector}, ${second}`;
    }

    addVariation(text, variant) {
        // Add slight variations to make alternatives different
        if (variant === 1) {
            // Make slightly more formal
            text = text.replace(/es importante/gi, 'resulta fundamental');
        } else if (variant === 2) {
            // Make slightly less formal
            text = text.replace(/resulta fundamental/gi, 'es importante');
        }
        return text;
    }

    getSentences(text) {
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    getExplanation(level, variant) {
        const explanations = {
            light: [
                'Sinónimos simples, estructura original preservada',
                'Cambios mínimos de vocabulario, mantiene el estilo',
                'Reemplazo conservador de palabras clave'
            ],
            moderate: [
                'Reestructuración de oraciones con nuevo vocabulario',
                'Cambios en orden y conectores, significado preservado',
                'Reformulación con diferentes construcciones sintácticas'
            ],
            heavy: [
                'Reescritura completa con nuevo enfoque',
                'Transformación profunda manteniendo ideas centrales',
                'Reconstrucción total con perspectiva alternativa'
            ]
        };

        return explanations[level][variant % 3];
    }

    checkFidelity(original, paraphrased) {
        const origWords = new Set(original.toLowerCase().match(/\b\w+\b/g));
        const paraWords = new Set(paraphrased.toLowerCase().match(/\b\w+\b/g));

        let overlap = 0;
        origWords.forEach(word => {
            if (paraWords.has(word)) overlap++;
        });

        const similarity = overlap / Math.max(origWords.size, paraWords.size);

        if (similarity > 0.7) {
            return 'Alta similitud con el original - considera más cambios';
        } else if (similarity > 0.4) {
            return 'Buena paráfrasis - significado preservado con suficientes cambios';
        } else {
            return 'Baja similitud - verifica que el significado se mantuvo';
        }
    }

    analyzeTone(text) {
        const formality = this.calculateFormality(text);

        if (formality > 0.6) return 'Formal/Académico';
        if (formality > 0.3) return 'Moderadamente formal';
        return 'Informal/Conversacional';
    }

    generateCitationSuggestions(text) {
        return {
            apa: 'Apellido, A. (Año). Título del trabajo. Editorial.',
            mla: 'Apellido, Nombre. "Título." Publicación, Fecha.',
            chicago: 'Apellido, Nombre. Título. Ciudad: Editorial, Año.',
            general: 'Recuerda citar la fuente original incluso después de parafrasear.',
            advice: [
                'Incluye una referencia bibliográfica completa',
                'Menciona al autor original al principio del parágrafo',
                'Usa frases como "Según [Autor]..." o "Como señala [Autor]..."',
                'La paráfrasis no elimina la necesidad de citar la fuente'
            ]
        };
    }

    // Prevent misuse detection
    detectMisuse(text, purpose) {
        const redFlags = [];

        // Check for academic dishonesty patterns
        if (purpose && purpose.toLowerCase().includes('tarea') ||
            purpose.toLowerCase().includes('examen') ||
            purpose.toLowerCase().includes('prueba')) {
            redFlags.push({
                type: 'academic',
                message: 'Si usas esta herramienta para trabajos académicos, asegúrate de seguir las políticas de tu institución y citar apropiadamente.'
            });
        }

        // Check for signs of hiding plagiarism
        if (text.length > 1000 && !text.includes('©') && !text.includes('fuente')) {
            redFlags.push({
                type: 'attribution',
                message: 'Texto extenso sin atribución visible. Asegúrate de que tienes derecho a usar y parafrasear este contenido.'
            });
        }

        return redFlags;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EthicalParaphraser;
}
