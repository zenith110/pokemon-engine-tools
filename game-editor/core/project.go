package core

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	coreModels "github.com/zenith110/pokemon-engine-tools/models"
	Models "github.com/zenith110/pokemon-go-engine-toml-models/models"
	"gopkg.in/src-d/go-git.v4"
)

func (a *App) GrabProjectWorkspace() string {
	selection, err := runtime.OpenDirectoryDialog(a.Ctx, runtime.OpenDialogOptions{
		Title: "Select engine base directory",
	})
	if err != nil {
		panic(err)
	}
	selectionUpdated := strings.ReplaceAll(selection, "\\", "/")
	return selectionUpdated
}

func (a *App) CreateProject(projectCreationData coreModels.ProjectCreation) bool {
	githubEngineUrl := "https://api.github.com/repos/zenith110/pokemon-go-engine/git/refs/heads/main"
	req, err := http.Get(githubEngineUrl)
	if err != nil {
		fmt.Printf("error is %v", err)
	}
	bodyData, _ := io.ReadAll(req.Body)

	var project coreModels.GithubInfo
	if err := json.Unmarshal(bodyData, &project); err != nil {
		panic(err)
	}
	updatedDataDirectory := strings.ReplaceAll(projectCreationData.Directory, "\\", "/")
	fullPath := fmt.Sprintf("%s/%s", updatedDataDirectory, projectCreationData.Name)
	os.Mkdir(fullPath, 0755)

	_, err = git.PlainClone(fullPath, false, &git.CloneOptions{
		URL:      "https://github.com/zenith110/pokemon-go-engine",
		Progress: os.Stdout,
	})
	if err != nil {
		fmt.Printf("error is: %v", err)
		return false
	}

	err = os.RemoveAll(fmt.Sprintf("%s/.git", fullPath))
	if err != nil {
		fmt.Printf("error is: %v", err)
		return false
	}

	currentTime := time.Now()

	projectData := Models.Project{
		Name:            projectCreationData.Name,
		FolderLocation:  fullPath,
		VersionOfEngine: project.Object.Sha,
		CreatedDateTime: currentTime.UTC().String(),
		ID:              projectCreationData.ID,
		LastUsed:        "N/A",
	}
	var projects []Models.Project
	projects = append(projects, projectData)
	projectDataToml := Models.Projects{
		Project: projects,
	}
	data, err := toml.Marshal(projectDataToml)
	if err != nil {
		fmt.Printf("error while creating new project file! %v\n", err)
	}

	f, err := os.OpenFile("projects.toml", os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
	a.DataDirectory = fullPath
	return true
}

func (a *App) ParseProjects() []Models.Project {
	projectsPath := "projects.toml"
	projects, err := os.Open(projectsPath)
	if err != nil {
		os.Create(projectsPath)
	}
	defer projects.Close()
	var projectsData Models.Projects
	b, err := io.ReadAll(projects)
	if err != nil {
		fmt.Printf("error while reading projects is %v", err)
	}
	var projectsArray []Models.Project

	err = toml.Unmarshal(b, &projectsData)
	if err != nil {
		panic(err)
	}
	for projectsIndex := range projectsData.Project {
		project := Models.Project{
			Name:            projectsData.Project[projectsIndex].Name,
			FolderLocation:  projectsData.Project[projectsIndex].FolderLocation,
			VersionOfEngine: projectsData.Project[projectsIndex].VersionOfEngine,
			CreatedDateTime: projectsData.Project[projectsIndex].CreatedDateTime,
			LastUsed:        projectsData.Project[projectsIndex].LastUsed,
			ID:              projectsData.Project[projectsIndex].ID,
		}
		projectsArray = append(projectsArray, project)
	}
	return projectsArray
}

func (a *App) SelectProject(project coreModels.ProjectSelect) {
	a.DataDirectory = project.FolderLocation
	projectsPath := "projects.toml"
	projects, err := os.Open(projectsPath)
	if err != nil {
		os.Create(projectsPath)
	}
	defer projects.Close()
	var projectsData Models.Projects
	b, err := io.ReadAll(projects)
	if err != nil {
		fmt.Printf("error while reading projects is %v", err)
	}

	err = toml.Unmarshal(b, &projectsData)
	if err != nil {
		panic(err)
	}
	for projectsIndex := range projectsData.Project {
		if projectsData.Project[projectsIndex].ID == project.ID {
			currentTime := time.Now()
			projectsData.Project[projectsIndex].LastUsed = currentTime.UTC().String()
			lastUsedFileName := "lastused.toml"
			data, err := toml.Marshal(projectsData.Project[projectsIndex])
			if err != nil {
				panic(fmt.Errorf("error had occured while creating last used data!\n%v", err))
			}
			f, err := os.OpenFile("lastused.toml", os.O_CREATE, 0644)
			if err != nil {
				os.Remove(lastUsedFileName)
				os.Create(lastUsedFileName)
			}
			defer f.Close()
			if _, err := f.Write(data); err != nil {
				fmt.Printf("Error occured while writing data %v\n", err)
			}
		}
	}
	data, err := toml.Marshal(projectsData)
	if err != nil {
		panic(fmt.Errorf("error had occured while creating move data!\n%v", err))
	}
	os.Remove(projectsPath)
	f, err := os.OpenFile(projectsPath, os.O_CREATE, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
}

func (a *App) ImportProject() {
	selection, err := runtime.OpenDirectoryDialog(a.Ctx, runtime.OpenDialogOptions{
		Title: "Select engine base directory",
	})
	if err != nil {
		fmt.Printf("error is %v while importing a project!\n", err)
	}

	id := uuid.New()
	selectionUpdated := strings.ReplaceAll(selection, "\\", "/")
	currentTime := time.Now()
	projectNameSplit := strings.Split(selectionUpdated, "/")
	projectName := projectNameSplit[len(projectNameSplit)-1]
	projectData := Models.Project{
		Name:            projectName,
		FolderLocation:  selectionUpdated,
		VersionOfEngine: "",
		CreatedDateTime: currentTime.UTC().String(),
		ID:              id.String(),
		LastUsed:        "N/A",
	}
	var projects []Models.Project
	projects = append(projects, projectData)
	projectDataToml := Models.Projects{
		Project: projects,
	}
	data, err := toml.Marshal(projectDataToml)
	if err != nil {
		fmt.Printf("error while creating new project file! %v\n", err)
	}

	f, err := os.OpenFile("projects.toml", os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("Error occured while opening file %v\n", err)
	}
	defer f.Close()
	if _, err := f.Write(data); err != nil {
		fmt.Printf("Error occured while writing data %v\n", err)
	}
	a.DataDirectory = selectionUpdated
}

func (a *App) GetCurrentProject() Models.Project {
	lastUsedFileName := "lastused.toml"
	projectLastUpdated, err := os.OpenFile(lastUsedFileName, os.O_CREATE, 0644)
	if err != nil {
		os.Create(lastUsedFileName)
		return Models.Project{}
	}
	defer projectLastUpdated.Close()

	var projectsData Models.Project
	b, err := io.ReadAll(projectLastUpdated)
	if err != nil {
		fmt.Printf("error while reading last used project: %v", err)
		return Models.Project{}
	}

	err = toml.Unmarshal(b, &projectsData)
	if err != nil {
		fmt.Printf("error while unmarshaling last used project: %v", err)
		return Models.Project{}
	}

	return projectsData
}

// IsProjectSelected checks if a project is currently selected
func (a *App) IsProjectSelected() bool {
	return a.DataDirectory != ""
}
