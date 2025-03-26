var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { ParseMoves } from "../../wailsjs/go/moveeditor/MoveEditorApp";
import Select from "react-select";
import UpdateMoveData from "./existing-moves/UpdateMoveData";
var MoveEditor = function () {
    var _a = useState([]), moves = _a[0], setMoves = _a[1];
    var _b = useState(), selectedMove = _b[0], setSelectedMove = _b[1];
    var _c = useState(0), power = _c[0], setPower = _c[1];
    var _d = useState(0), pp = _d[0], setPP = _d[1];
    var _e = useState(0), accuracy = _e[0], setAccuracy = _e[1];
    var _f = useState(""), moveType = _f[0], setMoveType = _f[1];
    var _g = useState(""), name = _g[0], setName = _g[1];
    useEffect(function () {
        var fetchMoves = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ParseMoves()];
                    case 1:
                        data = _a.sent();
                        setMoves(data.Move.map(function (move) { return (__assign(__assign({}, move), { ID: String(move.ID) })); }));
                        return [2 /*return*/];
                }
            });
        }); };
        fetchMoves();
    }, []);
    return (React.createElement("div", { className: "text-black" },
        React.createElement(Select, { name: "moves", onChange: function (e) {
                var move = moves.find(function (moveData) { return moveData.ID === (e === null || e === void 0 ? void 0 : e.value); });
                setSelectedMove(move);
                setPower(move === null || move === void 0 ? void 0 : move.Power);
                setPP(move === null || move === void 0 ? void 0 : move.Pp);
                setAccuracy(move === null || move === void 0 ? void 0 : move.Accuracy);
                setMoveType(move === null || move === void 0 ? void 0 : move.Type);
                setName(move === null || move === void 0 ? void 0 : move.Name);
            }, isClearable: false, isDisabled: false, isLoading: false, isRtl: false, isSearchable: true, isMulti: false, classNames: {
                control: function () { return "rounded-2xl"; },
            }, options: moves === null || moves === void 0 ? void 0 : moves.map(function (move) { return ({
                value: move.ID,
                label: "".concat(move.Name),
            }); }) }),
        selectedMove ? (React.createElement(UpdateMoveData, { selectedMove: selectedMove, power: power, setPower: setPower, pp: pp, setPP: setPP, accuracy: accuracy, setAccuracy: setAccuracy, moveType: moveType, setMoveType: setMoveType, name: name, setName: setName })) : (React.createElement("div", null)),
        React.createElement("br", null),
        React.createElement("button", { className: "file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black text-white" }, "New Move")));
};
export default MoveEditor;
