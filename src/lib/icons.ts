import chalk from "chalk";
// eslint-disable-next-line import/no-named-as-default
import got from "got";
import path from "node:path";

import {FIGMA_API_BASE} from "./constants.js";
import {downloadImage} from "./download-image.js";
import {IFigmaImageFileResponse} from "./entities/figma.js";
import {IFigmaIcon} from "./entities/icons.js";

const chunkArray = <T>(array: T[], chunkSize: number):  T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

export async function downloadListIcons({fileId, icons, personalToken}: {fileId: string, icons: IFigmaIcon[], personalToken: string}) {
  const chunks = chunkArray(icons, 300);

  const allResponses = await Promise.all(chunks.map(async (chunk) => got.get(`images/${fileId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Figma-Token': personalToken
      },
      prefixUrl: FIGMA_API_BASE,
      searchParams: {
        format: 'svg',
        ids: chunk.map(icon => icon.id).join(',')
      }
    }).json<IFigmaImageFileResponse>()));

  // Combination of results
  const images = allResponses.flatMap<Record<string, string>>(response => response?.images)
    .reduce((acc, record) => {
      // eslint-disable-next-line unicorn/no-array-for-each
      Object.entries(record).forEach(([key, value]) => {
        // Add a value to an existing key or create a new one
        acc[key] = acc[key] ? `${acc[key]},${value}` : value;
      });

      return acc;
    }, {} as Record<string, string>)

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
