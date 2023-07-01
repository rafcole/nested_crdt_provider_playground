import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { MonacoBinding } from "y-monaco"
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'test', doc);
const yNotebook = doc.getMap('notebook');
const cellIdArr = ['monacoA', 'monacoB']

cellIdArr.forEach((cellId) => {
  yNotebook.set(cellId, new Y.Text());
})
// yNotebook.set('monacoA', new Y.Text());
// yNotebook.set('monacoB', new Y.Text());

function App() {
  const editorRef = useRef(null);

  function handleEditorDidMounta(editor, monaco) {
    editor = editor;
 
    const type = doc.get('notebook').get("monacoA"); 

    const binding = new MonacoBinding(type, editor.getModel(),new Set([editor]), provider.awareness)
    console.log(provider.awareness);                
  }
  function handleEditorDidMountB(editor, monaco) {
    editor = editor;

    const type = doc.get('notebook').get("monacoB");

    const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), provider.awareness)
    console.log(provider.awareness);                
  }
    function handleEditorDidMountArray(editor, monaco, cellId) {
    editor = editor;
 
    const type = doc.get('notebook').get(cellId); 

    const binding = new MonacoBinding(type, editor.getModel(),new Set([editor]), provider.awareness)
    console.log(provider.awareness);                
  }
  
  return (
    <div> 
      {cellIdArr.map((cellId) => {
        return (
          <div>
          <Editor
            key={cellId}
            defaultValue={`Hello my cell id is ${cellId}`}
            height="35vh"
            width="100vw"
            theme="vs-dark"
            onMount={(editor, monaco)=> handleEditorDidMountArray(editor, monaco, cellId)}
          />
          </div>
        )
      }  )} 
       {/* <Editor
      defaultValue='Editor A default value from editor component'
      height="35vh"
      width="100vw"
      theme="vs-dark"
      onMount={handleEditorDidMountA}
    />
      <Editor
      defaultValue='Editor B default value from editor component'
      height="35vh"
      width="100vw"
      theme="vs-dark"
      onMount={handleEditorDidMountB}
    /> */}
    </div>

  )
}

export default App
