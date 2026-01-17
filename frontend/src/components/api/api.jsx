import React from "react";
import axios from "axios";

export const get_master_resume = async () =>  {
    console.log("import.meta:", import.meta);
    console.log("env:", import.meta.env);
    console.log("backend:", import.meta.env?.VITE_BACKEND_URL);
    console.log("api:", `${import.meta.env.VITE_BACKEND_URL}/api/master_latex`);
    
    const backend = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.get(`${backend}/api/master_latex`, {withCredentials: true});
    console.log(res.data);

    return {
        status: 200,
        data: {content: res.data.latex_source}
    };
}
