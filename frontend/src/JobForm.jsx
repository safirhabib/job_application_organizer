import React, { useState } from "react";
import axios from "axios";

const JobForm = () => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dateApplied, setDateApplied] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      company,
      role,
      date_applied: dateApplied
    };

    try {
      const res = await axios.post("/api/jobs/", formData);
      console.log("Job created:", res.data);

      // Reset form
      setCompany("");
      setRole("");
      setDateApplied("");
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        required
      />

      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Role"
        required
      />

      <input
        type="date"
        value={dateApplied}
        onChange={(e) => setDateApplied(e.target.value)}
        required
      />

      <button type="submit">Create Job</button>
    </form>
  );
};

export default JobForm;