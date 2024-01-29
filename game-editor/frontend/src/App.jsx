import { SetDataFolder } from "../wailsjs/go/main/App"
import TrainerEditor from "./trainer-editor/main"
function App() {
    const OptionsMenu = async() => {
        await SetDataFolder()

    }
    return (
        <>
           <TrainerEditor />
           <button onClick={() => OptionsMenu()}>Select Folder</button>
        </>
    )
}

export default App
