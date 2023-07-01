import * as Y from "yjs";

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockDoc = new Y.Doc();

// create a hash map for our data
const yNotebookYMap = mockDoc.getMap("notebook");

/////////////////// add and populate rawCellData ///////////////////////
// unordered and accessed by cellId key
// make load up a ymap
const cellDataYMap = new Y.Map();

// nest the ymap in mockDoc
yNotebookYMap.set("rawCellData", cellDataYMap);

const mockCellsDummyData = {
  cellId1: { id: "cellId1", content: "I am cell 1", type: "code" },
  cellId2: { id: "cellId2", content: "I am cell 2", type: "code" },
  cellId3: { id: "cellId3", content: "I am cell 3", type: "code" }
};

// cell body maybe doesn't need to be a ymap idk
// only content needs to be a ytext
for (const [key, { id, content, type }] of Object.entries(mockCellsDummyData)) {
  const cellBodyYMap = new Y.Map();
  const contentYText = new Y.Text(content);
  cellBodyYMap.set("id", id);
  cellBodyYMap.set("content", contentYText);
  cellBodyYMap.set("type", type);
  // add to cellDATA not cell body
  cellDataYMap.set(key, cellBodyYMap);
}

console.log("rawCellData populated", JSON.stringify(mockDoc.toJSON()));

/////////////////// add and populate cellOrderArr ///////////////////////
// kept in display order

// create a yArray
const cellOrderArrYArray = new Y.Array();
yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);

for (const cellId of Object.keys(mockCellsDummyData)) {
  cellOrderArrYArray.push([cellId]);
}

console.log(mockDoc.get("notebook").get("rawCellData").get("cellId1").toJSON());

yPrettyPrint(mockDoc, "last print of nbmg");

export { mockDoc, yPrettyPrint };
