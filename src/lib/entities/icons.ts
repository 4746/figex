import {IFigmaDefaultConfProject} from "./conf.js";

export interface IFigmaIcon {
  frameName: string;
  id: string;
  name: string;
  project: IFigmaDefaultConfProject;
  src: string;
}
export interface IFigmaIconType {
  filename: string;
  name: string;
  path: string;
  size: string;
  typeName: string;
}
