import { SetDataFolder } from "../wailsjs/go/main/App";

const App: React.FC = () => {
    const OptionsMenu = async() => {
        await SetDataFolder()
    }
    return (
        <div>
            <h1>Welcome to {"[INSEERT NAME HERE LATER]"}</h1>
            <h2>Before continuing, Please set your settings folder to the proper directory before continuing!</h2>
           <button onClick={() => OptionsMenu()} className="">Select Folder</button>
        </div>
    )
}

export default App