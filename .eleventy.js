module.exports = (config) => {
    config.setUseGitIgnore(false);
    return {
        dir: {
            input: "trello",
            output: "dist",
        },
        markdownTemplateEngine: "njk",
    };
};
