import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useReactive } from "@reactivedata/react";
import { ws } from "ws";
import { mockJsonToYDoc } from "./mocking/mockDataToYDoc";

import { yPrettyPrint } from "./notebookMockGenerator";
import { v4 } from "uuid";

const doc = new Y.Doc();


doc.getMap('cells').set('cell1', new Y.Text());
doc.getMap('cells').set('cell2', new Y.Text());
doc.getMap('cells').set('cell3', new Y.Text());

const provider = new WebsocketProvider(
  import.meta.env.VITE_WEBSOCKET_SERVER,
  "levelup",
  doc,
  { WebSocketPolyfill: ws }
);

function App() {
  const [notebookYMap, setNotebookYMap] = useState({});
  const [rawCellDataYMap, setRawCellYMap] = useState({});
  const [cellOrderArr, setCellOrderArr] = useState([]);
   // [cellId, cellData
  const editorRef = useRef(null);
  const cellMapRef = useRef(null);
  const [cells, setCells] = useState([])
  const [cellMap, setCellMap] = useState({})

  useEffect(() => {
    provider.on('sync', isSynced => {
      const _nb = doc.getMap('notebook')
      setNotebookYMap(_nb)

      const _rcd = _nb.get('rawCellData')
      setRawCellYMap(_rcd)

      const _coa = _nb.get('cellOrderArr')
      setCellOrderArr(_coa.toArray())

      _coa.observe(e => {
        setCellOrderArr(_coa.toArray())
      })
    })
  }, [])

  function handleEditorDidMount(editor, monaco, cellId) {
    editorRef.current = editor;
    
    const content = rawCellDataYMap.get(cellId).get('content')

    console.log('content => ', content)
    console.log(content.toJSON())

    const binding = new MonacoBinding(content, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    console.log(provider.awareness);                
  }

  function handlePushCell () {
    const id = v4()
    const newCell = new Y.Map()
    newCell.set('content', new Y.Text('added via button'))
    newCell.set('type', 'code')
    newCell.set('id', id)

    rawCellDataYMap.set(id, newCell)
    notebookYMap.get('cellOrderArr').push([id]) 
  }
  return (
    <div>
      <h3>multiMonacoSimple</h3>
      {cellOrderArr.map((cellId, index) => {
        console.log(cellId)
        return (
          <div key={cellId}>
          <Editor
            key={cellId}
            height="35vh"
            width="60vw"
            theme="vs-dark"
            onMount={(_editor, _monaco)=> handleEditorDidMount(_editor, _monaco, cellId, index)}
          />
          </div>
        );
      })}
      <button onClick={handlePushCell}>Add Code Cell</button>
    </div>
  );
}

export default App;
