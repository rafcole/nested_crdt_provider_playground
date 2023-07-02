import * as Y from "yjs";

const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const OBSERVE_CELL_ORDER_ARR = false;
const OBSERVE_NOTEBOOK_YMAP = false;
const OBSERVE_CELL_DATA_YMAP = false;
const OBSERVE_CELL_CONTENT_YTEXT = false;

const mockCellsDummyData = [
  { id: "cellId1", content: "console.log('cell 1');", type: "code" },
  { id: "cellId2", content: "console.log('cell 2');", type: "code" },
  { id: "cellId3", content: "console.log('cell 3');", type: "code" }
];

export const mockCellsToYDoc = (...cells) => {
  if (cells.length === 0) cells = mockCellsDummyData;

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebook");
  const cellDataYMap = new Y.Map();
  yNotebookYMap.set("rawCellData", cellDataYMap);

  for (let cell of cells) {
    const cellBodyYMap = new Y.Map();
    const contentYText = new Y.Text(cell.content);

    if (OBSERVE_CELL_CONTENT_YTEXT) {
      setCellTextObserver(contentYText, cell.id);
    }

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

const observers = {
  cellContentText(contentYText, id) {
    contentYText.observe(event => {
      console.log(
        `Change Detected on cell ${id}  - delta: `,
        event.changes.delta
      );
    });
  },

  cellDataArr(cellDataYMap) {
    cellDataYMap.observe(event => {
      console.log(
        "\n\nEvent detected on cellDataYMap - delta: ",
        event.changes.delta
      );
    });
  },

  cellOrderArr(cellOrderArrYArray) {
    cellOrderArrYArray.observe(yarrayEvent => {
      console.log(
        "\n\nEvent detected on cellOrderArr - delta: ",
        yarrayEvent.changes.delta
      );
    });
  },

  notebook(notebookYMap) {
    yNotebookYMap.observeDeep(event => {
      console.log("\n\nEvent fired on notebook ymap: ");
      console.log("==> event path: ", event.path);
      console.log("==> event target: ", event.target);
      console.log("==> event type: ", event.currentTarget);
      // console.log("notebook ymap event", event);
    });
  }
};
