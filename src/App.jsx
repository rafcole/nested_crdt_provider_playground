import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";


import { mockJsonToYDoc, mockCellsToYDoc } from "./mocking/mockDataToYDoc";


console.log("test nodemon change");

// to test mockCellsToYDoc
const doc = mockCellsToYDoc(
  { id: "cellIdA", content: "console.log('hello i am cell A');", type: "code" },
  { id: "cellIdB", content: "console.log('hello i am cell B');", type: "code" },
  { id: "cellIdC", content: "console.log('meow (cell 3)');", type: "code" }
);

// to testMockJsonToYDoc
// const doc = mockJsonToYDoc(JSON.stringify({
//   "notebook": {
//     "rawCellData": {
//       "cellIdA": {
//         "id": "cellIdA",
//         "content": "console.log('hello i am cell A dude');",
//         "type": "code"
//       },
//       "cellIdB": {
//         "id": "cellIdB",
//         "content": "console.log('hello i am cell B dude');",
//         "type": "code"
//       },
//       "cellIdC": {
//         "id": "cellIdC",
//         "content": "console.log('meow (cell 3 dude)');",
//         "type": "code"
//       }
//     },
//     "cellOrderArr": [
//       "cellIdA",
//       "cellIdB",
//       "cellIdC"
//     ]
//   }
// }));

const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  import.meta.env.VITE_ROTATING_ROOM || "test-room4",
  doc
);

function App() {
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

      const type = document
        .get("notebook")
        .get("rawCellData")
        .get(cellId)
        .get("content");

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