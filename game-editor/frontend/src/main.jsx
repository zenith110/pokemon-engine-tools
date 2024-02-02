import React from "react"
import { createRoot } from "react-dom/client"
import { HashRouter, Routes, Route } from "react-router-dom";

import "./style.css"
import App from "./App"
import TrainerEditor from "./trainer-editor/main";
import MapEditor from "./map-editor/main";

const container = document.getElementById("root")

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <HashRouter>
        <Routes>
            <Route path="/" element={<App />} exact />
            <Route path="/trainer-editor" element={<TrainerEditor />} />
            <Route path="/map-editor" element={<MapEditor />} />
        </Routes>
        </HashRouter>
    </React.StrictMode>
)
