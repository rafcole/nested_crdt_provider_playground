import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";

// Choose 1 of the following 2 lines to use mock data

// import { useMockCellIDListEffects, doc } from "./mocking/useMockCellIDListEffects";

// import { useMockNotebookEffects, doc } from "./mocking/useMockNotebookEffects";

import { mockCellsToYDoc } from "./mocking/mockCellArrToYDoc";

// end note

console.log("test nodemon change");

const doc = mockCellsToYDoc(
  { id: "cellIdA", content: "console.log('hello i am cell A');", type: "code" },
  { id: "cellIdB", content: "console.log('hello i am cell B');", type: "code" },
  { id: "cellIdC", content: "console.log('meow (cell 3)');", type: "code" }
);

const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  import.meta.env.VITE_ROTATING_ROOM || "test-room4",
  doc
);

function App() {
  // pick one of the following 2 lines to use mock data
  // const [cellIdList, setCellIdList] = useMockNotebookEffects();
  // const [cellIdList, setCellIdList] = useMockCellIDListEffects();

  const [cellIdList, setCellIdList] = useState([]);
  const [document, setDocument] = useState(null);

  const loadDoc = () => {
    setDocument(doc);
    setCellIdList(() => doc.get("notebook").get("cellOrderArr").toArray());
  };

  useEffect(() => {
    loadDoc();
  }, []);

  const editorRef = useRef(null);

  function createEditorDidMountHandler(cellId) {
    return (editor, monaco) => {
      editorRef.current = editor;

      // pick one of the following 2 lines to use mock data
      const type = document
        .get("notebook")
        .get("rawCellData")
        .get(cellId)
        .get("content");
      // const type = doc.get("notebook").get(cellId);

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
      <h3>multiMonacoSimple</h3>
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
