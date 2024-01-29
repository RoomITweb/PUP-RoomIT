import React, { useState } from 'react';
import UserRegistration from './A_regUser';
import AddSubject from './A_addSubj';
import ViewUsers from './A_viewUser';
import AddSchedule from './A_addSched';
import ViewSched from './A_viewSched';
import ViewRoom from './A_viewRoom';
import Analytics from './A_analytics';
import FacultyScanHistory from './A_history';
import './C_faculty_attendance.css';
import pupLogo from './logo_web.png';
import Logout from './logout';
import 'bootstrap/dist/css/bootstrap.css';


function AdminDashboard() {
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showUserRegistration, setShowUserRegistration] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showViewUsers, setShowViewUsers] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showViewSched, setShowViewSched] = useState(false);
  const [showViewRoom, setShowViewRoom] = useState(false);
  const [showFacultyScanHistory, setShowFacultyScanHistory] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const toggleAnalytics = () => {
    setShowAnalytics(true);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleUserRegistration = () => {
    setShowAnalytics(false);
    setShowUserRegistration(true);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleAddSubject = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(true);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleViewUsers = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(true);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleAddSchedule = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(true);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleViewSched = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(true);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleViewRoom = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(true);
    setShowFacultyScanHistory(false);
    setShowLogout(false);
  };

  const toggleFacultyScanHistory = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(true);
    setShowLogout(false);
  };

  const toggleLogout = () => {
    setShowAnalytics(false);
    setShowUserRegistration(false);
    setShowAddSubject(false);
    setShowViewUsers(false);
    setShowAddSchedule(false);
    setShowViewSched(false);
    setShowViewRoom(false);
    setShowFacultyScanHistory(false);
    setShowLogout(true);
  };

  return (
    <div 
    className="container-fluid"
    style = {{width: '100%'}}>
      <div className="nav">
          <div className="admin-dashboard">
            <img src={pupLogo} className="Roomit_Logo" alt="Roomit Logo" />
            <ul className="list-unstyled">
            <li>
                <a
                  href="#"
                  onClick={toggleAnalytics}
                  className="nav-link"
                >
                  Room Statistics
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleUserRegistration}
                  className="nav-link"
                >
                  Add User
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleAddSubject}
                  className="nav-link"
                >
                  Add Subject
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleViewUsers}
                  className="nav-link"
                >
                  View User
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleAddSchedule}
                  className="nav-link"
                >
                  Add Schedule
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleViewSched}
                  className="nav-link"
                >
                  View Schedule
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleViewRoom}
                  className="nav-link"
                >
                  View Room
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleFacultyScanHistory}
                  className="nav-link"
                >
                  History
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={toggleLogout}
                  className="nav-link logout-button"
                >
                  Log out
                </a>
              </li>
            </ul>
          </div>
        <div className="content">
        {showAnalytics && <Analytics />}
        {showUserRegistration && <UserRegistration />}
      {showAddSubject && <AddSubject />}
      {showViewUsers && <ViewUsers />}
      {showAddSchedule && <AddSchedule />}
      {showViewSched && <ViewSched />}
      {showViewRoom && <ViewRoom />}
      {showFacultyScanHistory && <FacultyScanHistory />}
      {showLogout && <Logout />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
