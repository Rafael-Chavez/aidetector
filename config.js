// Configuration for Hugging Face API
const CONFIG = {
    // Get your free API key from: https://huggingface.co/settings/tokens
    HUGGINGFACE_API_KEY: 'hf_ivmjDAkUmEmgFSZomeAUAwixACHaixOyckYOUR_API_KEY_HERE',

    // Spanish GPT-2 model from PlanTL-GOB-ES for perplexity analysis
    PERPLEXITY_MODEL: 'PlanTL-GOB-ES/gpt2-large-bne',

    // API endpoint
    API_URL: 'https://api-inference.huggingface.co/models/',

    // Detection thresholds
    THRESHOLDS: {
        PERPLEXITY_LOW: 20,      // Low perplexity = likely AI
        PERPLEXITY_HIGH: 50,     // High perplexity = likely human
        BURSTINESS_LOW: 0.3,     // Low burstiness = likely AI
        BURSTINESS_HIGH: 0.7     // High burstiness = likely human
    }
};

// Export for use in detector
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
