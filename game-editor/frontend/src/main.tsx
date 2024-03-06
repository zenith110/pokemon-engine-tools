import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import "./style.css";
import App from "./App";
import TrainerEditor from "./trainer-editor/main";
import MapEditor from "./map-editor/main";
import PokemonEditor from "./pokemon-editor/main";
import Navbar from "./navbar/navbar";
import NewMap from "./map-editor/New-Map"
import NewTrainerCard from "./trainer-editor/functionality/newtrainers/NewTrainerCard";
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <HashRouter>
            <Navbar /> 
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/trainer-editor" element={<TrainerEditor />} />
                <Route path="/map-editor" element={<MapEditor />} />
                <Route path="/map-editor/new-map" element={<NewMap />} />
                <Route path="/pokemon-editor" element={<PokemonEditor/>} />
                <Route path="/trainer-editor/new-trainer" element={<NewTrainerCard/>}/>
            </Routes>
        </HashRouter>
    </React.StrictMode>
)