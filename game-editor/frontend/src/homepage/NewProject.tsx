import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { App } from "../../bindings/github.com/zenith110/pokemon-engine-tools/tools-core";
import { Dialogs } from "@wailsio/runtime";
const NewProject = ({
  setClickedNewProject,
}: {
  setClickedNewProject: (value: boolean) => void;
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectDirectory, setProjectDirectory] = useState("");
  const [status, setStatus] = useState("");
  return (
    <div>
      <label>Project name:</label>
      <br />
      <input
        onChange={(e) => setProjectName(e.target.value)}
        className="text-black"
      ></input>
      <br />
      <button
        onClick={async () => {
          try {
            const result = await Dialogs.OpenFile({
              Title: "Select engine base directory",
              CanChooseDirectories: true,
              CanChooseFiles: false,
            });
            if (result) {
              setProjectDirectory(result);
            }
          } catch (err) {
            console.error("Error selecting directory:", err);
            setStatus("Error selecting directory. Please try again.");
          }
        }}
      >
        Select Project Directory
      </button>
      {projectDirectory && <p>Selected: {projectDirectory}</p>}
      <br />
      <button
        onClick={async () => {
          if (!projectDirectory) {
            setStatus("Please select a project directory first!");
            return;
          }
          let data = {
            name: projectName,
            directory: await App.GrabProjectWorkspace(projectDirectory),
            id: uuidv4(),
          };
          setStatus(`${projectName} is being created!`);
          let gitRepoCreationStatus = await App.CreateProject(data);
          if (gitRepoCreationStatus === true) {
            setStatus(`${projectName} has been created!`);
            setClickedNewProject(false);
            // Refresh the page to update the navbar
            window.location.reload();
          }
        }}
      >
        Submit
      </button>
      <p>{status}</p>
    </div>
  );
};
export default NewProject;
