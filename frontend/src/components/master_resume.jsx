import React, { useEffect, useState } from "react";
import { get_master_resume, update_master_resume } from "./api/api"
import "../../src/index.css";

const MasterResume = () => {
    const [masterResume, setMasterResume] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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
        if (res.status == 200) {
            setSuccessMessage("Resume saved");
            setShowSuccessMessage(true);
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
            
            {successMessage && (
            <div className="bg-green-100 text-black-800 border border-green-300 px-4 py-2 rounded mb-4">
                {successMessage}
            </div>
            )}
        </>
    )
}

export default MasterResume;
