export interface IFigmaDocumentChildren {
  backgroundColor: {
    a: number;
    b: number;
    g: number;
    r: number;
  }
  children: IFigmaDocumentChildren[];
  flowStartingPoints: unknown[],
  id: string,
  name: string,
  prototypeDevice: {
    rotation: string;
    type: string;
  },
  prototypeStartNodeID: unknown,
  scrollBehavior: string,
  type: string,
}

export interface IFigmaDocument {
  children: IFigmaDocumentChildren[];
  id: string,
  name: string,
  scrollBehavior: string,
  type: string,
}
