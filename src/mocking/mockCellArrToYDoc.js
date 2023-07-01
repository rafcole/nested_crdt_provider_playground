import * as Y from "yjs";

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockCellsDummyData = [
  { id: "cellId1", content: "console.log('cell 1');", type: "code" },
  { id: "cellId2", content: "console.log('cell 2');", type: "code" },
  { id: "cellId3", content: "console.log('cell 3');", type: "code" }
]

export const mockCellsToYDoc = (...cells) => {
  if (cells.length === 0) cells = mockCellsDummyData;

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebook");
  const cellDataYMap = new Y.Map();
  yNotebookYMap.set("rawCellData", cellDataYMap);

  for (let cell of cells) {
    const cellBodyYMap = new Y.Map();
    const contentYText = new Y.Text(cell.content);
    cellBodyYMap.set("id", cell.id);
    cellBodyYMap.set("content", contentYText);
    cellBodyYMap.set("type", cell.type);
    cellDataYMap.set(cell.id, cellBodyYMap);
  }

  console.log("rawCellData populated", JSON.stringify(mockDoc.toJSON()));

  const cellOrderArrYArray = new Y.Array();
  yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);
  
  const cellIdArr = cells.map(cell => cell.id);
  cellOrderArrYArray.insert(0, cellIdArr);

  yPrettyPrint(mockDoc, "last print of nbmg");

  return mockDoc;
};