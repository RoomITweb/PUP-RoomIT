import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';
import Chart from 'chart.js/auto';

function calculateDurationInHours(attendTime, timeEnded) {
  const start = new Date(attendTime);
  const end = new Date(timeEnded);
  const durationInMilliseconds = end - start;
  return durationInMilliseconds / (1000 * 60 * 60);
}

function calculateBuildingUsage(buildingStatisticsData) {
  const buildingData = Object.entries(buildingStatisticsData);

  // Sort the buildings based on usage count
  const sortedBuildingData = buildingData.sort((a, b) => b[1] - a[1]);

  // Extract the most and least used buildings
  const mostUsedBuilding = sortedBuildingData[0] ? sortedBuildingData[0][0] : null;
  const leastUsedBuilding = sortedBuildingData[sortedBuildingData.length - 1]
    ? sortedBuildingData[sortedBuildingData.length - 1][0]
    : null;

  return { mostUsedBuilding, leastUsedBuilding };
}

function calculateRoomUsageByCourse(historyData, selectedFromDate, selectedToDate) {
  const roomUsageByCourse = {};

  historyData.forEach(entry => {
    const courseKey = entry.course;
    const roomKey = entry.room;
    
    if (!roomUsageByCourse[courseKey]) {
      roomUsageByCourse[courseKey] = {};
    }

    if (!roomUsageByCourse[courseKey][roomKey]) {
      roomUsageByCourse[courseKey][roomKey] = 0;
    }

    roomUsageByCourse[courseKey][roomKey]++;
  });

  return roomUsageByCourse;
}



function createChart(ctx, labels, data, type) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: type === 'bar' ? 'Building Entries' : 'Room Entries',
        data: data,
        backgroundColor: labels.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    },
    options: {
      indexAxis: type === 'bar' ? 'y' : 'x',
      plugins: {
        legend: {
          display: type === 'bar',
        }
      }
    }
  });
}

