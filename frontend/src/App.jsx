import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "./index.css";
import MasterResume from './components/master_resume'
import JobForm from './JobForm'; //Umran US1

function App() {
  return (
    <div>
      <MasterResume />
      <JobForm />
    </div>
  )
}

export default App;
