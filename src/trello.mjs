import dotenv from "dotenv";
import trello from "trello";
import fs from "fs";
import slug from "slug";

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
        `{% set content = '${escape(card.desc)}' %}`,
        `{% include "fragments/${slug(card.labels[0].name)}.njk" %}`,
    ].join("\n");

lists.map(async (list, li) => {
    const { data: cards } = await asyncFunc(Trello.getCardsOnList(list.id));
    let html = ["---", "layout: main.njk", `title: ${list.name}`, "---"];

    html = html.concat(
        cards.map((card, ci) => {
            if (card.isTemplate) {
                fs.writeFileSync(`trello/_includes/fragments/${slug(card.name)}.njk`, card.desc);
                return "";
            }
            if (card.labels.length > 0) {
                return useTemplate(card);
            }
            return `# ${card.name}\n\n` + card.desc;
        })
    );

    fs.writeFileSync(`trello/${slug(list.name)}.md`, html.join("\n"));
});
