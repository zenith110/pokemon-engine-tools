import {useState, useEffect} from "react";
import { GrabMusicTracks, UploadNewSong } from "../../wailsjs/go/jukebox/JukeboxApp";
import Select from "react-select";
import { Song } from "../models/song";
const Jukebox = () => {
    const [songList, setSongList] = useState<Song[]>([]);
    const [song, setSong] = useState<Song | null>(null);
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
            <Select
                 options={songList.map(song => ({ value: song.ID, label: `${song.ID}: ${song.Name}`}))}
                 onChange={(e) => {
                    const song = songList.find((song) => song.ID === e?.value);
                    setSong(song || null);
                }}
                isClearable={false}
                isDisabled={false}
                isLoading={false}
                isRtl={false}
                isSearchable={true}
                isMulti={false}
                classNames={{
                    control: () => "rounded-2xl"
                }}
                />
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