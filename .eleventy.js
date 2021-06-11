module.exports = (config) => {
    config.setUseGitIgnore(false);

    config.addShortcode("unescape", (data) => unescape(data));

    return {
        dir: {
            input: "trello",
            output: "dist",
        },
        markdownTemplateEngine: "njk",
    };
};
