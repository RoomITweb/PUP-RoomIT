import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';

function RCFacultyScanHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [showRoomStatistics, setShowRoomStatistics] = useState(false);
  const [roomStatisticsData, setRoomStatisticsData] = useState({});
  const database = getDatabase(app);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const historyRef = ref(database, 'history');
        const historySnapshot = await get(historyRef);

        if (historySnapshot.exists()) {
          const historyData = historySnapshot.val();
          const historyArray = Object.keys(historyData).map(key => historyData[key]);
          setHistoryData(historyArray);
        }
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };

    fetchHistoryData();
  }, [database]);
  
  const formatTime = (time) => {
    const date = new Date(time);
    const formattedTime = date.toLocaleString();
    return formattedTime;
  };

  const handleDeleteHistory = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete the entire scan history? This action cannot be undone.');

    if (confirmDelete) {
      try {
        const historyRef = ref(database, 'history');
        await remove(historyRef);
        setHistoryData([]); // Clear historyData state after deletion
        setFilteredData([]); // Clear filteredData state after deletion
        alert('Scan history deleted successfully.');
      } catch (error) {
        console.error('Error deleting history:', error);
        alert('Failed to delete scan history.');
      }
    }
  };

  const handleViewRoomStatistics = () => {
    // Filtered data based on building filter
    let filteredResults = [...historyData];
  
    if (buildingFilter !== 'All') {
      filteredResults = filteredResults.filter(entry => entry.building === buildingFilter);
    }
  
    // Create an object to store room frequency per month
    const roomStatistics = {};
  
    filteredResults.forEach(entry => {
      const entryDate = new Date(entry.attendTime); // Assuming `entry.time` is the date field
      const monthYearKey = `${entryDate.getFullYear()}-${entryDate.getMonth() + 1}`;
  
      if (!roomStatistics[monthYearKey]) {
        roomStatistics[monthYearKey] = {};
      }
  
      const roomKey = entry.room;
      roomStatistics[monthYearKey][roomKey] = (roomStatistics[monthYearKey][roomKey] || 0) + 1;
    });
  
    // Calculate room usage percentage per month
    const roomStatisticsPercentage = {};
  
    Object.keys(roomStatistics).forEach(monthYearKey => {
      const totalEntries = Object.values(roomStatistics[monthYearKey]).reduce((total, count) => total + count, 0);
      roomStatisticsPercentage[monthYearKey] = {};
  
      Object.keys(roomStatistics[monthYearKey]).forEach(roomKey => {
        const roomCount = roomStatistics[monthYearKey][roomKey];
        const percentage = (roomCount / totalEntries) * 100;
        roomStatisticsPercentage[monthYearKey][roomKey] = percentage.toFixed(2);
      });
    });
  
    console.log(roomStatisticsPercentage);

    setRoomStatisticsData(roomStatisticsPercentage);
    setShowRoomStatistics(prevState => !prevState);
  };

  useEffect(() => {
    let filteredResults = [...historyData];

    if (buildingFilter !== 'All') {
      filteredResults = filteredResults.filter(entry => entry.building === buildingFilter);
    }

    if (roomFilter !== 'All') {
      filteredResults = filteredResults.filter(entry => entry.room === roomFilter);
    }

    if (semesterFilter !== 'All') {
      filteredResults = filteredResults.filter(entry => entry.semester === semesterFilter);
    }

    if (timeFilter === 'This day') {
      const today = new Date().toLocaleDateString();
      filteredResults = filteredResults.filter(entry => {
        const entryDate = new Date(entry.attendTime); // Assuming `entry.time` is the date field
        return entryDate.toLocaleDateString() === today;
      });
    } else if (timeFilter === 'This week') {
      const today = new Date();
      const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      filteredResults = filteredResults.filter(entry => {
        const entryDate = new Date(entry.attendTime); // Assuming `entry.time` is the date field
        return entryDate >= oneWeekAgo && entryDate <= today;
      });
    } else if (timeFilter === 'This month') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filteredResults = filteredResults.filter(entry => {
        const entryDate = new Date(entry.attendTime); // Assuming `entry.time` is the date field
        return entryDate >= firstDayOfMonth && entryDate <= today;
      });
    }

    filteredResults.forEach(entry => {
      console.log(entry.attendTime);
    });

    setFilteredData(filteredResults);
  }, [buildingFilter, roomFilter, semesterFilter, timeFilter, historyData]);

  const handleBuildingFilterChange = event => {
    setBuildingFilter(event.target.value);
  };

  const handleRoomFilterChange = event => {
    setRoomFilter(event.target.value);
  };

  const handleSemesterFilterChange = event => {
    setSemesterFilter(event.target.value);
  };

  const handleTimeFilterChange = event => {
    setTimeFilter(event.target.value);
  };

  const handleGenerateReport = () => {
    if (filteredData.length === 0) {
      alert('No data to generate a report.');
      return;
    }
  
    let csvContent = 'data:text/csv;charset=utf-8,';
  
    csvContent += 'Semester,Faculty Name,Building,Room,Subject Code,Subject Description,Course,Day,Lecture Hours,Time-in,Time-out\n';
  
    filteredData.forEach(entry => {
      csvContent += `${entry.semester},${entry.facultyName},${entry.building},${entry.room},${entry.subjectCode},${entry.subjectDescription},${entry.course},${entry.day},${entry.time},${entry.attendTime},${formatTime(entry.timeEnded)}\n`;
    });
  
    const encodedUri = encodeURI(csvContent);
  
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scan_report.csv');
    document.body.appendChild(link);
  
    link.click();
  
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Scan History</h2>

      <div className= "button"><button onClick={handleDeleteHistory}>Delete History</button> </div>

      <div>
        <label>Select Semester:</label>
        <div className="form-group">
        <select value={semesterFilter} onChange={handleSemesterFilterChange}>
          <option value="All">All</option>
          <option value="1st Semester">1st Semester</option>
          <option value="2nd Semester">2nd Semester</option>
          <option value="Summer">Summer</option>
        </select>
        </div>
      </div>

      <div>
        <label>Select Building:</label>
        <div className="form-group">
        <select value={buildingFilter} onChange={handleBuildingFilterChange}>
          <option value="All">All</option>
          <option value="Nantes Building">Nantes Building</option>
          <option value="Science Building">Science Building</option>
        </select>
        </div>
      </div>

      {buildingFilter === 'Nantes Building' && (
        <div>
          <label>Select Room:</label>
          <div className="form-group">
          <select value={roomFilter} onChange={handleRoomFilterChange}>
            <option value="All">All</option>
            <option value="205">205</option>
            <option value="206">206</option>
            <option value="AVR">AVR</option>
            <option value="Multimedia">Multimedia</option>
          </select>
          </div>
        </div>
      )}

      {buildingFilter === 'Science Building' && (
        <div>
          <label>Select Room:</label>
          <select value={roomFilter} onChange={handleRoomFilterChange}>
            <option value="All">All</option>
            <option value="105">105</option>
            <option value="106">106</option>
            <option value="107">107</option>
            <option value="108">108</option>
          </select>
        </div>
      )}

      <div>
        <label>Select Time:</label>
        <div className="form-group">
        <select value={timeFilter} onChange={handleTimeFilterChange}>
          <option value="All">All</option>
          <option value="This day">This day</option>
          <option value="This week">This week</option>
          <option value="This month">This month</option>
        </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p>No scan history available.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Faculty Name</th>
                <th>Building</th>
                <th>Room</th>
                <th>Subject Code</th>
                <th>Subject Description</th>
                <th>Course</th>
                <th>Day</th>
                <th>Lecture Hours</th>
                <th>Time-in</th>
                <th>Time-out</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.semester}</td>
                  <td>{entry.facultyName}</td>
                  <td>{entry.building}</td>
                  <td>{entry.room}</td>
                  <td>{entry.subjectCode}</td>
                  <td>{entry.subjectDescription}</td>
                  <td>{entry.course}</td>
                  <td>{entry.day}</td>
                  <td>{entry.time}</td>
                  <td>{entry.attendTime}</td>
                  <td>{formatTime(entry.timeEnded)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleGenerateReport}>Generate Report</button>
      <button onClick={handleViewRoomStatistics}>
        {showRoomStatistics ? 'Close Room Statistics' : 'View Room Statistics'}
      </button>

      {showRoomStatistics && (
  <div className="modal" style={{ display: showRoomStatistics ? 'block' : 'none' }}>
    <div className="modal-content">
      <span className="close" onClick={() => setShowRoomStatistics(false)}>
        &times;
      </span>
      <h2>Room Usage Statistics</h2>
      <div className="room-statistics">
        {Object.keys(roomStatisticsData).map(monthYearKey => (
          <div key={monthYearKey} className="month-statistics">
            <h3>{monthYearKey}</h3>
            <ul>
              {Object.entries(roomStatisticsData[monthYearKey]).map(([roomKey, percentage]) => (
                <li key={roomKey}>
                  Room {roomKey}: {percentage}% usage
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
</div>
);
}

export default RCFacultyScanHistory;