figex
=================

Figma export CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
```sh-session
$ npm install @cli107/figex --save-dev
$ figex COMMAND
running command...
$ figex --help [COMMAND]
USAGE
  $ figex COMMAND
```

# Commands
<!-- commands -->
* [`figex help [COMMANDS]`](#figex-help-commands)
* [`figex make:config`](#figex-makeconfig)
* [`figex sync`](#figex-sync)

## `figex help [COMMANDS]`

Display help for figex.

```
USAGE
  $ figex help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for figex.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `figex make:config`

Create configuration file

```
USAGE
  $ figex make:config

DESCRIPTION
  Create configuration file

EXAMPLES
  $ figex make:config
```

_See code: [src/commands/make/config.ts](https://github.com/4746/figex/blob/v0.0.2/src/commands/make/config.ts)_

## `figex sync`

Sync svg icons

```
USAGE
  $ figex sync [--fileId <value>] [--nameExportType <value>] [--page <value>] [--pathFileSprite <value>]
    [--pathFileType <value>] [--phpNamespace <value>] [--phpUse <value>] [--showResultTable] [--silent] [--token
    <value>]

FLAGS
  --fileId=<value>          Figma fileId or create env.FIGMA_FILE_ID
  --nameExportType=<value>  Name enum .ts or .php
  --page=<value>            ...
  --pathFileSprite=<value>  Represents the path to a sprite svg file.
  --pathFileType=<value>    Represents the file type of a given path.
  --phpNamespace=<value>    The PHP namespace represents the namespace of a PHP enum file.
  --phpUse=<value>          Extend enum via use OtherEnums
  --showResultTable
  --silent
  --token=<value>

DESCRIPTION
  Sync svg icons

EXAMPLES
  $ figex sync --help
```

_See code: [src/commands/sync.ts](https://github.com/4746/figex/blob/v0.0.2/src/commands/sync.ts)_
<!-- commandsstop -->


--- 

## Example config file  `.figex.config.json`
```json
{
  "designSystem": {
    "projects": {
      "social_network": {
        "path": "dist/svg/social_network",
        "prefix": "social_network"
      },
      "section": {
        "path": "dist/svg/section",
        "prefix": "section"
      }
    }
  },
  "fileId": "...",
  "page": "icons",
  "personalToken": "figd_...",
  "removeFromName": "Icon=",
  "nameExportType": "TSvg",
  "pathFileType": "dist/svg/svg.enum.ts",
  "pathFileSprite": "dist/svg/sprite-icons.svg"
}
```


---

## Example compile enum file  `svg.enum.ts`
```typescript
export const SVG_BUILD_VERSION = "{version}"

export type TSvg = 'social_network.arrow_downward'
  | 'social_network.arrow_left'
  | 'section.arrow_right'
  | 'section.arrow_upward';


export type TSvgOrString  = TSvg | string;

export type TSvgOrNever  = TSvg | never;
```


---

## Example compile svg file  `sprite-icons.svg`
```html
<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<symbol id='social_network.arrow_downward' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill="currentColor" d="M7.333 2.667v8.116L3.6 7.05 2.667 8 8 13.333 13.333 8l-.933-.95-3.733 3.733V2.667z"/></symbol>
	<symbol id='social_network.arrow_left' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill="currentColor" fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" clip-rule="evenodd"/></symbol>
	<symbol id='section.arrow_right' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill="currentColor" fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" clip-rule="evenodd"/></symbol>
	<symbol id='section.arrow_upward' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill="currentColor" d="M7.333 13.333V5.217L3.6 8.95 2.667 8 8 2.667 13.333 8l-.933.95-3.733-3.733v8.116z"/></symbol>
</svg>
```
