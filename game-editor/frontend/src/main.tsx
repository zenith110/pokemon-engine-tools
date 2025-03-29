import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import "./style.css";
import TrainerEditor from "./trainer-editor/main";
import PokemonEditor from "./pokemon-editor/main";
import Navbar from "./navbar/navbar";
import NewTrainerCard from "./trainer-editor/functionality/newtrainers/NewTrainerCard";
import Jukebox from "./jukebox/main";
import MoveEditor from "./move-editor/main";
import ScriptEditor from "./script-editor/main";
import Homepage from "./homepage/main"
import OverworldEditor from "./overworld-editor/main"
import NewOverworlds from "./overworld-editor/new-overworlds/NewOverworlds"
import MapEditor from "./map-editor"
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <HashRouter>
            <Navbar /> 
            <Routes>
                 <Route path="/" element={<Homepage />} />
                 <Route path="/trainer-editor" element={<TrainerEditor />} />
                 <Route path="/pokemon-editor" element={<PokemonEditor/>} />
                 <Route path="/trainer-editor/new-trainer" element={<NewTrainerCard/>}/>
                 <Route path="/jukebox" element={<Jukebox/>}/>
                 <Route path="/move-editor" element={<MoveEditor/>}/>
                 <Route path="/script-editor" element={<ScriptEditor/>}/>
                 <Route path="/overworld-editor" element={<OverworldEditor/>}/>
                 <Route path="/overworld-editor/new-overworld" element={<NewOverworlds/>}/>
                 <Route path="/map-editor" element={<MapEditor/>}/>
             </Routes>
        </HashRouter>
    </React.StrictMode>
)