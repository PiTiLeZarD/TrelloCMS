import dotenv from "dotenv";
import trello from "trello";
import fs from "fs";

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
}

const {
    parsed: { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID },
} = dotenv.config();

const Trello = new trello(TRELLO_API_KEY, TRELLO_TOKEN);

const { data: lists } = await asyncFunc(Trello.getListsOnBoard(TRELLO_BOARD_ID));

lists.map(async (list, li) => {
    const { data: cards } = await asyncFunc(Trello.getCardsOnList(list.id));
    const html = cards
        .map((card, ci) => {
            return card.desc;
        })
        .join("\n");

    fs.writeFileSync(`trello/${list.name}.md`, html);
});
