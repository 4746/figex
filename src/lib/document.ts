import chalk from "chalk";
// eslint-disable-next-line import/no-named-as-default
import got from "got";
import fs from "node:fs";
import path from "node:path";

import {FIGMA_API_BASE} from "./constants.js";
import {IFigmaDefaultConfDesignSystem, IFigmaDefaultConfProject, TFigmaFrameName} from "./entities/conf.js";
import {IFigmaDocumentChildren} from "./entities/document.js";
import {IFigmaFileResponse} from "./entities/figma.js";
import {IFigmaIcon} from "./entities/icons.js";

/**
 * Clears the specified design system project directory by removing its contents and recreating it.
 *
 * @param {string} projectPath - The file system path to the design system project directory to be cleared.
 * @return {Promise<void>} A promise that resolves when the directory has been successfully cleared and recreated.
 */
export async function clearDesignSystemProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    await fs.promises.rm(projectPath, { maxRetries: 10, recursive: true });
  }

  return fs.promises.mkdir(projectPath, {recursive: true});
}

/**
 * Clears the design system configuration for the provided project list.
 *
 * @param {IFigmaDefaultConfProject[]} projects - An array of project objects, each containing information necessary for clearing the design system configuration.
 * @return {Promise<Array>} A promise that resolves to an array of results from each cleared design system project operation.
 */
export async function clearDesignSystem(projects: IFigmaDefaultConfProject[]) {
  return projects.map((item) => clearDesignSystemProject(path.join(process.cwd(), item.path)))
}

function getDocumentProject({frame, node, project}: {frame: TFigmaFrameName, node: IFigmaDocumentChildren, project: IFigmaDefaultConfProject}) {
  const frameNameArr = frame.split('/').filter(Boolean);
  const frameName = frameNameArr.pop();
  const frameRoot = getPathToFrame(node, frameNameArr);

  if (!frameRoot.children.some((c) => c.name === frameName)) {
    throw new Error(chalk.red(`Can't find (${frameName}) Frame on this page, check your settings`));
  }

  const iconsArray = frameRoot.children.find(c => c.name === frameName).children;

  const icons = iconsArray.map<IFigmaIcon>((icon) => ({
    frameName,
    id: icon.id,
    name: icon.name,
    project,
    src: null
  }));

  return findDuplicates('name', icons);
}

/**
 * @inheritDoc https://www.figma.com/developers/api#get-files-endpoint
 */
export async function getDocument({designSystem, fileId, page, personalToken}: {designSystem: IFigmaDefaultConfDesignSystem, fileId: string, page: string, personalToken: string}) {
  const response = await got.get(`files/${fileId}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Figma-Token': personalToken
    },
    prefixUrl: FIGMA_API_BASE,
  }).json<IFigmaFileResponse>();

  if (!response) {
    throw new Error(chalk.red(`Download file: ${fileId}`));
  }

  const pageDocument = response.document.children.find((c) => c.name === page);

  if (!pageDocument) {
    throw new Error(chalk.red(`Page cannot be found '${page}', check the settings`));
  }

  await clearDesignSystem(Object.values(designSystem.projects)).catch((reason) => {
    throw reason;
  })

  let icons = [];
  return Object.keys(designSystem.projects).reduce((acc:  IFigmaIcon[], franeName: TFigmaFrameName) => {
    icons = getDocumentProject({
      frame: franeName,
      node: pageDocument,
      project: designSystem.projects[franeName]
    })
    return [...acc, ...icons];
  }, []);
}

function getPathToFrame(root: IFigmaDocumentChildren, current: string[]): IFigmaDocumentChildren {
  if (current.length === 0) {
    return root;
  }

  const pathFrame = [...current];
  const name = pathFrame.shift();
  const foundChild = root.children.find((c) => c.name === name);

  if (!foundChild) {
    return root;
  }

  return getPathToFrame(foundChild, pathFrame);
}

/**
 * Identifies duplicate objects within an array based on the specified property name and renames the duplicates to make them unique.
 *
 * @param {string} propertyName - The name of the property to check for duplicates.
 * @param {IFigmaIcon[]} arr - The array of objects to be evaluated for duplicates.
 * @return {IFigmaIcon[]} - Returns a new array with updated objects, ensuring no duplicate values exist for the given property name.
 */
function findDuplicates(propertyName: string, arr: IFigmaIcon[]): IFigmaIcon[] {
  let IDX = 1;
  return arr.reduce((acc, current) => {
    const x = acc.find(item => item[propertyName] === current[propertyName]);
    if (x) {
      console.log(chalk.bgRed.bold(`Duplicate icon name: ${x[propertyName]}. Fix the figma file`));

      current[propertyName] = `${current[propertyName]}-duplicate-name${IDX}`;
      IDX++
    }

    return [...acc, current];
  }, []);
}
