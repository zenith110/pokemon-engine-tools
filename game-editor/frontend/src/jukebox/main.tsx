import {useState, useEffect, useRef} from "react";
import { UploadNewSong } from "../../bindings/github.com/zenith110/pokemon-engine-tools/tools/jukebox/JukeboxApp";
import { GrabMusicTracks } from "../../bindings/github.com/zenith110/pokemon-engine-tools/parsing/ParsingApp";
import Select from "react-select";
import { Song } from "../models/song";

const Jukebox = () => {
    const [songList, setSongList] = useState<Song[]>([]);
    const [song, setSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const importSong = async() => {
        await UploadNewSong();
    }

    useEffect(() => { 
        const fetchSongList = async() => {
            let data = await GrabMusicTracks()
            setSongList(data)
            
            // Load last played song from localStorage
            const lastSongId = localStorage.getItem('lastPlayedSong');
            if (lastSongId) {
                const lastSong = data.find(s => s.ID === lastSongId);
                if (lastSong) {
                    setSong(lastSong);
                }
            }
        }
        
        fetchSongList();
    }, [])

    const handleSongChange = (selectedOption: any) => {
        const selectedSong = songList.find(s => s.ID === selectedOption?.value);
        if (selectedSong) {
            setSong(selectedSong);
            localStorage.setItem('lastPlayedSong', selectedSong.ID);
            setIsPlaying(true);
        }
    }

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }

    const handlePreviousTrack = () => {
        if (!song) return;
        const currentIndex = songList.findIndex(s => s.ID === song.ID);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : songList.length - 1;
        const previousSong = songList[previousIndex];
        setSong(previousSong);
        localStorage.setItem('lastPlayedSong', previousSong.ID);
        setIsPlaying(true);
    }

    const handleNextTrack = () => {
        if (!song) return;
        const currentIndex = songList.findIndex(s => s.ID === song.ID);
        const nextIndex = currentIndex < songList.length - 1 ? currentIndex + 1 : 0;
        const nextSong = songList[nextIndex];
        setSong(nextSong);
        localStorage.setItem('lastPlayedSong', nextSong.ID);
        setIsPlaying(true);
    }

    const handleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-4 border-gray-700 w-full max-w-2xl">
                {/* Jukebox Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blueWhale mb-2">🎵 Jukebox</h1>
                    <div className="h-1 bg-gradient-to-r from-blueWhale to-tealBlue rounded-full"></div>
                </div>

                {/* Song Selection */}
                <div className="mb-8">
            <Select
                 options={songList.map(song => ({ value: song.ID, label: `${song.ID}: ${song.Name}`}))}
                        onChange={handleSongChange}
                        value={song ? { value: song.ID, label: `${song.ID}: ${song.Name}`} : null}
                isClearable={false}
                isDisabled={false}
                isLoading={false}
                isRtl={false}
                isSearchable={true}
                isMulti={false}
                classNames={{
                            control: () => "rounded-2xl bg-gray-700 border-gray-600",
                            menu: () => "bg-gray-700 rounded-2xl",
                            option: (state) => 
                                `${
                                    state.isFocused ? 'bg-blueWhale text-white' : 
                                    state.isSelected ? 'bg-tealBlue text-white' : 
                                    'text-white hover:bg-gray-600'
                                }`,
                            singleValue: () => "text-white",
                            input: () => "text-white",
                            placeholder: () => "text-gray-400"
                        }}
                    />
                </div>

                {/* Player Controls */}
                <div className="bg-gray-700 rounded-xl p-6 mb-8">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        {/* Previous Track Button */}
                        <button 
                            onClick={handlePreviousTrack}
                            className="bg-blueWhale hover:bg-wildBlueYonder text-white p-3 rounded-full transition-colors duration-200"
                            title="Previous Track"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Play/Pause Button */}
                        <button 
                            onClick={handlePlayPause}
                            className="bg-tealBlue hover:bg-wildBlueYonder text-white p-4 rounded-full transition-colors duration-200"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>

                        {/* Next Track Button */}
                        <button 
                            onClick={handleNextTrack}
                            className="bg-blueWhale hover:bg-wildBlueYonder text-white p-3 rounded-full transition-colors duration-200"
                            title="Next Track"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Mute Button */}
                        <button 
                            onClick={handleMute}
                            className="bg-blueWhale hover:bg-wildBlueYonder text-white p-3 rounded-full transition-colors duration-200"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Hidden Audio Element */}
                    <audio 
                        ref={audioRef}
                        controls 
                        autoPlay 
                        loop 
                        src={song ? `data:audio/ogg;base64,${song.Path}` : ''} 
                        controlsList="nodownload"
                        className="hidden"
                    />

                    <div className="flex justify-center mt-4">
                        <button 
                            className="bg-blueWhale hover:bg-wildBlueYonder text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2"
                            onClick={() => importSong()}
                        >
                            <span>Import New Track</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Visualizer or Decorative Element */}
                <div className="h-2 bg-gradient-to-r from-blueWhale via-tealBlue to-blueWhale rounded-full animate-pulse"></div>
            </div>
        </div>
    )
}

export default Jukebox