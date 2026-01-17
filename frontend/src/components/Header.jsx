import React from "react";

export default function Header({ subtitle }) {
  return (
    <header className="header">
      <div>
        <h1>Job Application Organizer</h1>
        <p className="muted">{subtitle}</p>
      </div>
    </header>
  );
}
