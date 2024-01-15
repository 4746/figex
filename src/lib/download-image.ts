// eslint-disable-next-line import/no-named-as-default
import got from "got";
import fs from "node:fs";
import path from "node:path";
import {pipeline} from "node:stream/promises";

import {IFigmaIcon, IFigmaIconType} from "./entities/icons.js";


export async function downloadImage({name, pathIcon, personalToken, project, url}: IFigmaIcon & {pathIcon: string, personalToken: string, url: string}): Promise<IFigmaIconType> {
  if (!url) {
    throw new Error('Not fount url');
  }

  const imagePath = path.resolve(pathIcon, `${name}.svg`);

  await pipeline(
    got.stream(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Figma-Token': personalToken
      },
      isStream: true,
      resolveBodyOnly: true,
      responseType: 'text',
      throwHttpErrors: false,
    }),
    fs.createWriteStream(imagePath, { flags: "w" }),
  );

  const stats = fs.statSync(imagePath);

  if (!stats) {
    throw new Error(`Error writing file: ${imagePath}`);
  }

  return {
    filename: `${name}.svg`,
    name,
    path: imagePath,
    size: (stats.size / 1024).toFixed(2) + ' KiB',
    typeName: [project.prefix, name].join('.')
  };
}
