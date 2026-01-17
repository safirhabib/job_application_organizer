import React, { useEffect, useState } from "react";
import { get_master_resume, update_master_resume } from "./api/api"
import "../../src/index.css";

const MasterResume = () => {
    const [masterResume, setMasterResume] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
    }, [])

    const saveResume = async () => {
        console.log("saving resume...")
        const res = await update_master_resume(masterResume);
        console.log(res)
        if (res && res.status == 200) {
            setSuccessMessage("Resume saved");
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
                setSuccessMessage("")
            }, 3000);
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
        <>
            <textarea
                value={masterResume}
                style={{
                    width: "100vh",
                    height: "100vh"
                }}
                onChange={(e) => setMasterResume(e.target.value)}
            ></textarea>

            <button
                onClick={saveResume}
            >
                Save
            </button>
            
            {showSuccessMessage && (
            <div className="bg-green-800 text-white opacity-90 px-4 py-2 rounded mb-4">
                {successMessage}
            </div>
            )}

            {showErrorMessage && (
            <div className="bg-red-800 text-white opacity-90 px-4 py-2 rounded mb-4">
                {errorMessage}
            </div>
            )}

        </>
    )
}

export default MasterResume;
