import * as Y from "yjs";

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockJsonData = JSON.stringify({
  "notebook": {
    "rawCellData": {
      "cellIdA": {
        "id": "cellIdA",
        "content": "console.log('hello i am cell A');",
        "type": "code"
      },
      "cellIdB": {
        "id": "cellIdB",
        "content": "console.log('hello i am cell B');",
        "type": "code"
      },
      "cellIdC": {
        "id": "cellIdC",
        "content": "console.log('meow (cell 3)');",
        "type": "code"
      }
    },
    "cellOrderArr": [
      "cellIdA",
      "cellIdB",
      "cellIdC"
    ]
  }
});

const mockCellsDummyData = [
  { id: "cellId1", content: "console.log('cell 1');", type: "code" },
  { id: "cellId2", content: "console.log('cell 2');", type: "code" },
  { id: "cellId3", content: "console.log('cell 3');", type: "code" }
]

export const mockCellsToYDoc = (cells) => {
  if (!cells) cells = mockCellsDummyData;

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

export const mockJsonToYDoc = (json) => {
  if (!json) json = mockJsonData;
  json = JSON.parse(json);

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebook");
  const cellDataYMap = new Y.Map();
  yNotebookYMap.set("rawCellData", cellDataYMap);

  for (let entry of Object.entries(json.notebook.rawCellData)) {
    const cellBodyYMap = new Y.Map();
    const contentYText = new Y.Text(entry[1].content);
    cellBodyYMap.set("id", entry[1].id);
    cellBodyYMap.set("content", contentYText);
    cellBodyYMap.set("type", entry[1].type);
    cellDataYMap.set(entry[0], cellBodyYMap);
  }

  console.log("rawCellData populated", JSON.stringify(mockDoc.toJSON()));

  const cellOrderArrYArray = new Y.Array();
  yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);


  cellOrderArrYArray.insert(0, json.notebook.cellOrderArr);

  yPrettyPrint(mockDoc, "last print of nbmg");

  return mockDoc;
};