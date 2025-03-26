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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import Modal from 'react-modal';
import { useState } from "react";
import { models } from "../../../wailsjs/go/models";
import { CreateOverworldFrame, CreteOverworldGif } from "../../../wailsjs/go/overworldeditor/OverworldEditorApp";
var customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
var FrameModal = function (_a) {
    var _b;
    var typeOfFrame = _a.typeOfFrame, nameOfFolder = _a.nameOfFolder, setFrames = _a.setFrames, direction = _a.direction, modalIsOpen = _a.modalIsOpen, closeModal = _a.closeModal, frames = _a.frames;
    var _c = useState(0), currentFrameNumber = _c[0], currentSetFrameNumber = _c[1];
    var _d = useState(0), frameMax = _d[0], setFrameMax = _d[1];
    var _e = useState(""), gif = _e[0], setGif = _e[1];
    return (React.createElement("div", null,
        React.createElement(Modal, { isOpen: modalIsOpen, onRequestClose: closeModal, style: customStyles },
            React.createElement("div", { className: "text-black" },
                React.createElement("label", null, "Number of frames:"),
                React.createElement("br", null),
                React.createElement("input", { type: "number", id: "frames", name: "frames", min: "1", max: "9999", onChange: function (e) { return setFrameMax(Number(e.target.value)); } }),
                React.createElement("br", null),
                React.createElement("label", null, "Current frame:"),
                React.createElement("br", null),
                React.createElement("input", { type: "number", id: "currentFrame", name: "currentFrame", min: currentFrameNumber, max: frameMax, onChange: function (e) { return currentSetFrameNumber(Number(e.target.value)); }, value: currentFrameNumber }),
                React.createElement("br", null),
                React.createElement("img", { src: frames[currentFrameNumber] ? "data:image/png;base64,".concat((_b = frames[currentFrameNumber]) === null || _b === void 0 ? void 0 : _b.Sprite) : '', alt: "".concat(nameOfFolder, " image") }),
                React.createElement("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!direction)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, CreateOverworldFrame(typeOfFrame, currentFrameNumber, nameOfFolder, direction)];
                                case 1:
                                    data = _a.sent();
                                    setFrames(__spreadArray(__spreadArray([], frames, true), [
                                        models.OverworldDirectionFrame.createFrom(data)
                                    ], false));
                                    return [2 /*return*/];
                            }
                        });
                    }); } }, "Upload Frame"),
                React.createElement("br", null),
                React.createElement("br", null),
                currentFrameNumber == frameMax ? React.createElement("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var gifData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!direction)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, CreteOverworldGif(typeOfFrame, currentFrameNumber, nameOfFolder, direction)];
                                case 1:
                                    gifData = _a.sent();
                                    setGif(gifData);
                                    return [2 /*return*/];
                            }
                        });
                    }); } }, "Create Gif") : React.createElement("div", null),
                React.createElement("br", null),
                React.createElement("img", { src: gif ? "data:image/gif;base64,".concat(gif) : "" }),
                React.createElement("button", { onClick: function () { return closeModal(); } }, "Close")))));
};
export default FrameModal;
