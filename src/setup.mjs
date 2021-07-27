import trello from "trello";
import { asyncFunc } from "./utils.mjs";

const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID } = process.env;
const Trello = new trello(TRELLO_API_KEY, TRELLO_TOKEN);

const data = await asyncFunc(Trello.getListsOnBoard(TRELLO_BOARD_ID));
if (data == undefined || data.error) {
    throw new Error("Could not find the board selected, check your environment variables");
}

const lists = data.data.map((list, i) => list.name);
// let blockLabelId = null;

if (!lists.includes("Templates")) {
    console.log("Creating board [Templates]");
    const {
        data: { id: templatesListId },
    } = await asyncFunc(Trello.addListToBoard(TRELLO_BOARD_ID, "Templates"));

    console.log("   . Creating card [main]");
    await asyncFunc(
        Trello.addCard(
            "main",
            `---
title: Example Website
---

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <title>{{ title }}</title>
    </head>
    <body>
        <h1>{{ title }}</h1>
        <div>
            {{ content | safe }}
        </div>
    </body>
</html>`,
            templatesListId
        )
    );

    console.log("   . Creating card [block]");
    await asyncFunc(
        Trello.addCard(
            "block",
            `
<style type="text/css">
    section.block {
        width: 80%;
        margin: 1em auto;
        padding: 1em 2em;
        background-color: #ddd;
        border: 1px dotted black;
    }
</style>

<section class="block">
    <h2>{{ title }}</h2>
    <p>{{ content | safe }}</p>
</section>
`,
            templatesListId
        )
    );

    // console.log("   . Creating label [block]");
    // const data = await asyncFunc(Trello.addLabelOnBoard(TRELLO_BOARD_ID, "block", "green"));
    // blockLabelId = blockData.id;

    console.log('/!\\ For this to work, you\'ll need to get to all cards in "Templates" and click "Make template"');
} else {
    console.log("Templates already exist, ignoring");
}

if (!lists.includes("Index")) {
    console.log("Creating board [Index]");
    const {
        data: { id: indexListId },
    } = await asyncFunc(Trello.addListToBoard(TRELLO_BOARD_ID, "Index"));

    console.log("   . Creating card [Frontmatter]");
    await asyncFunc(
        Trello.addCard(
            "Frontmatter",
            `
title: Page Title
eleventyNavigation:
  key: Index
`,
            indexListId
        )
    );

    console.log("   . Creating card [Example Block 1]");
    const {
        data: { id: exbl1Id },
    } = await asyncFunc(
        Trello.addCard(
            "Example Block 1",
            `
Here you can mix

- Markdown
- Or <b>even</b> HTML
`,
            indexListId
        )
    );

    console.log("   . Adding label [block] to [Example Block 1]");
    // await asyncFunc(Trello.addLabelToCard(exbl1Id, blockLabelId));
    console.log("/!\\ not working, please add the label block manually");

    console.log("   . Creating card [Example 2]");
    await asyncFunc(
        Trello.addCard(
            "Example 2",
            `
Just showing that you don't need to link a card to a template
`,
            indexListId
        )
    );

    console.log("   . Creating card [Example Block 3]");
    const {
        data: { id: exbl3Id },
    } = await asyncFunc(
        Trello.addCard(
            "Example Block 3",
            `
And here showing that you can reuse code with templates
`,
            indexListId
        )
    );

    console.log("   . Adding label [block] to [Example Block 3]");
    console.log("/!\\ not working, please add the label block manually");
    // await asyncFunc(Trello.addLabelToCard(exbl3Id, blockLabelId));
}

/** Have a trello folder which is ready to start (optional caching of that folder?) */
/** docker run --rm -v "`pwd`/../:/app" --env-file ../.env trello-cms */
