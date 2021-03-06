# TrelloCMS

TrelloCMS is website building using 11ty to generate a website which content is taken from Trello.

## Prerequisites

Create a .env file with:

```
TRELLO_API_KEY=
TRELLO_TOKEN=
TRELLO_BOARD_ID=
```

The setup process will help you fill this up.

## Setup your board

The app comes with a rudimentary helper to setup your environment variables and board for a basic website

```
docker run --rm --env-file .env pitilezard/trello-cms setup
```

This will walk you through what you should be doing and will create the lists and cards for a basic setup

## Run it

Get to the directory you want to generate your website in and run:

```
docker run -v "`pwd`:/app/dist" --rm --env-file .env pitilezard/trello-cms
```

## Setup in your project

You can use a bashscript or yarn/npm to run this. I use yarn this way:

```
    "scripts": {
        "build": "docker run -v \"`pwd`/docs:/app/dist\" --rm --env-file .env pitilezard/trello-cms",
    }
```

# Trello Board

This doesn't replace a proper doc, but for now here is the idea:

Each column is a page, you should have an Index column. Page names are slugged so you can name them anything.

Each card is a block on that page.

You can create trello templates in a column called "templates" which will be stored as a nunjucks fragment. Any card that has a label with the name of that template will be using it. Also you can override the default main template by creating a template card with the name "main"

If you upload an attachment to a template, it will be available at url/resources/TemplateName/attachment.ext. If that attachment is text (svg or chuck of html or whatever) a shortcode {% resource "TemplateName/attachment.ext" %} will be replaced by its content
