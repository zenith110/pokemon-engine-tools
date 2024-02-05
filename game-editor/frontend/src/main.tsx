import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Routes, Route } from 'react-router-dom';

import "./style.css";
import App from "./App";
import TrainerEditor from "./trainer-editor/main";
import MapEditor from "./map-editor/main";
import PokemonEditor from "./pokemon-editor/main";
import Navbar from "./navbar/navbar";

ReactDOM.render(
    <React.StrictMode>
        <HashRouter>
            <Navbar /> 
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/trainer-editor" element={<TrainerEditor />} />
                <Route path="/map-editor" element={<MapEditor />} />
                <Route path="/pokemon-editor" element={<PokemonEditor/>} />
            </Routes>
        </HashRouter>
    </React.StrictMode>,
    document.getElementById("root") as HTMLElement
)