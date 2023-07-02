import { useEffect, useState } from "react";
import * as Y from "yjs";

import { mockDoc } from "../notebookMockGenerator";

export const doc = mockDoc;
export const yNotebook = doc.get("notebook");
const cellIdArr = yNotebook.get("cellOrderArr").toArray(); // mock data

export function useMockNotebookEffects() {
  const [cellIdList, setCellIdList] = useState([]);
  useEffect(() => {
    setCellIdList(() => cellIdArr);
  }, []);

  useEffect(() => {
    // cellIdArr.forEach((cellId) => {
    //   yNotebook.set(cellId, new Y.Text('useEffect default value'));
    // });
    console.log(yNotebook.toJSON())
  }, []);

  return [cellIdList, setCellIdList]
}

