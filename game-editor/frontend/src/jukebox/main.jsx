import {useState, useEffect} from "react";
import { GrabMusicTracks, UploadNewSong } from "../../wailsjs/go/main/App";
const Jukebox = () => {
    const [songList, setSongList] = useState([]);
    const [song, setSong] = useState({})
    const importSong = async() => {
        await UploadNewSong();
    }
    useEffect(() => { 
        const fetchSongList = async() => {
            let data = await GrabMusicTracks()
            setSongList(data)
        }
        
        fetchSongList();
        
    }, [])
    return(
        <div className="text-black">
            <select name="audio" onChange={(e) => {
                    const song = songList.find((song) => song.Name === e.target.value);
                    setSong(song);
            }} defaultValue={"placeholder"}>
                <option value={"placeholder"} disabled>Select a song</option>
                {songList?.map((song) =>
                    <option value={song.Name} key={song.Name}>{song.Name}</option>
                )}
            </select>
            <br/>
            <br/>
            <div className="text-black flex items-center justify-center">
                <audio controls autoPlay loop src={song? `data:audio/ogg;base64,${song.Path}` : ''} controlsList="nodownload" />
            </div>
            <br/>
            <button className="bg-blueWhale rounded-b-lg py-1 hover:bg-wildBlueYonder text-white" onClick={() => importSong()}>Import new track</button>
        </div>
    )
}
export default Jukebox