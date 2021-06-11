# TrelloCMS

TrelloCMS is a concept for now. Just trying to suss out if I can use Trello and eleventy to generate a static website

For now, create a .env file with:

```
TRELLO_API_KEY=""
TRELLO_TOKEN=""
TRELLO_BOARD_ID=""
```

Get your key/token from https://trello.com/app-key

Then run

```
yarn trello
yarn 11ty --serve
```

Et voila!

# Trello Board

Each column is a page, you should have an Index column. Page names are slugged so you can name them anything.

Each card is a block on that page.

You can create a trello template which will be stored as a nunjucks fragment. Any card that has a label with the name of that template will be using it.

TODO: I will try to gather all the styles of all templates/blocks and create one site.css minified styles (maybe same with javascript?)
TODO: use trello images and reference to that
