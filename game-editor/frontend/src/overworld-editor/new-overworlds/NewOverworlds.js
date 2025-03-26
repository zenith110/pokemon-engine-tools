var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import DownArrow from "../images/reshot-icon-down-arrow-P6BUA8L4DS.svg";
import UpArrow from "../images/reshot-icon-up-arrow-XMEL8JGW5T.svg";
import LeftArrow from "../images/reshot-icon-left-arrow-2RFCAW584E.svg";
import RightArrow from "../images/reshot-icon-right-arrow-5E3R279NU8.svg";
import { CheckOverworldId, CreateOverworldTomlEntry } from "../../../wailsjs/go/overworldeditor/OverworldEditorApp";
import FrameModal from "./FrameModal";
var NewOverworlds = function () {
    var _a = useState([]), swimmingFrames = _a[0], setSwimmingFrames = _a[1];
    var _b = useState([]), walkingFrames = _b[0], setWalkingFrames = _b[1];
    var _c = useState([]), runningFrames = _c[0], setRunningFrames = _c[1];
    var _d = useState(false), isPlayer = _d[0], setIsPlayer = _d[1];
    var _e = useState([]), surfingFrames = _e[0], setSurfingFrames = _e[1];
    var _f = useState(false), modalIsOpen = _f[0], setIsOpen = _f[1];
    var _g = useState(null), frameSet = _g[0], setFrameSet = _g[1];
    var _h = useState(null), currentDirection = _h[0], setCurrentDirection = _h[1];
    var _j = useState(0), folderName = _j[0], setFolderName = _j[1];
    useEffect(function () {
        var GetOverworldId = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CheckOverworldId()];
                    case 1:
                        data = _a.sent();
                        setFolderName(data);
                        return [2 /*return*/];
                }
            });
        }); };
        GetOverworldId();
    }, []);
    var openModal = function () {
        setIsOpen(true);
    };
    var closeModal = function () {
        setIsOpen(false);
    };
    var renderFrameModal = function (frameType) {
        switch (frameType) {
            case 'swimming':
                return React.createElement(FrameModal, { typeOfFrame: "swimming", nameOfFolder: folderName, setFrames: setSwimmingFrames, direction: currentDirection, modalIsOpen: modalIsOpen, closeModal: closeModal, frames: swimmingFrames });
            case 'running':
                return React.createElement(FrameModal, { typeOfFrame: "running", nameOfFolder: folderName, setFrames: setRunningFrames, direction: currentDirection, modalIsOpen: modalIsOpen, closeModal: closeModal, frames: runningFrames });
            case 'walking':
                return React.createElement(FrameModal, { typeOfFrame: "walking", nameOfFolder: folderName, setFrames: setWalkingFrames, direction: currentDirection, modalIsOpen: modalIsOpen, closeModal: closeModal, frames: walkingFrames });
            case 'surfing':
                return React.createElement(FrameModal, { typeOfFrame: "surfing", nameOfFolder: folderName, setFrames: setSurfingFrames, direction: currentDirection, modalIsOpen: modalIsOpen, closeModal: closeModal, frames: surfingFrames });
            default:
                return '';
        }
    };
    return (React.createElement("div", null,
        React.createElement("div", null,
            React.createElement("label", null, "Swimming frames"),
            React.createElement("br", null),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("swimming");
                } },
                React.createElement("img", { src: UpArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("swimming");
                } },
                React.createElement("img", { src: DownArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("swimming");
                } },
                React.createElement("img", { src: LeftArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("swimming");
                } },
                React.createElement("img", { src: RightArrow, width: 32, height: 32 }))),
        React.createElement("br", null),
        React.createElement("div", null,
            React.createElement("label", null, "Running frames"),
            React.createElement("br", null),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("running");
                } },
                React.createElement("img", { src: UpArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("running");
                } },
                React.createElement("img", { src: DownArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("running");
                } },
                React.createElement("img", { src: LeftArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("running");
                } },
                React.createElement("img", { src: RightArrow, width: 32, height: 32 }))),
        React.createElement("br", null),
        React.createElement("div", null,
            React.createElement("label", null, "Walking frames"),
            React.createElement("br", null),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("walking");
                } },
                React.createElement("img", { src: UpArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("walking");
                } },
                React.createElement("img", { src: DownArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("walking");
                } },
                React.createElement("img", { src: LeftArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("walking");
                } },
                React.createElement("img", { src: RightArrow, width: 32, height: 32 }))),
        React.createElement("br", null),
        React.createElement("div", null,
            React.createElement("label", null, "Surfing frames"),
            React.createElement("br", null),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("up");
                    setFrameSet("surfing");
                } },
                React.createElement("img", { src: UpArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("down");
                    setFrameSet("surfing");
                } },
                React.createElement("img", { src: DownArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("left");
                    setFrameSet("surfing");
                } },
                React.createElement("img", { src: LeftArrow, width: 32, height: 32 })),
            React.createElement("button", { onClick: function () {
                    openModal();
                    setCurrentDirection("right");
                    setFrameSet("surfing");
                } },
                React.createElement("img", { src: RightArrow, width: 32, height: 32 })),
            React.createElement("br", null),
            React.createElement("input", { type: "checkbox", id: "playerChoice", name: "playerChoice", value: "Player", onChange: function (e) { return setIsPlayer(e.target.checked); } }),
            React.createElement("label", { htmlFor: "playerChoice" }, "Is a playable character"),
            renderFrameModal(frameSet || "")),
        React.createElement("br", null),
        React.createElement("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = {
                                "ID": uuidv4(),
                                "OverworldId": folderName.toString(),
                                "SwimmingFrames": swimmingFrames,
                                "RunningFrames": runningFrames,
                                "WalkingFrames": walkingFrames,
                                "SurfingFrames": surfingFrames,
                                "IsPlayer": isPlayer,
                                "Name": folderName.toString(),
                                "convertValues": function () { }
                            };
                            return [4 /*yield*/, CreateOverworldTomlEntry(data)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); } }, "Save")));
};
export default NewOverworlds;
