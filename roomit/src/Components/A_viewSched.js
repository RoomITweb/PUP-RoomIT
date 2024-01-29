import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';
import ViewScheduleMatrix from './A_schedMatrix';

function ViewSchedule() {
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [days, setDays] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [schoolYearFilter, setSchoolYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // Fetch schedules from Firebase Realtime Database
    const fetchSchedules = async () => {
      const database = getDatabase(app);
      const schedulesRef = ref(database, 'schedules');

      try {
        const snapshot = await get(schedulesRef);
        const scheduleData = [];

        if (snapshot.exists()) {
          const schedulesData = snapshot.val();

          for (const scheduleId in schedulesData) {
            const schedule = schedulesData[scheduleId];
            scheduleData.push({ id: scheduleId, ...schedule });
          }

          setSchedules(scheduleData);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  useEffect(() => {
    // Fetch unique values for filters from the schedules data
    const uniqueSchoolYears = [...new Set(schedules.map((schedule) => schedule.schoolYear))];
    const uniqueSemesters = [...new Set(schedules.map((schedule) => schedule.semester))];
    const uniqueBuildings = [...new Set(schedules.map((schedule) => schedule.building))];
    const uniqueDays = [...new Set(schedules.map((schedule) => schedule.day))];
    const uniqueRooms = [...new Set(schedules.map((schedule) => schedule.room))];

    setSchoolYears(uniqueSchoolYears);
    setSemesters(uniqueSemesters);
    setBuildings(uniqueBuildings);
    setDays(uniqueDays);
    setRooms(uniqueRooms);
  }, [schedules]);

  // Function to filter schedules based on selected filters
  const filteredSchedules = schedules.filter((schedule) => {
    if (schoolYearFilter && schedule.schoolYear !== schoolYearFilter) {
      return false;
    }
    if (semesterFilter && schedule.semester !== semesterFilter) {
      return false;
    }
    if (buildingFilter && schedule.building !== buildingFilter) {
      return false;
    }
    if (dayFilter && schedule.day !== dayFilter) {
      return false;
    }
    if (roomFilter && schedule.room !== roomFilter) {
      return false;
    }
    return true;
  });

  // Function para sa pag-delete ng schedule
  const handleDeleteSchedule = async (scheduleId) => {
    const database = getDatabase(app);
    const scheduleRef = ref(database, `schedules/${scheduleId}`);

    try {
      // Burahin ang schedule sa database gamit ang remove function
      await remove(scheduleRef);

      // I-update ang schedules state matapos ang pag-delete
      setSchedules((prevSchedules) => {
        return prevSchedules.filter((schedule) => schedule.id !== scheduleId);
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      // Maari mong ilagay ang error handling code dito
    }
  };

  // Function to get available rooms based on the selected building
  const getRoomsByBuilding = () => {
    if (buildingFilter === 'Nantes Building') {
      return ['120', '121', '122', 'AVR', 'Keyboarding Lab', 'Speech Lab'];
    } else if (buildingFilter === 'Science Building') {
      return ['105', '106', '107', '108', '203', '204', '205', '206'];
    }else if (buildingFilter === 'Suarez Building') {
      return ['Com Lab 1', 'Com Lab 2'];
    }else {
      return [];
    }
  };

  return (
    <div>
      <div className="Container-fluid" style={{ width: '100%' }}>
        <div className="Row">
          <div className="Col">
            <h2>View Schedule</h2>
            <div className="filter-container">
              <div className="filter">
                <div className="select-dropdown">
                  <select
                    id="schoolYearFilter"
                    value={schoolYearFilter}
                    style={{ marginTop: '20px' }}
                    onChange={(e) => setSchoolYearFilter(e.target.value)}
                  >
                    <option hidden>Select School Year</option>
                    {schoolYears.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter">
                <div className="select-dropdown">
                  <select
                    id="semesterFilter"
                    value={semesterFilter}
                    style={{ marginTop: '20px' }}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                  >
                    <option hidden>Select Semester</option>
                    {semesters.map((semester, index) => (
                      <option key={index} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter">
                <div className="select-dropdown">
                  <select
                    id="buildingFilter"
                    value={buildingFilter}
                    style={{ marginTop: '20px' }}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                  >
                    <option hidden>Select Building</option>
                    {buildings.map((building, index) => (
                      <option key={index} value={building}>
                        {building}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* New filter for rooms */}
              <div className="filter">
                <div className="select-dropdown">
                  <select
                    id="roomFilter"
                    value={roomFilter}
                    style={{ marginTop: '20px' }}
                    onChange={(e) => setRoomFilter(e.target.value)}
                  >
                    <option hidden>Select Room</option>
                    {getRoomsByBuilding().map((room, index) => (
                      <option key={index} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter">
                <div className="select-dropdown">
                  <select
                    id="dayFilter"
                    value={dayFilter}
                    style={{ marginTop: '20px' }}
                    onChange={(e) => setDayFilter(e.target.value)}
                  >
                    <option hidden>Select Day</option>
                    {days.map((day, index) => (
                      <option key={index} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="">
        <ViewScheduleMatrix schedules={filteredSchedules} />
      </div>

            <div className="table-container">
              <table striped bordered hover>
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>Subject Code</th>
                    <th>Subject Description</th>
                    <th>Course</th>
                    <th>Credit Units</th>
                    <th>Lecture Hours</th>
                    <th>Lab Hours</th>
                    <th>Hours</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Building</th>
                    <th>Room</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.facultyName}</td>
                      <td>{schedule.subjectCode}</td>
                      <td>{schedule.subjectDescription}</td>
                      <td>{schedule.course}</td>
                      <td>{schedule.creditUnits}</td>
                      <td>{schedule.lecHours}</td>
                      <td>{schedule.labHours}</td>
                      <td>{schedule.hours}</td>
                      <td>{schedule.day}</td>
                      <td>{schedule.time}</td>
                      <td>{schedule.building}</td>
                      <td>{schedule.room}</td>
                      <td>
                        <button variant="danger" onClick={() => handleDeleteSchedule(schedule.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewSchedule;
