import dotenv from "dotenv";
import trello from "trello";
import fs from "fs";
import slug from "slug";
import parse from "htmldom";

const asyncFunc = async (promise) => {
    try {
        const data = await promise;
        return { data };
    } catch (error) {
        return { error };
    }
};

if (!fs.existsSync("trello")) {
    fs.mkdirSync("trello");
    fs.mkdirSync("trello/_includes");
}
if (!fs.existsSync("trello/_includes/fragments")) {
    fs.mkdirSync("trello/_includes/fragments");
}

const {
    parsed: { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID },
} = dotenv.config();

const Trello = new trello(TRELLO_API_KEY, TRELLO_TOKEN);

const { data: lists } = await asyncFunc(Trello.getListsOnBoard(TRELLO_BOARD_ID));

const useTemplate = (card) =>
    [
        `{% set title = "${card.name}" %}`,
        `{% set content %}`,
        card.desc,
        `{% endset %}`,
        `{% include "fragments/${slug(card.labels[0].name)}.njk" %}`,
    ].join("\n");

const extract = (html, tag) => {
    const css = [];
    const $ = parse(html);
    $("style").each((_, style) => {
        css.push(style.textContent);
    });
    return css.join("\n");
};

const excludeCSS = (html) => html.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gim, "");

const persistTemplates = (list, cards) =>
    cards.map((card, ci) => {
        if (card.isTemplate) {
            const templateName = card.name == "main" ? "main" : `fragments/${slug(card.name)}`;
            const css = extract(card.desc, "style");
            if (css) {
                fs.writeFileSync(`trello/_includes/${templateName}.css`, css);
            }
            fs.writeFileSync(`trello/_includes/${templateName}.njk`, excludeCSS(card.desc));
        }
    });

const persistPage = (list, cards) => {
    let html = ["---", "layout: main.njk", `title: ${list.name}`, "---"];

    html = html.concat(
        cards.map((card, ci) => {
            if (card.labels.length > 0) {
                return useTemplate(card);
            }
            return `# ${card.name}\n\n` + card.desc;
        })
    );

    fs.writeFileSync(`trello/${slug(list.name)}.md`, html.join("\n"));
};

lists.map(async (list, li) => {
    const { data: cards } = await asyncFunc(Trello.getCardsOnList(list.id));
    if (slug(list.name) == "templates") {
        return persistTemplates(list, cards);
    }

    return persistPage(list, cards);
});
