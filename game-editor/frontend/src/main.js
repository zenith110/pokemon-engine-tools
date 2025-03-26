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
import Homepage from "./homepage/main";
import OverworldEditor from "./overworld-editor/main";
import NewOverworlds from "./overworld-editor/new-overworlds/NewOverworlds";
import MapViewer from "./map-viewer";
var container = document.getElementById('root');
var root = createRoot(container);
root.render(React.createElement(React.StrictMode, null,
    React.createElement(HashRouter, null,
        React.createElement(Navbar, null),
        React.createElement(Routes, null,
            React.createElement(Route, { path: "/", element: React.createElement(Homepage, null) }),
            React.createElement(Route, { path: "/trainer-editor", element: React.createElement(TrainerEditor, null) }),
            React.createElement(Route, { path: "/pokemon-editor", element: React.createElement(PokemonEditor, null) }),
            React.createElement(Route, { path: "/trainer-editor/new-trainer", element: React.createElement(NewTrainerCard, null) }),
            React.createElement(Route, { path: "/jukebox", element: React.createElement(Jukebox, null) }),
            React.createElement(Route, { path: "/move-editor", element: React.createElement(MoveEditor, null) }),
            React.createElement(Route, { path: "/script-editor", element: React.createElement(ScriptEditor, null) }),
            React.createElement(Route, { path: "/overworld-editor", element: React.createElement(OverworldEditor, null) }),
            React.createElement(Route, { path: "/overworld-editor/new-overworld", element: React.createElement(NewOverworlds, null) }),
            React.createElement(Route, { path: "/map-viewer", element: React.createElement(MapViewer, null) })))));
