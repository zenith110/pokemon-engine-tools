import { useNavigate } from "react-router-dom";
import { SetMapTileset } from "../../wailsjs/go/main/App";
import React, { useState } from "react";
import SplitPane, { Pane } from 'split-pane-react';
function style (color) {
    return {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color
    };
  }
const NewMap = () => {
    const navigate = useNavigate();
    const [tileset, setTileset] = useState("")
    const [mapName, setMapName] = useState("")
    const [xAxisSize, setXAxisSize] = useState(0)
    const [yAxisSize, setYAxisSize] = useState(0)
    const [sizes, setSizes] = useState([, '30%', 'auto']);
    const setMapTilesetButton = async() => {
        await SetMapTileset()
    }
    return(
        <>
        <label>Name of map</label>
        <br/>
        <input></input>
        <br/>
        <label>X axis max size</label>
        <br/>
        <input></input>
        <br/>
        <label>Y axis max size</label>
        <br/>
        <input></input>
        <br/>
        <button onClick={() => setMapTilesetButton()}>Tileset</button>
        <br/>
        <button onClick={() => navigate(-1)}>Go back to map editor home</button>
        <div style={{ height: 500 }}>
        <SplitPane
            split='vertical'
            sizes={sizes}
            onChange={setSizes}
        >
            <Pane minSize={50} maxSize='50%'>
            <div style={style('#ddd')}>
                pane1
            </div>
            </Pane>
            <div style={style('#ccc')}>
            pane2
            </div>
        </SplitPane>
        </div>
        </>
    )
}
export default NewMap