import React, { useState } from 'react';
import RcViewRoom from './RC_viewRoom';
import RcAttendance from './RC_attendance';
import RCFacultyScanHistory from './RC_history';
import Logout from './logout';
import pupLogo from './logo_web.png';
import dropdownMenu from './resources/hamburger-menu-icon.webp'
import './C_viewRoom.css';
import 'bootstrap/dist/css/bootstrap.css';

function RoomCheckerDashboard() {
  const [showRcViewRoom, setShowRcViewRoom] = useState(false);
  const [showRcAttendance, setShowRcAttendance] = useState(true);
  const [showRCFacultyScanHistory, setShowRCFacultyScanHistory] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [arrowRotation, setArrowRotation] = useState(false);

  const toggleRcViewRoom = () => {
    setShowRcViewRoom(true);
    setShowRcAttendance(false);
    setShowRCFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleRcAttendance = () => {
    setShowRcViewRoom(false);
    setShowRcAttendance(true);
    setShowRCFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleRCFacultyScanHistory = () => {
    setShowRcViewRoom(false);
    setShowRcAttendance(false);
    setShowRCFacultyScanHistory(true);
    setShowLogout(false);
  };

  const toggleLogout = () => {
    setShowRcViewRoom(false);
    setShowRcAttendance(false);
    setShowRCFacultyScanHistory(false);
    setShowLogout(true);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
        setArrowRotation(!arrowRotation); // Toggle dropdown visibility
  };

  return (
    <div className="nav">
    <div className="room-checker-dashboard" >
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
            <a className="dropdown-item" href="#" onClick={toggleRcViewRoom}>
              View Room
            </a>
            <a className="dropdown-item" href="#" onClick={toggleRcAttendance}>
              Attendance
            </a>
            <a className="dropdown-item" href="#" onClick={toggleRCFacultyScanHistory}>
              History
            </a>
            <a className="dropdown-item" href="#" onClick={toggleLogout}>
              Logout
            </a>
          </div>
        </div>
      </div>
      <div className="content">
      {showRcViewRoom && <RcViewRoom />}
      {showRcAttendance && <RcAttendance />}
      {showRCFacultyScanHistory && <RCFacultyScanHistory />}
      {showLogout && <Logout />}
      </div>

    </div>
  );
}

export default RoomCheckerDashboard;
