export type TFigmaFrameName = string;
export interface IFigmaDefaultConfProject {
  /**
   * the path to the folder where to store svg
   */
  path: string;
  prefix: string;
  /**
   * do not add this project to the base sprite file
   */
  skipSprite?: boolean;
}
export interface IFigmaDefaultConfDesignSystem {
  projects: Record<TFigmaFrameName, IFigmaDefaultConfProject>
}

export interface IFigmaDefaultConf {
  designSystem: IFigmaDefaultConfDesignSystem;
  fileId: string;
  nameExportType?: string;
  page: string;
  pathFileSprite?: string;
  /**
   * The path to the typing file
   */
  pathFileType?: string;
  pathFileTypePHP?: string;
  pathFileTypeTS?: string;
  personalToken: string;
  /**
   * The PHP namespace represents the namespace of a PHP enum file.
   */
  phpNamespace: string;
  /**
   * Extend enum via use OtherEnums
   */
  phpUse: string;
  prefixExportType?: string;
  removeFromName: string;
}

