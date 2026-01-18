import React, { useEffect, useState } from "react";
import { get_master_resume, update_master_resume } from "./api/api";
import "../../src/index.css";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const MasterResume = ({ onBack }) => {
  const [masterResume, setMasterResume] = useState("");

  const [saveCount, setSaveCount] = useState(0);

  const [pages, setPages] = useState(0);
  const [loadingPages, setLoadingPages] = useState({});

  const [status, setStatus] = useState("Loading...");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load master latex
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await get_master_resume();
        if (res.status === 200) {
          setMasterResume(res.data.latex_source ?? "");
          setStatus("Loaded");
        } else {
          setStatus("Failed to load");
        }
      } catch (e) {
        console.error(e);
        setStatus("Failed to load");
      }
    };

    fetchMaster();
  }, [saveCount]);

  // Fetch page count + init page loading flags
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
        console.error(e);
        setPages(1);
        setLoadingPages({ 1: true });
      }
    };

    fetchPages();
  }, [saveCount]);

  const downloadResume = async () => {
    try {
      const url = `${backend}/api/get_master_pdf?ts=${saveCount}`;
      const resp = await fetch(url, { method: "GET", credentials: "include" });

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
    try {
      setStatus("Saving...");
      const res = await update_master_resume(masterResume);

      if (res && res.status === 200) {
        setStatus("Saved");
        setSuccessMessage("Resume saved");
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage("");
        }, 3000);

        setSaveCount((c) => c + 1);
      } else {
        setStatus("Save failed");
        setErrorMessage("Error: Unable to save resume");
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
          setErrorMessage("");
        }, 3000);
      }
    } catch (e) {
      console.error(e);
      setStatus("Save failed");
      setErrorMessage("Error: Unable to save resume");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col gap-2 w-[90%]">
        <div className="w-full flex items-center justify-between">
          <div className="text-sm text-gray-300">Status: {status}</div>

          <div className="flex gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="bg-transparent border border-gray-400 text-gray-200 rounded px-4 py-2 hover:bg-white/10 transition"
              >
                Back
              </button>
            )}

            <button
              onClick={downloadResume}
              className="bg-[#224378] text-white rounded px-4 py-2 hover:bg-[#1b355f] transition"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-8">
          <div className="w-[50%]">
            <textarea
              value={masterResume}
              onChange={(e) => setMasterResume(e.target.value)}
              className="bg-[#393737] text-white rounded p-2 border w-[100%] h-[100vh]"
            />
          </div>

          <div className="w-[50%] rounded-lg">
            <div className="flex flex-col gap-4">
              {pages === 0 ? (
                <div className="text-gray-400 text-sm">Generating preview…</div>
              ) : (
                Array.from({ length: pages }, (_, idx) => {
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
                })
              )}
            </div>
          </div>
        </div>

        <button onClick={saveResume} className="bg-[#224378] text-white rounded py-2">
          Save
        </button>

        {showSuccessMessage && (
          <div className="bg-green-800/90 text-white px-4 py-2 rounded mb-4">{successMessage}</div>
        )}

        {showErrorMessage && (
          <div className="bg-red-800/90 text-white px-4 py-2 rounded mb-4 whitespace-pre-wrap">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterResume;
