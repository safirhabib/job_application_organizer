import React from "react";

export default function Navbar({ onDashboard, onAdd, onMasterResume, disableAdd = false }) {
  return (
    <header className="navbar w-full">
      <div className="logo" role="button" tabIndex={0} onClick={onDashboard}>
        Job Applications
      </div>
      <nav className="navActions">
        <button className="ghost" onClick={onDashboard}>Dashboard</button>
        <button className="ghost" onClick={onMasterResume}>Master Resume</button>
        <button className="primary" onClick={onAdd} disabled={disableAdd}>
          Add Application
        </button>
      </nav>
    </header>
  );
}

