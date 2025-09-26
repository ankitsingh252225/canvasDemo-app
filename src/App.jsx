import React from "react";
// import CanvasEditor from "./components/CanvasEditor";
import ImageGenerator from "./components/CanvasEditor.jsx";
import BgRemover from "./components/localBgRemoval.jsx"
import "./styles.css";

export default function App() {
  return (
    <div>
      <h1>🖼️ Canvas POC Project</h1>
      <ImageGenerator />
    </div>
  );
}