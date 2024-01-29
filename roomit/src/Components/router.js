import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './login';
import AdminDashboard from './A_dashboard';
import FacultyDashboard from './F_dashboard';
import RoomCheckerDashboard from './RC_dashboard';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/room-checker" element={<RoomCheckerDashboard />} />


      </Routes>
  );
}

export default App;
