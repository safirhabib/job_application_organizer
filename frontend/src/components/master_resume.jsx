import React, { useEffect, useState } from "react";
import { get_master_resume, update_master_resume } from "./api/api"
import "../../src/index.css";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const MasterResume = () => {
    const [masterResume, setMasterResume] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [resumePreview, setResumePreview] = useState("");
    const [saveCount, setSaveCount] = useState(0);
    const [loadingImage, setLoadingImage ] = useState(true);

    useEffect(() => {

        const fetch_master_resume  = async () => {
            const res = await get_master_resume();
            if (res.status === 200) {
                setMasterResume(res.data.content);
            }
            else {
                setMasterResume("Error fetching resume")
            }
        }

        fetch_master_resume();
    }, [saveCount])

    const downloadResume = () => {

    }

    const saveResume = async () => {
        console.log("saving resume...")
        const res = await update_master_resume(masterResume);
        console.log(res)
        if (res && res.status == 200) {
            setLoadingImage(true);

            setSuccessMessage("Resume saved");
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessMessage("")
            }, 3000);

            setSaveCount(saveCount + 1);
        }


        else {
            setErrorMessage("Error: Unable to save resume");
            setShowErrorMessage(true);
            setTimeout(() => {
                setShowErrorMessage(false);
                setErrorMessage("")
            }, 3000);
        }
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col gap-2 w-[90%]">
                <div className="w-full flex justify-end">
                    <button
                        onClick={downloadResume}
                        className="bg-[#224378] text-white rounded px-4 py-2 hover:bg-[#1b355f] transition"
                    >
                        Download
                    </button>
                </div>

                <div className="flex flex-row gap-8">
                    <div className="w-[50%]">
                        <textarea
                            value={masterResume}
                            onChange={(e) => setMasterResume(e.target.value)}
                            className="bg-[#393737] rounded p-2 border w-[100%] h-[100vh]"
                        ></textarea>
                    </div>
                    <div className="w-[50%] rounded-lg">
                        <div className="w-full bg-white rounded-lg relative">
                            {loadingImage && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                           
                            <img
                                src={`${backend}/api/get_master_preview?ts=${saveCount}`}
                                className={`w-full rounded-lg ${loadingImage ? "opacity-30" : ""}`}
                                onLoad={() => setLoadingImage(false)}
                                onError={() => setLoadingImage(false)}
                                alt="Resume preview"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={saveResume}
                    className="bg-[#224378] text-white rounded"
                >
                    Save
                </button>
                
                {showSuccessMessage && (
                <div className="bg-green-800/90 text-white px-4 py-2 rounded mb-4">
                    {successMessage}
                </div>
                )}

                {showErrorMessage && (
                <div className="bg-red-800/90 text-white px-4 py-2 rounded mb-4">
                    {errorMessage}
                </div>
                )}
            </div>

        </div>
    )
}

export default MasterResume;
