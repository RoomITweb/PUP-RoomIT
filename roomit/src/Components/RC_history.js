import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';
import './FacultyScanHistory.css'; 
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';  // Import xlsx library

function RCFacultyScanHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const schoolYear = '2023-2024';
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
        // Kunin ang kasalukuyang history data mula sa database
        const historySnapshot = await get(historyRef);
  
        if (historySnapshot.exists()) {
          // Tanggalin ang history sa database
          await remove(historyRef);
          setHistoryData([]); // Clear historyData state after deletion
          setFilteredData([]); // Clear filteredData state after deletion
          alert('Scan history deleted successfully.');
        } else {
          alert('No scan history found.');
        }
      } catch (error) {
        console.error('Error deleting history:', error);
        alert('Failed to delete scan history.');
      }
    }
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

  const handleGenerateReport = async () => {
    if (filteredData.length === 0) {
      alert('No data to generate a report.');
      return;
    }
  
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Scan Report');
  
      // Headers
      worksheet.addRow(['Semester', 'Faculty Name', 'Building', 'Room', 'Subject Code', 'Subject Description', 'Course', 'Day', 'Lecture Hours', 'Time-in', 'Time-out']);
  
      // Data
      filteredData.forEach(entry => {
        worksheet.addRow([
          entry.semester,
          entry.facultyName,
          entry.building,
          entry.room,
          entry.subjectCode,
          entry.subjectDescription,
          entry.course,
          entry.day,
          entry.time,
          formatTime(entry.attendTime),
          formatTime(entry.timeEnded),
        ]);
      });
  
      // Set row and column properties
      worksheet.getRow(1).font = { bold: true }; // Make header row bold
  
      // Set column widths
      worksheet.columns = [
        { width: 15 },
        { width: 20 },
        { width: 15 },
        { width: 10 },
        { width: 15 },
        { width: 30 },
        { width: 15 },
        { width: 10 },
        { width: 15 },
        { width: 20 },
        { width: 20 }
      ];
  
      const blob = await workbook.xlsx.writeBuffer();
      const data = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(data);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scan_report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report.');
    }
  };
  
  
const handleSaveImage = () => {
  const table = document.querySelector('.table-container table');
  if (!table) {
    alert('No table data to save as image.');
    return;
  }

  html2canvas(table).then((canvas) => {
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = 'scan_report.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
  
const handlePrint = () => {
  window.print();
};
  

  return (
    <div>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Scan History</h2>
      <h3>School Year {schoolYear}</h3>

      <button onClick={handleDeleteHistory}>Delete History</button>

      <div>
        <label>Select Semester:</label>
        <select value={semesterFilter} onChange={handleSemesterFilterChange}>
          <option value="All">All</option>
          <option value="1st Semester">1st Semester</option>
          <option value="2nd Semester">2nd Semester</option>
          <option value="Summer">Summer</option>
        </select>
      </div>

      <div>
        <label>Select Building:</label>
        <select value={buildingFilter} onChange={handleBuildingFilterChange}>
          <option value="All">All</option>
          <option value="Nantes Building">Nantes Building</option>
          <option value="Science Building">Science Building</option>
          <option value="Suarez Building">Suarez Building</option>
        </select>
      </div>

      {buildingFilter === 'Nantes Building' && (
        <div>
          <label>Select Room:</label>
          <select value={roomFilter} onChange={handleRoomFilterChange}>
            <option value="All">All</option>
            <option value="120">120</option>
            <option value="121">121</option>
            <option value="122">122</option>
            <option value="AVR">AVR</option>
            <option value="Keyboaring Lab">Keyboaring Lab</option>
            <option value="Speech Lab">Speech Lab</option>
          </select>
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
            <option value="203">203</option>
            <option value="204">204</option>
            <option value="205">205</option>
            <option value="206">206</option>
          </select>
        </div>
      )}

    {buildingFilter === 'Suarez Building' && (
        <div>
          <label>Select Room:</label>
          <select value={roomFilter} onChange={handleRoomFilterChange}>
            <option value="All">All</option>
            <option value="Com Lab 1">Com Lab 1</option>
            <option value="Com Lab 2">Com Lab 2</option>
          </select>
        </div>
      )}

      <div>
        <label>Select Time:</label>
        <select value={timeFilter} onChange={handleTimeFilterChange}>
          <option value="All">All</option>
          <option value="This day">This day</option>
          <option value="This week">This week</option>
          <option value="This month">This month</option>
        </select>
      </div>

      {filteredData.length === 0 ? (
        <p>No scan history available.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
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
      <button onClick={handleSaveImage}>Save as Image</button>
      <button onClick={handlePrint}>Print</button>
</div>
);
}

export default RCFacultyScanHistory;