function Analytics() {
  const [historyData, setHistoryData] = useState([]);
  const [buildingStatisticsData, setBuildingStatisticsData] = useState({});
  const [roomStatisticsData, setRoomStatisticsData] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [mostUsedRoom, setMostUsedRoom] = useState(null);
  const [leastUsedRoom, setLeastUsedRoom] = useState(null);
  const [allWeeks, setAllWeeks] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  const database = getDatabase(app);
  const buildingChartRef = useRef(null);
  const roomChartRef = useRef(null);
  const roomBarChartRef = useRef(null);

  const [mostUsedBuilding, setMostUsedBuilding] = useState(null);
  const [leastUsedBuilding, setLeastUsedBuilding] = useState(null);

  const [mostUsedRoomByBuilding, setMostUsedRoomByBuilding] = useState({});
  const [leastUsedRoomByBuilding, setLeastUsedRoomByBuilding] = useState({});

  const [roomRankings, setRoomRankings] = useState({});
  const [roomUsageByCourse, setRoomUsageByCourse] = useState({});

  const buildingsAndRooms = {
    'Nantes Building': ['120', '121', '122', 'AVR', 'Keyboarding Lab', 'Speech Lab'],
    'Science Building': ['105', '106', '107', '108', '203', '204', '205', '206'],
    'Suarez Building': ['Com Lab 1', 'Com Lab 2'],
  };

  const calculateRoomUsageByBuilding = (selectedPeriod) => {
    const roomUsageByBuilding = {};
  
    // Iterate over buildings
    Object.keys(buildingsAndRooms).forEach((building) => {
      const rooms = buildingsAndRooms[building];
  
      // Calculate room usage for each room
      const roomUsage = rooms.map((room) => {
        const entriesForRoom = filteredHistoryData.filter((entry) => entry.room === room);
        const entryDurationForRoom = entriesForRoom.reduce(
          (totalDuration, entry) => totalDuration + calculateDurationInHours(entry.attendTime, entry.timeEnded),
          0
        );
  
        return { room, entryDurationForRoom };
      });
  
      // Sort rooms by usage
      roomUsage.sort((a, b) => b.entryDurationForRoom - a.entryDurationForRoom);
  
      // Set most and least used room for the building
      const mostUsedRoom = roomUsage[0];
      const leastUsedRoom = roomUsage[roomUsage.length - 1];
  
      roomUsageByBuilding[building] = {
        mostUsedRoom,
        leastUsedRoom,
      };
    });
  
    return roomUsageByBuilding;
  };


  
  function calculateRoomRankingsByBuilding() {
    const roomRankingsByBuilding = {};
  
    Object.keys(buildingsAndRooms).forEach(building => {
      const rooms = buildingsAndRooms[building];
      const roomRankings = rooms
        .map(room => ({ room, count: roomStatisticsData[room] || 0 }))
        .sort((a, b) => b.count - a.count);
  
      roomRankingsByBuilding[building] = roomRankings;
    });
  
    setRoomRankings(roomRankingsByBuilding);
  }
  
  function createBarChart(ctx, labels, data) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Room Usage',
          data: data,
          backgroundColor: labels.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`),
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        indexAxis: 'x',
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }
  

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const database = getDatabase(app);
        const historyRef = ref(database, 'history');
        const historySnapshot = await get(historyRef);

        if (historySnapshot.exists()) {
          const historyData = historySnapshot.val();
          const historyArray = Object.keys(historyData).map(key => historyData[key]);
          setHistoryData(historyArray);
        }
      } catch (error) {
        console.error('Error fetching history data:', error);
        // Handle error state if needed
      }
    };

    fetchHistoryData();
  }, []);


  useEffect(() => {
    // Extract all unique weeks, months, and courses from historyData
    const uniqueWeeks = [...new Set(historyData.map(entry => entry.week))];
    const uniqueMonths = [...new Set(historyData.map(entry => entry.month))];
    const uniqueCourses = [...new Set(historyData.map(entry => entry.course))];

    setAllWeeks(uniqueWeeks);
    setAllMonths(uniqueMonths);
    setAllCourses(uniqueCourses);
  }, [historyData]);

  const calculateStatistics = () => {
    const buildingStatistics = {};
    const roomStatistics = {};

    historyData.forEach(entry => {
      const buildingKey = entry.building;
      buildingStatistics[buildingKey] = (buildingStatistics[buildingKey] || 0) + 1;

      const roomKey = entry.room;
      roomStatistics[roomKey] = (roomStatistics[roomKey] || 0) + 1;
    });

    setBuildingStatisticsData(buildingStatistics);
    setRoomStatisticsData(roomStatistics);
  };

  useEffect(() => {
    calculateStatistics();
  }, [historyData]);

  useEffect(() => {
    destroyCharts();
    createBuildingChart();
    createRoomChart();
  }, [buildingStatisticsData, roomStatisticsData]);
  

  useEffect(() => {
    const { mostUsedBuilding, leastUsedBuilding } = calculateBuildingUsage(buildingStatisticsData);
    setMostUsedBuilding(mostUsedBuilding);
    setLeastUsedBuilding(leastUsedBuilding);
  }, [buildingStatisticsData]);

  const destroyCharts = () => {
    if (buildingChartRef.current) {
      buildingChartRef.current.destroy();
    }

    if (roomChartRef.current) {
      roomChartRef.current.destroy();
    }

    if (roomBarChartRef.current) {
      roomBarChartRef.current.destroy();
    }
  };

  const createBuildingChart = () => {
    const buildingLabels = Object.keys(buildingStatisticsData);
    const buildingData = Object.values(buildingStatisticsData);
    const buildingCtx = document.getElementById('buildingChart').getContext('2d');
    buildingChartRef.current = createChart(buildingCtx, buildingLabels, buildingData, 'pie');
  };

  function createRoomChart() {
    const allRoomsSet = new Set();
    Object.values(buildingsAndRooms).forEach(rooms => {
      rooms.forEach(room => allRoomsSet.add(room));
    });
  
    const allRooms = Array.from(allRoomsSet);
    allRooms.forEach(room => {
      if (!roomStatisticsData.hasOwnProperty(room)) {
        roomStatisticsData[room] = 0;
      }
    });
  
    const roomLabels = allRooms.map(room => `Room ${room}`);
    const roomData = allRooms.map(room => roomStatisticsData[room]);
  
    const roomBarCtx = document.getElementById('roomBarChart').getContext('2d');
    roomBarChartRef.current = createBarChart(roomBarCtx, roomLabels, roomData);
  }
  

  const handleFromDateChange = (event) => {
    setSelectedFromDate(event.target.value);
  };

  const handleToDateChange = (event) => {
    setSelectedToDate(event.target.value);
  };

  const handleBuildingChange = (event) => {
    setSelectedBuilding(event.target.value);
    // Reset other filters when building changes
    setSelectedRooms([]);
    setSelectedWeek('');
    setSelectedMonth('');
    setSelectedCourse('');
  };

  const handleRoomChange = (event) => {
    setSelectedRooms(event.target.value);
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const filterHistoryData = () => {
    // Apply filters based on selected values
    let filteredData = historyData;

    if (selectedBuilding) {
      filteredData = filteredData.filter(entry => entry.building === selectedBuilding);
    }

    if (selectedRooms.length > 0) {
      filteredData = filteredData.filter(entry => selectedRooms.includes(entry.room));
    }

    if (selectedWeek) {
      filteredData = filteredData.filter(entry => entry.week === selectedWeek);
    }

    if (selectedMonth) {
      filteredData = filteredData.filter(entry => entry.month === selectedMonth);
    }

    if (selectedCourse) {
      filteredData = filteredData.filter(entry => entry.course === selectedCourse);
    }

    // Apply date range filter
    const fromDate = new Date(selectedFromDate).getTime();
    const toDate = new Date(selectedToDate).getTime();

    filteredData = filteredData.filter(entry => {
      const entryTime = new Date(entry.timeEnded).getTime();
      return entryTime >= fromDate && entryTime <= toDate;
    });

    return filteredData;
  };
  const filterSummary = () => {
    const summary = [];

    if (selectedBuilding) {
      summary.push(<tr key="building"><td>Building:</td><td>{selectedBuilding}</td></tr>);
    }

    if (selectedRooms.length > 0) {
      summary.push(<tr key="rooms"><td>Rooms:</td><td>{selectedRooms.join(', ')}</td></tr>);
    }

    if (selectedWeek) {
      summary.push(<tr key="week"><td>Week:</td><td>{`Week ${selectedWeek}`}</td></tr>);
    }

    if (selectedMonth) {
      summary.push(<tr key="month"><td>Month:</td><td>{selectedMonth}</td></tr>);
    }

    if (selectedCourse) {
      summary.push(<tr key="course"><td>Course:</td><td>{selectedCourse}</td></tr>);
    }

    if (selectedFromDate || selectedToDate) {
      summary.push(
        <tr key="dateRange">
          <td>Date Range:</td>
          <td>{`${selectedFromDate ? selectedFromDate : 'No start date'} to ${selectedToDate ? selectedToDate : 'No end date'}`}</td>
        </tr>
      );
    }

    return summary;
  };
  useEffect(() => {
    const fromDate = new Date(selectedFromDate).getTime();
    const toDate = new Date(selectedToDate).getTime();

    if (fromDate === toDate) {
      const day1 = new Date(fromDate);
      day1.setDate(day1.getDate() + 1);
      setSelectedToDate(day1.toISOString().split('T')[0]);
    }
  }, [selectedFromDate, selectedToDate]);

  useEffect(() => {
    const filteredHistoryData = filterHistoryData();
    const buildingStats = {};
    const roomStats = {};

    filteredHistoryData.forEach(entry => {
      const buildingKey = entry.building;
      buildingStats[buildingKey] = (buildingStats[buildingKey] || 0) + 1;

      const roomKey = entry.room;
      roomStats[roomKey] = (roomStats[roomKey] || 0) + 1;
    });

    setBuildingStatisticsData(buildingStats);
    setRoomStatisticsData(roomStats);
  }, [selectedFromDate, selectedToDate, historyData, selectedBuilding, selectedRooms, selectedWeek, selectedMonth, selectedCourse]);

  useEffect(() => {
    const filteredHistoryData = filterHistoryData();
    const roomUsageByBuilding = calculateRoomUsageByBuilding(selectedWeek || selectedMonth);
    setMostUsedRoomByBuilding(roomUsageByBuilding);
    // If needed, set least used room by building as well
  }, [selectedWeek, selectedMonth, historyData, selectedBuilding, selectedRooms, selectedCourse]);
  
  

  const calculateRoomUsage = () => {
    const scienceBuildingRooms = buildingsAndRooms['Science Building'];
    const nantesBuildingRooms = buildingsAndRooms['Nantes Building'];

    const scienceBuildingData = Object.entries(roomStatisticsData)
      .filter(([room]) => scienceBuildingRooms.includes(room))
      .sort((a, b) => b[1] - a[1]);

    const nantesBuildingData = Object.entries(roomStatisticsData)
      .filter(([room]) => nantesBuildingRooms.includes(room))
      .sort((a, b) => b[1] - a[1]);

    const allRooms = [...buildingsAndRooms['Science Building'], ...buildingsAndRooms['Nantes Building']];

    const roomsWithoutRecords = allRooms.filter(room => !roomStatisticsData.hasOwnProperty(room));

    roomsWithoutRecords.forEach(room => {
      roomStatisticsData[room] = 0;
    });

    const mostUsedScienceRoom = scienceBuildingData[0] ? scienceBuildingData[0][0] : null;
    const leastUsedScienceRoom = scienceBuildingData[scienceBuildingData.length - 1] ? scienceBuildingData[scienceBuildingData.length - 1][0] : null;

    const mostUsedNantesRoom = nantesBuildingData[0] ? nantesBuildingData[0][0] : null;
    const leastUsedNantesRoom = nantesBuildingData[nantesBuildingData.length - 1] ? nantesBuildingData[nantesBuildingData.length - 1][0] : null;

    setMostUsedRoom({
      'Science Building': mostUsedScienceRoom,
      'Nantes Building': mostUsedNantesRoom,
    });

    setLeastUsedRoom({
      'Science Building': leastUsedScienceRoom,
      'Nantes Building': leastUsedNantesRoom,
    });
  };



  useEffect(() => {
    calculateRoomUsage();
  }, [roomStatisticsData, buildingsAndRooms]);

  const totalBuildingHours = (new Date(selectedToDate) - new Date(selectedFromDate)) / (1000 * 60 * 60 * 24) * 14;
  console.log(totalBuildingHours);
  const filteredEntries = filterHistoryData();
  const entryDuration = filteredEntries.reduce((totalDuration, entry) => {
    return totalDuration + calculateDurationInHours(entry.attendTime, entry.timeEnded);
  }, 0);
  
  useEffect(() => {
    calculateRoomRankingsByBuilding();
  }, [roomStatisticsData]);
  
 

  return (
    <div>
      <label htmlFor="fromDate">From Date:</label>
      <input type="date" id="fromDate" value={selectedFromDate} onChange={handleFromDateChange} />

      <label htmlFor="toDate">To Date:</label>
      <input type="date" id="toDate" value={selectedToDate} onChange={handleToDateChange} />
      {/* Building Filter */}
      <label htmlFor="building">Select Building:</label>
      <select id="building" value={selectedBuilding} onChange={handleBuildingChange}>
        <option value="">All Buildings</option>
        {Object.keys(buildingsAndRooms).map(building => (
          <option key={building} value={building}>
            {building}
          </option>
        ))}
      </select>

{/* Room Filter */}
{selectedBuilding && (
  <div className="mb-3">
    <label htmlFor="rooms" className="form-label">Select Room(s):</label>
    <select id="rooms" className="form-select" multiple value={selectedRooms} onChange={handleRoomChange}>
      {buildingsAndRooms[selectedBuilding].map(room => (
        <option key={room} value={room}>
          Room {room}
        </option>
      ))}
    </select>
  </div>
)}

{/* Week Filter */}
<div className="mb-3">
  <label htmlFor="week" className="form-label">Select Week:</label>
  <select id="week" className="form-select" value={selectedWeek} onChange={handleWeekChange}>
    <option value="">All Weeks</option>
    {allWeeks.map(week => (
      <option key={week} value={week}>
        Week {week}
      </option>
    ))}
  </select>
</div>

{/* Month Filter */}
<div className="mb-3">
  <label htmlFor="month" className="form-label">Select Month:</label>
  <select id="month" className="form-select" value={selectedMonth} onChange={handleMonthChange}>
    <option value="">All Months</option>
    {allMonths.map(month => (
      <option key={month} value={month}>
        {month}
      </option>
    ))}
  </select>
</div>

{/* Course Filter */}
<div className="mb-3">
  <label htmlFor="course" className="form-label">Select Course:</label>
  <select id="course" className="form-select" value={selectedCourse} onChange={handleCourseChange}>
    <option value="">All Courses</option>
    {allCourses.map(course => (
      <option key={course} value={course}>
        {course}
      </option>
    ))}
  </select>
</div>



      <div style={{ marginBottom: '20px', marginTop: '20px', padding: '20px' }}>
        <h3 style={{ fontFamily: 'Bold', color: '#333' }}>Filter Summary</h3>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', }}>
          <tbody>
            {filterSummary()}
          </tbody>
        </table>
      </div>
      <div style={{ marginBottom: '20px', marginTop: '20px', padding: '20px', borderRadius: '8px', background: '#fff' }}>
  <h3 style={{ fontFamily: 'Bold', color: '#333' }}>Room Usage and Summary</h3>
  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
    <thead>
      <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
        <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Building</th>
        <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Most Used Room</th>
        <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Least Used Room</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(mostUsedRoomByBuilding).map((building) => (
        <tr key={building}>
          <td style={{ fontFamily: 'Regular', padding: '10px' }}>{building}</td>
          <td style={{ fontFamily: 'Regular', padding: '10px' }}>
            {mostUsedRoomByBuilding[building].mostUsedRoom && (
              `Room ${mostUsedRoomByBuilding[building].mostUsedRoom.room}`
            )}
          </td>
          <td style={{ fontFamily: 'Regular', padding: '10px' }}>
            {mostUsedRoomByBuilding[building].leastUsedRoom && (
              `Room ${mostUsedRoomByBuilding[building].leastUsedRoom.room}`
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div style={{ display: 'flex', flexDirection: 'col', justifyContent: 'space-between', marginTop: '20px' }}>
    {Object.keys(mostUsedRoomByBuilding).map((building) => (
      <div key={building} style={{ maxWidth: '100%', margin: '20px', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h4 style={{ fontFamily: 'Bold', textAlign: 'left', marginBottom: '10px' }}>{building}</h4>
        <p style={{ textAlign: 'left', marginBottom: '10px' }}>
          - Most Used Room: {mostUsedRoomByBuilding[building].mostUsedRoom ? `Room ${mostUsedRoomByBuilding[building].mostUsedRoom.room}` : 'No records'}
          {' '}
          from {building} was most used on {selectedFromDate} to {selectedToDate}.
        </p>
        <p style={{ textAlign: 'left', marginBottom: '10px' }}>
          - Least Used Room: {mostUsedRoomByBuilding[building].leastUsedRoom ? `Room ${mostUsedRoomByBuilding[building].leastUsedRoom.room}` : 'No records'}
          {' '}
          from {building} was least used on {selectedFromDate} to {selectedToDate}.
        </p>
      </div>
    ))}
  </div>




      <div style={{ backgroundColor: '#D3D3D3', height: '1px', marginTop: '20px' }}></div>

      <div style={{ margin: '5 auto', marginTop: '50px', display: 'flex', flexDirection:'col',  justifyContent: 'center',  }}>
  <div style={{ flexBasis: '30%',margin: '10px', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
    <h3 style={{ fontFamily: 'Bold' }}>Building Statistics and Usage</h3>
    <canvas id="buildingChart" width="200" height="100" ></canvas>
    <p style={{marginTop: '40px'}}>
      {mostUsedBuilding && (
        `Most Used Building: ${mostUsedBuilding} was most used on ${selectedFromDate} to ${selectedToDate} with ${buildingStatisticsData[mostUsedBuilding]} entries`
      )}
    </p>
    <p>
      {leastUsedBuilding && (
        `Least Used Building: ${leastUsedBuilding} was least used on ${selectedFromDate} to ${selectedToDate} with ${buildingStatisticsData[leastUsedBuilding]} entries`
      )}
    </p>
  </div>

  <div style={{ flexBasis: '30%', borderRadius: '8px', padding: '2px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
    <h3 style={{ fontFamily: 'Bold' }}>Room Rankings</h3>
    <canvas id="roomBarChart" width="500" height="300"></canvas>
    {Object.keys(roomRankings).map(building => (
    <div key={building} style={{ maxWidth: '100%', margin: '10px', padding: '20px' }}>
      <h4 style={{ fontFamily: 'Bold', marginBottom: '10px' }}>{building}</h4>
      <ol>
        {roomRankings[building].map((roomInfo, index) => (
          <li key={roomInfo.room}>
            {`Room ${roomInfo.room}: ${roomInfo.count} entries`}
          </li>
        ))}
      </ol>
    </div>
  ))}
  </div>


</div>

      <div style={{ marginBottom: '20px', marginTop: '20px', padding: '20px', borderRadius: '8px', background: '#fff' }}>
        <h3 style={{ fontFamily: 'Bold', color: '#333' }}>Rooms</h3>

        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Building</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Room</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Entries</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#7393B3' }}>Usage Percentage</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(buildingsAndRooms).map(building => (
              <React.Fragment key={building}>
                <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                  <td colSpan="4" style={{ padding: '10px', textAlign: 'left', color: '#7393B3', fontWeight: 'bold' }}>
                    {building}
                  </td>
                </tr>
                {buildingsAndRooms[building].map(room => {
                  const entriesForCurrentRoom = filteredEntries.filter(entry => entry.room === room);
                  const entryDurationForRoom = entriesForCurrentRoom.reduce((totalDuration, entry) => {
                    return totalDuration + calculateDurationInHours(entry.attendTime, entry.timeEnded);
                  }, 0);
                  return (
                    <tr key={room} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ fontFamily: 'Regular', padding: '10px' }}>{building}</td>
                      <td style={{ fontFamily: 'Regular', padding: '10px' }}>{`Room ${room}`}</td>
                      <td style={{ fontFamily: 'Regular', padding: '10px' }}>{roomStatisticsData[room] || 0}</td>
                      <td style={{ fontFamily: 'Regular', padding: '10px', color: '	#0000FF' }}>
                        {`${((entryDurationForRoom / totalBuildingHours) * 100).toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
}

export default Analytics;