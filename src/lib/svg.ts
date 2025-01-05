import fs from "node:fs";
import path from "node:path";
import {optimize} from "svgo";

import {IFigmaIconType} from "./entities/icons.js";

function createEnumTypescript(buildVersion: string, nameExportType: string, names: string[]): string {
  const data: string[] = [
    '/**\n',
    ' * DO NOT EDIT!\n',
    ' * THIS IS AUTOMATICALLY GENERATED FILE\n',
    ' */\n',
    '/* eslint-disable */\n\n',
    `export const SVG_BUILD_VERSION = "${buildVersion}"\n\n`,
    `export type ${nameExportType} = `,
    names.map((name) => `'${name}'`).join('\n  | '),
    ';\n',
    `\n\nexport type ${nameExportType}OrString  = ${nameExportType} | string;`,
    `\n\nexport type ${nameExportType}OrNever  = ${nameExportType} | never;`,
    '\n'
  ];

  return data.join('');
}


/**
 * Creates a PHP enum file with provided parameters.
 *
 * @param {string} buildVersion - The build version of the enum.
 * @param {string} nameExportType - The name of the exported enum type.
 * @param {string[]} names - An array of enum names.
 * @param {string} phpNamespace - The PHP namespace to use.
 * @param {string} phpUse - The PHP "use" statement to include.
 * @return {string} - The generated PHP enum code.
 */
// eslint-disable-next-line max-params
function createEnumPHP(
  buildVersion: string,
  nameExportType: string,
  names: string[],
  phpNamespace: string,
  phpUse: string
): string {
  let phpUseName: string;
  if (phpUse) {
    phpUseName = phpUse.split(/\\/).pop();
  }

  const data: string[] = [
    '<?php\n',
    '/**\n',
    ' * DO NOT EDIT!\n',
    ' * THIS IS AUTOMATICALLY GENERATED FILE\n',
    ' */\n',
    '// phpcs:disable\n',
    phpNamespace ? `namespace ${phpNamespace};\n\n` : '\n',
    phpUse ? `use ${phpUse};\n\n` : '\n',
    `const SVG_BUILD_VERSION = "${buildVersion}";\n\n`,
    `enum ${nameExportType}: string\n{\n`,
    phpUseName ? `    use ${phpUseName};\n\n` : '',
  ];

  const caseNames = names.map((name) => {
    const words = name.split(/[._-]/);

    const camelCaseName = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    return `    case ${camelCaseName.join('')} = '${name}';`;
  });

  data.push(
    caseNames.join('\n'),
    '\n',
    '\n    public static function version(): string\n',
    '    {\n',
    '        return SVG_BUILD_VERSION;\n',
    '    }',
    '\n}\n'
  )
  // data.push(caseNames.join('\n'), '\n}\n')

  return data.join('');
}

export async function createSvgTypes({buildVersion, nameExportType, names, pathFileType, phpNamespace, phpUse}: {buildVersion: string, nameExportType: string, names: string[], pathFileType: string, phpNamespace: string, phpUse: string}) {
  const PlatformPath = path.parse(pathFileType);

  if (!fs.existsSync(PlatformPath.dir)) {
    await fs.promises.mkdir(PlatformPath.dir, {recursive: true})
  }

  const stat = await fs.promises.stat(PlatformPath.dir);
  if (stat.isFile()) {
    throw new Error(`is not a folder: [${PlatformPath.dir}]`);
  }

  if (!stat.isDirectory()) {
    await fs.promises.mkdir(PlatformPath.dir, {recursive: true});
  }

  let data: string = '';
  switch (PlatformPath.ext) {
    case '.ts':
      data = createEnumTypescript(buildVersion, nameExportType, names);
      break;
    case '.php':
      data = createEnumPHP(buildVersion, nameExportType, names, phpNamespace, phpUse);
      break;
  }

  return fs.promises.writeFile(pathFileType, data, {encoding: 'utf8', flag: 'w'});
}


async function readSvgDesignSystemIcon(typeIcon: IFigmaIconType) {
  const svg = await fs.promises.readFile(typeIcon.path, 'utf8');

  const result = optimize(svg, {
    path: path.resolve(typeIcon.path),
    // multipass: true,
    // js2svg: {
    //   indent: 2,
    //   pretty: true,
    //   eol: 'lf',
    // },
    plugins: [
      {name: 'removeEmptyAttrs'},
      {name: 'removeDoctype'},
      {
        name: 'removeAttrs', params: {
          attrs: ['style', 'fill-rule2'],
        },
      },
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
            convertColors: {
              currentColor: true,
              names2hex: true,
              rgb2hex: true,
              shorthex: true,
              shortname: false,
            },
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            minifyStyles: false,
            removeUselessDefs: false,
            // removeDoctype: true,
            removeViewBox: false,
          },
        },
      },
    ],
  });

  const allMatches = result.data.match(/<svg\b[^>]*\s*(viewBox="(\b[^"]*)").*?>([\S\s]*?)<\/svg>/);

  if (!allMatches) {
    throw new Error(`svg matches (${typeIcon.path})`);
  }

  let svgNormalize: string;
  try {
    svgNormalize = allMatches[3].replaceAll(/\s{2,}/g, ' ')
      // svgNormalize = allMatches[3].replace(/fill=".{3,7}"/g, '')
      .trim();
  } catch (reason) {
    throw reason;
  }

  return [typeIcon.typeName, `<symbol id='${typeIcon.typeName}' viewBox='${allMatches[2]}' fill='none' xmlns='http://www.w3.org/2000/svg'>${svgNormalize}</symbol>`];
}

export async function createSvgSprite({pathFileSprite, typeIcons}: {pathFileSprite: string, typeIcons: IFigmaIconType[]}) {

  const promiseSymbols = typeIcons.map((item => readSvgDesignSystemIcon(item)))

  const svgSymbols = await Promise.all(promiseSymbols);

  const PlatformPath = path.parse(pathFileSprite);
  if (!fs.existsSync(PlatformPath.dir)) {
    await fs.promises.mkdir(PlatformPath.dir, {recursive: true})
  }

  return saveSvgSprite({
    contentSymbol: svgSymbols.filter(Boolean).sort((a, b) => {
      if (a[0] < b[0])
        return -1;
      if (a[0] > b[0])
        return 1;
      return 0;  // No sorting
    }).map(v => v[1]),
    pathSprite: pathFileSprite
  });
}

/**
 * Saves an SVG sprite file with specified symbols.
 *
 * @param {Object} args - The arguments for saving the SVG sprite.
 * @param {string[]} args.contentSymbol - The array of SVG symbol strings to be included in the sprite.
 * @param {string} args.pathSprite - The path where the SVG sprite should be saved.
 * @return {Promise<string>} - A promise that resolves with the path of the saved SVG sprite file.
 */
export async function saveSvgSprite({contentSymbol, pathSprite}: {contentSymbol: string[], pathSprite: string}): Promise<string> {
  const template = path.resolve(pathSprite);

  const dirSprite = path.dirname(template)

  if (!fs.existsSync(dirSprite)) {
    await fs.promises.mkdir(dirSprite, {recursive: true})
  }

  const newContent = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
    '\t' + contentSymbol.join('\n\t'),
    '</svg>',
  ].join('\n');

  await fs.promises.writeFile(template, newContent, 'utf8');

  return template
}
