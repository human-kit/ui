---
title: AI agents
description: Give coding agents the documentation of @human-kit/ui — markdown pages, llms.txt, docs in the npm package, and an agent skill.
---

# AI agents

A coding agent writes better code with a component when it reads the documentation first. `@human-kit/ui` gives the documentation in forms that an agent can read with no browser.

## Docs in the npm package

The package contains its documentation as markdown, one file for each page of this site:

- `node_modules/@human-kit/ui/docs/README.md` is the index.
- `node_modules/@human-kit/ui/docs/<page>.md` is one page, for example `dialog.md`.

These files match the version that you installed. An agent in your project can read them with no network. Tell your agent to read them, or put this line in the instructions file of your project (for example `AGENTS.md` or `CLAUDE.md`):

```md
Before you write code with @human-kit/ui, read the page of the component in node_modules/@human-kit/ui/docs/.
```

## Agent skill

The skill tells an agent how to use the library: the imports, the parts, the state and the styles with data attributes. It also gives the errors that agents make frequently. It also tells the agent to read the docs in the package. Install it with the `skills` command:

```bash
npx skills add human-kit/ui
```

The source of the skill is `skills/human-kit-ui/SKILL.md` in the repository.

## Markdown pages

Each page of this site has a markdown twin. Add `.md` to the URL, for example [/docs/dialog.md](/docs/dialog.md). The menu at the top of each page can also copy the markdown, or open a chat with an assistant about the page.

## llms.txt

These files follow the [llms.txt](https://llmstxt.org) format:

| File | Content | Size |
| --- | --- | --- |
| [/llms.txt](/llms.txt) | An index of all of the pages, with a link to each markdown twin. | Small |
| [/llms-small.txt](/llms-small.txt) | The anatomy and the API of each page, with no prose. | About 30k tokens |
| [/llms-full.txt](/llms-full.txt) | The full text of all of the pages. | About 200k tokens |

Give the index to an agent that can follow links. Give `llms-small.txt` to an agent that must have the full API in one context window.
