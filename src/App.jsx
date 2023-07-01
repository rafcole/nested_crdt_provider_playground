import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";
import 'dotenv/config'

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  process.env.ROOM_NAME || "test-room4",
  doc
);

const yNotebook = doc.getMap("notebook");
const cellIdArr = ["monacoA", "monacoB"]; // mock data

function App() {
  const [cellIdList, setCellIdList] = useState([]);

  useEffect(() => {
    // needs async?
    setCellIdList((_) => cellIdArr);

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