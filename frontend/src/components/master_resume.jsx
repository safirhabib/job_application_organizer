import React, { useEffect, useState } from "react";
import { get_master_resume } from "./api/api"

const MasterResume = () => {
    const [masterResume, setMasterResume] = useState("");

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
        </>
    )
}

export default MasterResume;
