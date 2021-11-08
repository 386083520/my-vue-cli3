exports.getPromptModules = () => {
    return [
        'vuex',
        'router'
    ].map(file => require(`../promptModules/${file}`))
}
