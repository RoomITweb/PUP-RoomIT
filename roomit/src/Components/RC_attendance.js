import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebase';
import './C_viewRoom.css';
import 'bootstrap/dist/css/bootstrap.css';

function RcAttendance({ facultySchedules }) {
  const [rooms, setRooms] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomInfoModalOpen, setRoomInfoModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const database = getDatabase(app);

  useEffect(() => {
    const roomsRef = ref(database, 'rooms');

    onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRooms(data);
      }
    });

    return () => {
      // Pwede itong gawin kung nais mong i-unsubscribe ang listener
      // sa pag-unmount ng component.
    };
  }, [database]);

  const isRoomOccupied = (room) => {
    if (rooms[room] && rooms[room].facultyName) {
      const { facultyName, subjectDescription, course, time, attendedTime } = rooms[room];
      return `${facultyName} is teaching ${subjectDescription} (${course}) at ${time}. Attended at ${attendedTime}.`;
    } else {
      return 'Available';
    }
  };

  const containerStyle = {
    maxWidth: '800px',
    width: '100%',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const roomStyle = {
    width: '48%',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  };

  const roomOccupiedStyle = {
    backgroundColor: '#ff6b6b',
    color: 'white',
  };

  const roomAvailableStyle = {
    backgroundColor: '#68b468',
    color: 'white',
  };

  const buildingSelectorStyle = {
    marginBottom: '20px',
  };

  const roomInfoModalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const roomInfoContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    maxWidth: '400px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  };

  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
    setSelectedRoom(null);
  };

  const getRoomsByBuilding = () => {
    if (selectedBuilding === 'Nantes Building') {
      return ['120', '121', '122', 'AVR', 'Keyboarding Lab', 'Speech Lab'];
    } else if (selectedBuilding === 'Science Building') {
      return ['105', '106', '107', '108', '203', '204', '205', '206'];
    }else if (selectedBuilding === 'Suarez Building') {
      return ['Com Lab 1', 'Com Lab 2'];
    }else {
      return [];
    }
  };

  const roomClickHandler = (room) => {
    if (rooms[room] && rooms[room].facultyName) {
      setSelectedRoom(room);
      setRoomInfoModalOpen(true);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Attendance</h2>
      <div style={buildingSelectorStyle}>
      <label style={{fontFamily: 'Regular'}}>Select Building</label>
        <div className="select-dropdown">
        <select
          onChange={handleBuildingChange}
          value={selectedBuilding}
          style = {{marginBottom: '20px', marginTop: '20px'}}
        >
          <option style={{fontFamily: 'Regular'}}value="All">Building</option>
          <option style={{fontFamily: 'Regular'}}value="Nantes Building">Nantes Building</option>
          <option style={{fontFamily: 'Regular'}}value="Science Building">Science Building</option>
          <option style={{fontFamily: 'Regular'}}value="Suarez Building">Suarez Building</option>
          </select>
        </div>
      </div>
      <p style={{fontFamily: 'Bold', marginBottom: '10px', textTransform: 'uppercase'}}>{selectedBuilding}</p>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{fontFamily: 'Semibold'}}>ROOM</th>
            <th style={{fontFamily: 'Semibold'}}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {getRoomsByBuilding().map((room) => (
            <tr
              key={room}
              style={{
                ...(rooms[room] && rooms[room].facultyName ? roomOccupiedStyle : roomAvailableStyle),
              }}
              onClick={() => roomClickHandler(room)}
            >
              <td>{room}</td>
              <td>{isRoomOccupied(room)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RcAttendance;
