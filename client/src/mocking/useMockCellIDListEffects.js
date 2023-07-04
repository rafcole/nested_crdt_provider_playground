import { useEffect, useState } from "react";
import * as Y from "yjs";

export const doc = new Y.Doc();
export const yNotebook = doc.getMap("notebook");
const cellIdArr = ["monacoA", "monacoB"]; // mock data

export function useMockCellIDListEffects() {
  const [cellIdList, setCellIdList] = useState([]);
  useEffect(() => {
     setCellIdList(() => cellIdArr);
   }, []);
  
   useEffect(() => {
     cellIdArr.forEach((cellId) => {
       yNotebook.set(cellId, new Y.Text('useEffect default value'));
     });
     console.log(yNotebook.toJSON())
   }, []);

   return [ cellIdList, doc ]
}

