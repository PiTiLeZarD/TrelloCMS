const fg = require("fast-glob");
const fs = require("fs");
const CleanCSS = require("clean-css");

module.exports = (config) => {
    config.setUseGitIgnore(false);

    config.addShortcode("unescape", (data) => unescape(data));
    config.addShortcode("includeall", (pattern) =>
        fg
            .sync(pattern)
            .map((file) => fs.readFileSync(file))
            .join("\n")
    );
    config.addPairedShortcode("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    return {
        dir: {
            input: "trello",
            output: "dist",
        },
        markdownTemplateEngine: "njk",
    };
};
