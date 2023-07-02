import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";
import { yPrettyPrint } from "./yNotebook";


const doc = new Y.Doc();
const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  import.meta.env.VITE_ROTATING_ROOM || "test-room4",
  doc
);


const yNotebookYMap = doc.getMap("notebook");


// cells in order of display
// keeping this broken out from the cell data allows us to track
// updates only on the order without changes getting triggered because
// of text updates
const cellIdArr = ["cellId1", "cellId2", "cellId3"];

const mockCellsDummyData = {
  cellId1: {id: "cellId1", content: "I am cell 1", type: "code"}, 
  cellId2: {id: "cellId2", content: "I am cell 2", type: "code"}, 
  cellId3: {id: "cellId3", content: "I am cell 3", type: "code"}
}

const cellDataYMap = new Y.Map();
yNotebookYMap.set("rawCellData", cellDataYMap);

for (const [key, value] of Object.entries(mockCellsDummyData)) {
  cellDataYMap.set(key, value);
}

console.log("raw data put in", JSON.stringify(doc.toJSON()))

const cellOrderArrYArray = new Y.Array();
yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);

for (const cellId of Object.keys(mockCellsDummyData)) {
  cellOrderArrYArray.push([cellId]);
}

yPrettyPrint(doc, 'ordering of cells inserted')


function App() {
  // nested
  const [cellIdList] = useReactive([]);


  useEffect(() => {
    // needs async?
    // setCellIdList(() => cellIdArr);


    // cannot read properties of undefined when loading
    // fresh room with chrome
    // chrome eventually works
    // firefox doesnt
    cellIdList.forEach((cellId) => {
      yNotebook.set(cellId, new Y.Text('useEffect default value'));
    });

    console.log(yNotebook.toJSON())
  }, []);

  const editorRef = useRef(null);

  function createEditorDidMountHandler(cellId) {
    return (editor, monaco) => {
      editorRef.current = editor;

      const type = doc.get("notebook").get(cellId);

      const binding = new MonacoBinding(
        type,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );
      console.log(provider.awareness);
    };
  }

  return (
    <div>
      {cellIdList.map((cellId) => {
        return (
          <Editor
            key={cellId}
            defaultValue={`Hello my cell id is ${cellId}`}
            height="35vh"
            width="100vw"
            theme="vs-dark"
            onMount={createEditorDidMountHandler(cellId)}
          />
        );
      })}
    </div>
  );
}

export default App;