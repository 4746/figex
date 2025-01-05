export type TFigmaFrameName = string;
export interface IFigmaDefaultConfProject {
  path: string;
  prefix: string;
}
export interface IFigmaDefaultConfDesignSystem {
  projects: Record<TFigmaFrameName, IFigmaDefaultConfProject>
}

export interface IFigmaDefaultConf {
  designSystem: IFigmaDefaultConfDesignSystem,
  fileId: string,
  nameExportType?: string,
  page: string,
  pathFileSprite?: string;
  /**
   * The path to the typing file
   */
  pathFileType?: string;
  pathFileTypeTS?: string,
  pathFileTypePHP?: string,
  personalToken: string,
  /**
   * The PHP namespace represents the namespace of a PHP enum file.
   */
  phpNamespace: string,
  /**
   * Extend enum via use OtherEnums
   */
  phpUse: string,
  removeFromName: string,
}

