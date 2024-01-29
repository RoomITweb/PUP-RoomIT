import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './firebase';
import './C_viewRoom.css';
import 'bootstrap/dist/css/bootstrap.css';

function ViewRoom({ facultySchedules }) {
  const [rooms, setRooms] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomInfoModalOpen, setRoomInfoModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(false); 
  const [facultySchedulesInRoom, setFacultySchedulesInRoom] = useState([]);
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
      const { facultyName, subject, course, time } = rooms[room];
      return `${facultyName} is teaching ${subject} (${course}) at ${time}`;
    } else {
      return 'Available';
    }
  };

  const getFacultySchedulesInRoom = (room) => {
    const schedulesRef = ref(database, 'schedules');
  
    onValue(schedulesRef, (snapshot) => {
      if (snapshot.exists()) {
        const schedulesData = snapshot.val();
        const schedulesInRoom = Object.values(schedulesData).filter(
          (schedule) => schedule.room === room
        );
        setFacultySchedulesInRoom(schedulesInRoom);
      } else {
        setFacultySchedulesInRoom([]);
      }
    });
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

  const roomContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    backgroundColor: 'maroon',
    color: 'white',
  };

  const roomAvailableStyle = {
    backgroundColor: 'green',
    color: 'white',
  };

  const buildingSelectorStyle = {
    marginBottom: '20px',
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
    setSelectedRoom(room);
    setRoomInfoModalOpen(true);
    getFacultySchedulesInRoom(room);
  };

  return (
    <div style={containerStyle}>
      <h2
        >View Room Occupancy</h2>
      <div style={buildingSelectorStyle}>
        <label>Select Building: </label>
        <div className="select-dropdown">
        <select
          onChange={handleBuildingChange}
          value={selectedBuilding}
          style={{marginBottom: '20px', marginTop: '20px'}}
        >
          <option value="All">Building</option>
          <option value="Nantes Building">Nantes Building</option>
          <option value="Science Building">Science Building</option>
          <option value="Suarez Building">Suarez Building</option>
        </select>
        </div>
      </div>
      
      <div className="room-legend">
      <div className="occupied-legend">
        <span
        style={{color: '#ff6b6b'}}>
          Occupied</span>
      </div>
      <div className="available-legend">
        <span
        style={{color: '#68b468'}}
          >Available</span>
      </div>
    </div>
    
    <p style={{marginBottom: '10px', textTransform: 'uppercase'}}>{selectedBuilding}</p>
    <div className="room-container">
      {getRoomsByBuilding().map((room) => {
        return (
          <div
            key={room}
            className={`room-card ${rooms[room] && rooms[room].facultyName ? 'occupied' : 'available'}`}
            onClick={() => roomClickHandler(room)}
          >
            {room}
          </div>
        );
      })}
    </div>
    {selectedRoom && roomInfoModalOpen && (
  <div className="room-info-modal">
    <div className="room-info-content">
      <h3 style={{ fontFamily: 'Heavy'}}>ROOM INFO</h3>
      <p>Room: {selectedRoom}</p>
      {rooms[selectedRoom] && rooms[selectedRoom].facultyName ? (
        <>
          <p>Occupied by: {rooms[selectedRoom].facultyName}</p>
          <p>Subject: {rooms[selectedRoom].subjectCode}: {rooms[selectedRoom].subjectDescription}</p>
          <p>Course: {rooms[selectedRoom].course}</p>
          <p>Day: {rooms[selectedRoom].day}</p>
          <p>Time: {rooms[selectedRoom].time}</p>
        </>
      ) : (
        <>
          <p>No current occupancy.</p>
{facultySchedulesInRoom.length > 0 && (
  <>
    <table>
      <thead>
        <tr>
          <th>Faculty</th>
          <th>Subject</th>
          <th>Time</th>
          <th>Day</th>
        </tr>
      </thead>
      <tbody>
        {facultySchedulesInRoom.map((schedule, index) => (
          <tr key={index}>
            <td>{schedule.facultyName}</td>
            <td>{schedule.subjectDescription}</td>
            <td>{schedule.time}</td>
            <td>{schedule.day}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}
        </>
      )}
      <button onClick={() => setRoomInfoModalOpen(false)}>Close</button>
    </div>
  </div>
    )}
    </div>
  );
}

export default ViewRoom;
