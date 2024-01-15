import {IFigmaDocumentComponent} from "./component.js";
import {IFigmaDocumentComponentSet} from "./component-set.js";
import {IFigmaDocument} from "./document.js";
import {IFigmaDocumentStyle} from "./style.js";

export interface IFigmaImageFileResponse {
  images: Record<string, string>
}
export interface IFigmaFileResponse {
  componentSets: Record<string, IFigmaDocumentComponentSet>;
  components: Record<string, IFigmaDocumentComponent>;
  document: IFigmaDocument;
  editorType: string;
  lastModified: string;
  linkAccess: string;
  name: string;
  role: string;
  schemaVersion: number;
  styles: Record<string, IFigmaDocumentStyle>;
  thumbnailUrl: string;
  version: string;
}
