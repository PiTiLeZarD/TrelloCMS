const fg = require("fast-glob");
const fs = require("fs");
const CleanCSS = require("clean-css");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = (config) => {
    config.setUseGitIgnore(false);

    config.addPlugin(eleventyNavigationPlugin);

    config.addPassthroughCopy("trello/resources");

    config.addShortcode("resource", (path) => fs.readFileSync(`trello/resources/${path}`, "utf8"));
    config.addShortcode("unescape", (data) => unescape(data));
    config.addShortcode("includeall", (pattern) =>
        fg
            .sync(pattern)
            .map((file) => fs.readFileSync(file))
            .join("\n")
    );
    config.addPairedShortcode("cssmin", (code) => new CleanCSS({}).minify(code).styles);

    return {
        dir: {
            input: "trello",
            output: "dist",
        },
        markdownTemplateEngine: "njk",
    };
};
