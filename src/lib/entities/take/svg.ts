import {IFigmaIcon, IFigmaIconType} from "../icons.js";

export interface TakeSvgCtxTask {
  fileId: string;
  icons: IFigmaIcon[];
  pathSvgSprite: string;
  typeIcons: IFigmaIconType[];
}
