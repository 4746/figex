import chalk from "chalk";
// eslint-disable-next-line import/no-named-as-default
import got from "got";
import path from "node:path";

import {FIGMA_API_BASE} from "./constants.js";
import {downloadImage} from "./download-image.js";
import {IFigmaImageFileResponse} from "./entities/figma.js";
import {IFigmaIcon} from "./entities/icons.js";


export async function downloadListIcons({fileId, icons, personalToken}: {fileId: string, icons: IFigmaIcon[], personalToken: string}) {
  const iconIds = icons.map(icon => icon.id).join(',');

  const response = await got.get(`images/${fileId}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Figma-Token': personalToken
    },
    prefixUrl: FIGMA_API_BASE,
    searchParams: {
      format: 'svg',
      ids: iconIds
    }
  }).json<IFigmaImageFileResponse>();

  if (!response) {
    throw new Error(`Download list icons`);
  }

  const {images} = response

  return icons.map((icon) => {
    if (!icon.name || !(/^[\d_a-z-]+$/.test(icon.name))) {
      console.log(chalk.bgRed.bold(`Incorrect icon name: [${icon.name}]`));
    }

    icon.src = images[icon.id];

    return icon;
  });
}

export async function downloadAllIcons({icons, personalToken, removeFromName}: {icons: IFigmaIcon[], personalToken: string, removeFromName: string}) {
  const AllIcons = icons.map(
    icon => downloadImage({
      ...icon,
        name: icon.name.replace(removeFromName, ''),
        pathIcon: path.join(process.cwd(), icon.project.path),
        personalToken,
        url: icon.src
      })
  );

  return Promise.all(AllIcons)
}
