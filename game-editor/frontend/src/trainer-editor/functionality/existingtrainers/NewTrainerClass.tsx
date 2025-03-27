import { useState } from "react";
import Modal from 'react-modal';
import { models } from "../../../../wailsjs/go/models";

interface NewTrainerClassProps {
    classTypes: models.Data[];
    setClassTypes: (classTypes: models.Data[]) => void;
    isOpen: boolean;
    onRequestClose: () => void;
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1e293b', // slate-800
        borderRadius: '1.5rem',
        border: 'none',
        padding: '2rem',
        maxWidth: '90vw',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
};

const NewTrainerClass = ({ classTypes, setClassTypes, isOpen, onRequestClose }: NewTrainerClassProps) => {
    const [className, setClassName] = useState("");

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="New Trainer Class Modal"
        >
            <div className="text-white">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-2xl bg-slate-700 rounded-xl p-6 shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Trainer Class</h2>

                        {/* Class Name Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Class Name</label>
                            <input
                                type="text"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-slate-500 focus:outline-none"
                                placeholder="Enter trainer class name"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={onRequestClose}
                                className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (!className.trim()) return;

                                    const newClass: models.Data = {
                                        Name: className.trim(),
                                        Music: ""
                                    };

                                    setClassTypes([...classTypes, newClass]);
                                    onRequestClose();
                                }}
                                disabled={!className.trim()}
                                className="px-6 py-2 bg-tealBlue text-white rounded-xl hover:bg-wildBlueYonder transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Add Class
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NewTrainerClass; 