// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {models} from '../models';

export function CreateProject(arg1:models.ProjectCreation):Promise<boolean>;

export function GrabProjectWorkspace():Promise<string>;

export function ImportProject():Promise<void>;

export function ParseProjects():Promise<Array<models.Project>>;

export function SelectProject(arg1:models.ProjectSelect):Promise<void>;
