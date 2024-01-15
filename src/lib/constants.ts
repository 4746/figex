import {IFigmaDefaultConf} from "./entities/conf.js";

export const CONFIG_FILE_NAME = '.figex.config.json';

export const FIGMA_API_BASE = 'https://api.figma.com/v1'

export const DEFAULT_CONF: IFigmaDefaultConf = {
  designSystem: {
    projects: {
      SetYourFrameName: {
        path: 'src/assets/svg/{setYourFrameName}',
        prefix: 'YourPrefix',
      }
    }
  },
  fileId: null,
  nameExportType: null,
  page: 'icons',
  pathFileSprite: null,
  pathFileType: null,
  personalToken: null,
  phpNamespace: null,
  phpUse: null,
  removeFromName: 'Icon='
}
