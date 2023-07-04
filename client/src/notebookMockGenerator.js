import * as Y from "yjs";

const OBSERVE_CELL_ORDER_ARR = true;
const OBSERVE_NOTEBOOK_YMAP = false;
const OBSERVE_CELL_DATA_YMAP = true;
const OBSERVE_CELL_CONTENT_YTEXT = true;

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

// ==> mockDoc:
// {
//     "notebook": {
//         "rawCellData": {},
//         "cellOrderArr": []
//     }
// }

const mockDoc = new Y.Doc();
const yNotebookYMap = mockDoc.getMap("notebook");

const cellDataYMap = new Y.Map();
yNotebookYMap.set("rawCellData", cellDataYMap);

const cellOrderArrYArray = new Y.Array();
yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);

// yPrettyPrint(mockDoc, "mockDoc");

/////////////////// event handlers for updates ///////////////////////

mockDoc.on("update", update => {
  // Y.logUpdate(update); // big object with change details
  // console.log("update", update); // array of bytes
});

/////////////////// top level notebook data ///////////////////////
// create a hash map for our data

if (OBSERVE_NOTEBOOK_YMAP) {
  yNotebookYMap.observeDeep(event => {
    console.log("\n\nEvent fired on notebook ymap: ");
    console.log("==> event path: ", event.path);
    console.log("==> event target: ", event.target);
    console.log("==> event type: ", event.currentTarget);
    // console.log("notebook ymap event", event);
  });
}

if (OBSERVE_CELL_ORDER_ARR) {
  cellOrderArrYArray.observe(yarrayEvent => {
    console.log(
      "\n\nEvent detected on cellOrderArr - delta: ",
      yarrayEvent.changes.delta
    );
  });
}

if (OBSERVE_CELL_DATA_YMAP) {
  cellDataYMap.observe(event => {
    console.log(
      "\n\nEvent detected on cellDataYMap - delta: ",
      event.changes.delta
    );
  });
}

const setCellTextObserver = (contentYText, cellId) => {
  if (OBSERVE_CELL_CONTENT_YTEXT) {
    contentYText.observe(event => {
      console.log(
        `Change Detected on cell ${cellId}  - delta: `,
        event.changes.delta
      );
    });
  }
};
/////////////////// add and populate rawCellData ///////////////////////
// unordered and accessed by cellId key
// make load up a ymap

// nest the ymap in mockDoc

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

  if (OBSERVE_CELL_CONTENT_YTEXT) {
    setCellTextObserver(contentYText, id);
  }

  cellBodyYMap.set("id", id);
  cellBodyYMap.set("content", contentYText);
  cellBodyYMap.set("type", type);
  // add to cellDATA not cell body
  cellDataYMap.set(key, cellBodyYMap);
}

cellDataYMap.get("cellId1").get("content").insert(0, "hello world");

// yPrettyPrint(cellDataYMap, "cellDataYmap populated");

/////////////////// add and populate cellOrderArr ///////////////////////
// kept in display order

// create a yArray

// CANNOT DETECT PUSH EVENTS ON THE ARRAY

for (const cellId of Object.keys(mockCellsDummyData)) {
  cellOrderArrYArray.push([cellId]);
}

// console.log(mockDoc.get("notebook").get("rawCellData").get("cellId1").toJSON());

// yPrettyPrint(mockDoc, "last print of nbmg");

export { mockDoc, yPrettyPrint };
