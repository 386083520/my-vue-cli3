module.exports = class PromptModuleAPI {
    constructor (creator) {
        this.creator = creator
    }
    injectFeature (feature) {
        this.creator.featurePrompt.choices.push(feature)
    }
    onPromptComplete (cb) {
        this.creator.promptCompleteCbs.push(cb)
    }
}
