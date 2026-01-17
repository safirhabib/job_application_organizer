import React from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const get_master_resume = async () =>  {
    console.log("import.meta:", import.meta);
    console.log("env:", import.meta.env);
    console.log("backend:", import.meta.env?.VITE_BACKEND_URL);
    console.log("api:", `${import.meta.env.VITE_BACKEND_URL}/api/master_latex`);
    
    const backend = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.get(`${backend}/api/get_master_latex`, {withCredentials: true});
    console.log(res.data);

    return {
        status: 200,
        data: {content: res.data.latex_source},
    };
}

export const update_master_resume = async (latex_source) => {
    const backend = import.meta.env.VITE_BACKEND_URL;
    console.log(`${backend}/api/update_master_latex`);
    const res = await axios.post(`${backend}/api/update_master_latex`, { latex_source }, { withCredentials: true })

    console.log(res);
    return {
        status: 200,
        data: {content: "success"},
    }
}
