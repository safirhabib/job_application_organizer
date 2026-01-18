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
    const [pages, setPages] = useState(0);
    const [loadingPages, setLoadingPages] = useState({});


    useEffect(() => {

        const fetch_master_resume  = async () => {
            const res = await get_master_resume();
            if (res.status === 200) {
                setMasterResume(res.data.latex_source);
            }
            else {
                setMasterResume("Error fetching resume")
            }
        }

        fetch_master_resume();
    }, [saveCount])

    useEffect(() => {

        const fetchPages = async () => {
            try {
                const r = await fetch(`${backend}/api/master_preview_meta?ts=${saveCount}`, {
                    credentials: "include",
                });
                const data = await r.json();
                const n = Math.max(1, Number(data.pages || 1));
                setPages(n);

                const next = {};
                for (let i = 1; i <= n; i++) next[i] = true;
                setLoadingPages(next);

            } catch (e) {
                setPages(1);
                setLoadingPages({ 1: true });
            }
        };

    fetchPages();
    }, [saveCount]);


    const downloadResume = async () => {
    try {
        const url = `${backend}/api/get_master_pdf?ts=${saveCount}`;

        const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        });

        if (!resp.ok) {

        let msg = `Failed to download PDF (${resp.status})`;
        try {
            const j = await resp.json();
            if (j?.error) msg = j.error;
            if (j?.latex_len !== undefined) msg += `\n(latex_len=${j.latex_len})`;
        } catch {}
        throw new Error(msg);
        }

        const blob = await resp.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "master_resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error(e);
        setErrorMessage(String(e.message || e));
        setShowErrorMessage(true);
        setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
        }, 5000);
    }
    };

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
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: pages }, (_, idx) => {
                            const page = idx + 1;
                            const isLoading = loadingPages[page] !== false;

                            return (
                                <div key={page} className="w-full bg-white rounded-lg relative">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <img
                                    key={`${saveCount}-${page}`}
                                    src={`${backend}/api/get_master_preview?page=${page}&ts=${saveCount}`}
                                    className={`w-full rounded-lg ${isLoading ? "opacity-30" : ""}`}
                                    onLoad={() => setLoadingPages((p) => ({ ...p, [page]: false }))}
                                    onError={() => setLoadingPages((p) => ({ ...p, [page]: false }))}
                                    alt={`Resume preview page ${page}`}
                                />

                                <div className="text-xs text-gray-500 px-2 py-1">Page {page}</div>
                                </div>
                            );
                            })}
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
