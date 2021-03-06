import trello from "trello";
import fs from "fs";
import slug from "slug";
import parse from "htmldom";
import https from "https";
import { asyncFunc } from "./utils.mjs";

if (!fs.existsSync("trello/_includes/fragments")) {
    fs.mkdirSync("trello/_includes/fragments", { recursive: true });
}

const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID } = process.env;

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
    const elts = [];
    const $ = parse(html);
    $(tag).each((_, elt) => {
        elts.push(elt.textContent);
    });
    return elts.join("\n");
};

const stripCSS = (html) => html.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gim, "");

const downloadAttachments = (card, path) => {
    if (card.badges.attachments == 0) {
        return;
    }

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    Trello.makeRequest("get", `/1/cards/${card.id}/attachments`).then((attachments) => {
        attachments.map(({ fileName, url }) => {
            if (!fs.existsSync(`${path}/${fileName}`)) {
                const download = fs.createWriteStream(`${path}/${fileName}`);
                https.get(url, (res) => {
                    res.pipe(download);
                    download.on("finish", () => {
                        download.close();
                        console.log(`Download Completed [${card.name}/${fileName}]`);
                    });
                });
            }
        });
    });
};

const persistTemplates = (list, cards) =>
    cards.map((card, ci) => {
        if (card.isTemplate) {
            const templateName = card.name == "main" ? "main" : `fragments/${slug(card.name)}`;
            const css = extract(card.desc, "style");
            if (css) {
                fs.writeFileSync(`trello/_includes/${templateName}.css`, css);
            }
            fs.writeFileSync(`trello/_includes/${templateName}.njk`, stripCSS(card.desc));

            downloadAttachments(card, `trello/resources/${card.name}`);
        }
    });

const persistPage = (list, cards) => {
    let frontmatter = { layout: "main.njk", title: list.name };

    let html = Array.prototype.concat(
        cards.map((card, ci) => {
            downloadAttachments(card, "trello/resources");
            if (card.labels.length > 0) {
                return useTemplate(card);
            }
            if (slug(card.name) == "frontmatter") {
                card.desc
                    .split("\n")
                    .filter((elt) => elt.trim())
                    .map((fmd) => (([key, value]) => (frontmatter[key] = value))(fmd.split(/:[ ]?(.*)/)));
                return "";
            }
            return `# ${card.name}\n\n` + card.desc;
        })
    );

    html = Array.prototype.concat(
        ["---"],
        Object.keys(frontmatter).map((key) => `${key}: ${frontmatter[key]}`),
        ["---"],
        html
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
