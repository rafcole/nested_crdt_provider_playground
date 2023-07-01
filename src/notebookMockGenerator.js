import * as Y from "yjs";

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockDoc = new Y.Doc();

const yNotebookYMap = mockDoc.getMap("notebook");

const cellIdArr = ["cellId1", "cellId2", "cellId3"];

const mockCellsDummyData = {
  cellId1: { id: "cellId1", content: "I am cell 1", type: "code" },
  cellId2: { id: "cellId2", content: "I am cell 2", type: "code" },
  cellId3: { id: "cellId3", content: "I am cell 3", type: "code" }
};

const cellDataYMap = new Y.Map();
yNotebookYMap.set("rawCellData", cellDataYMap);

for (const [key, value] of Object.entries(mockCellsDummyData)) {
  cellDataYMap.set(key, value);
}

console.log("raw data put in", JSON.stringify(mockDoc.toJSON()));

const cellOrderArrYArray = new Y.Array();
yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);

for (const cellId of Object.keys(mockCellsDummyData)) {
  cellOrderArrYArray.push([cellId]);
}

yPrettyPrint(mockDoc, "ordering of cells inserted");

export { mockDoc, yPrettyPrint };
