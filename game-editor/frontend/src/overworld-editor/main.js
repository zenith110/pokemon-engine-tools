import { useState } from "react";
import { useNavigate } from 'react-router-dom';
var OverworldEditor = function () {
    var _a = useState([]), overworlds = _a[0], setOverworlds = _a[1];
    var navigate = useNavigate();
    // useEffect(() => {
    //     const GrabAllOverworlds = async() => {
    //         let data = await ParseOverworldData()
    //         setOverworlds(data)
    //     }
    // }, [])
    return (React.createElement("div", null,
        React.createElement("button", { onClick: function () { return navigate("new-overworld"); } }, "New Overworld")));
};
export default OverworldEditor;
