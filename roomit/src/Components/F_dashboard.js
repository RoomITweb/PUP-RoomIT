import React, { useState } from 'react';
import FacultySchedule from './F_classSched';
import Logout from './logout';
import pupLogo from './logo_web.png';
import './C_facultySched.css';
import 'bootstrap/dist/css/bootstrap.css';

function FacultyDashboard() {
  const [showFacultySchedule, setShowFacultySchedule] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [arrowRotation, setArrowRotation] = useState(false);

  const toggleFacultySchedule = () => {
    setShowFacultySchedule(true);
    setShowLogout(false);
  };

  const toggleLogout = () => {
    setShowFacultySchedule(false);
    setShowLogout(true);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
        setArrowRotation(!arrowRotation); // Toggle dropdown visibility
  };

  return (
    <div className="nav">
        <div className="faculty-dashboard">
        <img 
        src={pupLogo} 
        className="Roomit_Logo"
        style= {{marginRight: '30%'}}
        alt="Roomit Logo" />
        <div className="dropdown" style={{ position: 'absolute', marginLeft: '64%' }}>
          <button 
            className="btn btn-secondary dropdown-toggle" 
            onClick={toggleDropdown}
            >
            <span className={`arrow ${arrowRotation ? 'up' : 'down'}`}>&#9660;</span>
          </button>
          <div className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
            <a className="dropdown-item" href="#" onClick={toggleFacultySchedule}>
              My Schedule
            </a>
            <a className="dropdown-item" href="#" onClick={toggleLogout}>
              Logout
            </a>
          </div>
        </div>
      </div>
      <h1 style = {{textAlign: 'left'}}></h1>
      <div className="content">
      {showFacultySchedule && <FacultySchedule />}
      {showLogout && <Logout />}
</div>

    </div>
  
  );
}

export default FacultyDashboard;
