import React from 'react';
import { SetDataFolder } from '../wailsjs/go/main/App';
const App: React.FC = () => {
    const OptionsMenu = async() => {
        await SetDataFolder()
    }
    return (
        <div className="flex flex-col justify-evenly h-screen">
            <h1 className="text-4xl">Welcome to The Pokemon Game Engine</h1>
            <h2>Before continuing, Please set your settings folder to the base folder before continuing!</h2>
            <div className='flex w-screen justify-center'>
                <button onClick={() => OptionsMenu()} className="file: bg-blueWhale rounded border-1 border-solid w-1/6 border-black hover:bg-wildBlueYonder">Select Folder</button>
            </div>
        </div>
    )
}

export default App