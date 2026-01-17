import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const get_master_resume = async () => {
  const res = await axios.get(`${backend}/api/get_master_latex`, { withCredentials: true });
  return {
    status: res.status,
    data: { content: res.data.latex_source },
  };
};

export const update_master_resume = async (latex_source) => {
  const res = await axios.post(
    `${backend}/api/update_master_latex`,
    { latex_source },
    { withCredentials: true }
  );
  return {
    status: res.status,
    data: { content: "success" },
  };
};

export const get_tailored_resume = async (clientJobId) => {
  const res = await axios.get(`${backend}/api/tailored/${clientJobId}/`, {
    withCredentials: true,
  });
  return {
    status: res.status,
    data: { content: res.data.content, exists: res.data.exists },
  };
};

export const update_tailored_resume = async (clientJobId, latex_source) => {
  const res = await axios.post(
    `${backend}/api/tailored/${clientJobId}/update/`,
    { latex_source },
    { withCredentials: true }
  );
  return {
    status: res.status,
    data: { content: "success" },
  };
};

export const clone_tailored_resume = async (clientJobId) => {
  const res = await axios.post(
    `${backend}/api/tailored/${clientJobId}/clone/`,
    {},
    { withCredentials: true }
  );
  return {
    status: res.status,
    data: { content: res.data.content },
  };
};
