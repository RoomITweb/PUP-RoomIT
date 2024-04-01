import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, remove, update } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';
import ViewScheduleMatrix from './A_schedMatrix';

const dayWord = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let dayNamePrefix = '';
function ViewSchedule() {
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [days, setDays] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [semesterFilter, setSemesterFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  const [schedules, setSchedules] = useState([]);
  const [updated, setupdated] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [getIdKey, setgetIdKey] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [facultyName, setFacultyName] = useState('');
  const [subjectCodes, setSubjectCodes] = useState([]);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [day, setDay] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [creditUnits, setCreditUnits] = useState('');
  const [lecHours, setLecHours] = useState('');
  const [labHours, setLabHours] = useState('');
  const [hours, setHours] = useState('');
  const [course, setCourse] = useState('');
  const [roomOccupied, setRoomOccupied] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [yearHeader, setYearHeader] = useState('2023-2024');
  const [schoolYearFilter, setSchoolYearFilter] = useState(yearHeader);
  useEffect(() => {
    const fetchFacultyNames = async () => {
      const database = getDatabase(app);
      const usersRef = ref(database, 'users');
      try {
        const snapshot = await get(usersRef);
        const facultyNames = [];
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          for (const userId in usersData) {
            const user = usersData[userId];
            if (user.role === 'faculty') {
              const fullName = `${user.firstName} ${user.lastName}`;
              facultyNames.push(fullName);
            }
          }
          setFacultyList(facultyNames);
        }
      } catch (error) {
        console.error('Error fetching faculty names:', error);
      }
    };

    const fetchSubjectCodes = async () => {
      const database = getDatabase(app);
      const subjectsRef = ref(database, 'subjects');

      try {
        const snapshot = await get(subjectsRef);
        const subjectCodes = {};
        if (snapshot.exists()) {
          const subjectsData = snapshot.val();
          for (const subjectId in subjectsData) {
            const subject = subjectsData[subjectId];
            subjectCodes[subject.subjectCode] = subject;
          }
          setSubjectCodes(subjectCodes);
        }
      } catch (error) {
        console.error('Error fetching subject codes:', error);
      }
    };
    fetchFacultyNames();
    fetchSubjectCodes();
  }, []);
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
          const currentDate = new Date();
          dayNamePrefix = dayWord[currentDate.getDay()].slice(0, 3);
          const currentDay = dayWord[currentDate.getDay()]
          const currentDayIndex = dayWord.indexOf(currentDay);
          setDayFilter(currentDayIndex !== -1 ? dayWord[currentDayIndex] : '');
          const filteredData = Object.values(schedulesData).filter(sched => sched.day.includes(dayNamePrefix));
          for (const scheduleId in schedulesData) {
            const schedule = schedulesData[scheduleId];
            scheduleData.push({ id: scheduleId, ...schedule });
          }

          setSchedules(scheduleData);
          setupdated('');
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, [updated]);

  useEffect(() => {
    if (subjectCode && subjectCodes[subjectCode]) {
      const selectedSubject = subjectCodes[subjectCode];
      setSubjectDescription(selectedSubject.subjectDescription);
      setCreditUnits(selectedSubject.creditUnit);
    }
  }, [subjectCode, subjectCodes]);
  useEffect(() => {
    const totalHours = parseFloat(lecHours) + parseFloat(labHours);
    setHours(totalHours.toString());
  }, [lecHours, labHours]);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  console.log('check sched', schedules)
  if (schedules != undefined) {
    schedules.forEach(schedule => {
      if (typeof schedule.time === 'string') {
        schedule.time = schedule.time.trim();
        const timeParts = schedule.time.split('-');
        const concatenatedTime = timeParts[0].trim() + ' - ' + timeParts[1].trim();
        schedule.time = concatenatedTime;
      }

    });
  }
  let filteredSchedules = schedules.filter((schedule) => {
    if (schoolYearFilter && schedule.schoolYear !== schoolYearFilter) {
      return false;
    }
    if (semesterFilter && schedule.semester !== semesterFilter) {
      return false;
    }
    if (buildingFilter && schedule.building !== buildingFilter) {
      return false;
    }
    if (dayFilter && !schedule.day.includes(dayFilter.substring(0, 3))) { 
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
  const [isModalOpen, setIsModalOpen] = useState(false); // State variable to control modal visibility

  const handEditSchedule = async (schedule) => {
    setSelectedSchedules(schedule)
    const [startTimeStr, endTimeStr] = schedule.time.split("-").map(time => time.trim());
    setStartTime(startTimeStr);
    setEndTime(endTimeStr);
    setFacultyName(schedule.facultyName);
    setSchoolYear(schedule.schoolYear);
    setSemester(schedule.semester);
    setSubjectCode(schedule.subjectCode);
    setSubjectDescription(schedule.subjectDescription);
    setCourse(schedule.course);
    setCreditUnits(schedule.creditUnits)
    setLecHours(schedule.lecHours)
    setLabHours(schedule.labHours)
    setDay(schedule.day);
    setBuilding(schedule.building);
    setRoom(schedule.room);
    setRoomOccupied(schedule.roomOccupied);
    setScheduleId(schedule.id);
    const database = getDatabase(app);
    const scheduleRef = ref(database, `schedules/${schedule.id}`);
    const getId = scheduleRef.key;
    console.log('selected schedule:', schedule);
    try {
      console.log('aso', getId);
      setgetIdKey(getId);
      // const scheduleRef = ref(database, `schedules/${getId1}`);
      // await update(scheduleRef, { roomOccupied: "1" });

      // Open the modal
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateButton = async () => {
    const newSchedule = {
      schoolYear: schoolYear,
      semester: semester,
      facultyName: facultyName,
      subjectCode: subjectCode,
      subjectDescription: subjectDescription,
      course: course,
      creditUnits: creditUnits,
      lecHours: lecHours,
      labHours: labHours,
      hours: hours,
      time: `${startTime} - ${endTime}`,
      day: day,
      building: building,
      room: room,
      roomOccupied: roomOccupied ?? "0"
    };

    console.log("Editted Schedule", newSchedule)

    const database = getDatabase(app);
    const scheduleRef = ref(database, `schedules/${scheduleId}`);
    const getId = scheduleRef.key;
    console.log('selected schedule:', getId);

    if (
      !schoolYear ||
      !semester ||
      !facultyName ||
      !subjectCode ||
      !subjectDescription ||
      !course ||
      !creditUnits ||
      !lecHours ||
      !labHours ||
      !hours ||
      !startTime ||
      !endTime ||
      !day ||
      !building ||
      !room
    ) {
      alert('Please fill in all fields.');
      return;
    }


    if (getId) {
      try {
        const scheduleRef = ref(database, `schedules/${getId}`);
        await update(scheduleRef, newSchedule);

        // Open the modal
        setupdated('1');
        setIsModalOpen(false);

      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Function to get available rooms based on the selected building
  const getRoomsByBuilding = () => {
    if (buildingFilter === 'Nantes Building') {
      return ['120', '121', '122', 'AVR', 'Keyboarding Lab', 'Speech Lab'];
    } else if (buildingFilter === 'Science Building') {
      return ['105', '106', '107', '108', '203', '204', '205', '206'];
    } else if (buildingFilter === 'Suarez Building') {
      return ['Com Lab 1', 'Com Lab 2'];
    } else {
      return [];
    }
  };

  return (
    <div>
      <div className="Container-fluid" style={{ width: '100%' }}>
        <div className="Row">
          <div className="Col">
            <h2>View Schedule</h2>
            <h2>{yearHeader}</h2>
            <div className="filter-container">
              {/* <div className="filter">
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
              </div> */}

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
                    {dayWord.map((dayWord, index) => (
                      <option key={index} value={dayWord}>
                        {dayWord}
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
                        <div>
                          <button variant="danger" onClick={() => handleDeleteSchedule(schedule.id)}>
                            Delete
                          </button>
                          {/* Button with variant "primary" */}
                          <button variant="danger" onClick={() => handEditSchedule(schedule)}>
                            Edit
                          </button>

                          {/* Modal component */}

                        </div>
                      </td>
                      <td>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isModalOpen && (
                <div className="modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '9999', overflow: 'auto' }}>
                  <div className="modal-content-wrapper" style={{ width: '60%', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
                    {isModalOpen && (
                      <>
                        <h2> </h2>
                        <h2>Update Schedule</h2>

                        <div style={{ border: '1px solid #ccc' }}>
                          <div className="form-group-inline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className="form-group" style={{ width: '50%' }}>
                              <label className="placeholder-opt" htmlFor="semester">SCHOOL YEAR</label>
                              <input
                                type="text"
                                className="form-control"
                                id="schoolYear"
                                value={schoolYear}
                                onChange={(e) => setSchoolYear(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group" style={{ width: '50%' }}>
                              <label className="placeholder-opt" htmlFor="semester">SEMESTER</label>
                              <select
                                className="form-control"
                                id="semester"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                              >
                                <option className="place-option" hidden>Select Semester</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                                <option value="Summer">Summer</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div style={{ border: '1px solid #ccc' }}>
                          <div>
                            <h3>Subject</h3>
                            <div className="form-group-inline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="facultyName">FACULTY NAME</label>
                                <select
                                  className="form-control"
                                  id="facultyName"
                                  value={selectedSchedules.facultyName}
                                  onChange={(e) => setFacultyName(e.target.value)}
                                  required
                                >
                                  <option hidden>Select Faculty Name</option>
                                  {facultyList.map((faculty) => (
                                    <option key={faculty} value={faculty}>
                                      {faculty}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="subjectCode">SUBJECT CODE</label>
                                <select
                                  className="form-control"
                                  id="subjectCode"
                                  value={subjectCode}
                                  onChange={(e) => setSubjectCode(e.target.value)}
                                  required
                                >
                                  <option hidden>Select Subject Code</option>
                                  {Object.keys(subjectCodes).map((code) => (
                                    <option key={code} value={code}>
                                      {code}
                                    </option>
                                  ))}
                                  {!subjectCodes[subjectCode] && (
                                    <option value={subjectCode}>
                                      {subjectCode}
                                    </option>
                                  )}
                                </select>
                              </div>

                              <div className="form-group" style={{ width: '25%' }}>
                                <label htmlFor="subjectCode">SUBJECT DESCRIPTION</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="subjectDescription"
                                  value={subjectDescription}
                                  style={{ marginTop: "10px" }}
                                  onChange={(e) => setSubjectDescription(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="subjectCode">COURSE</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="course"
                                  value={course}
                                  style={{ marginTop: "10px" }}
                                  onChange={(e) => setCourse(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="form-group-inline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="subjectCode">CREDIT UNITS</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="creditUnits"
                                  value={creditUnits}
                                  style={{ marginTop: "10px" }}
                                  onChange={(e) => setCreditUnits(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="subjectCode">LECTURE HOURS</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="lecHours"
                                  value={lecHours}
                                  style={{ marginTop: "10px" }}
                                  onChange={(e) => setLecHours(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="form-group" style={{ width: '25%' }}>
                                <label htmlFor="subjectCode">LAB HOURS</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="labHours"
                                  value={labHours}
                                  style={{ marginTop: "10px" }}
                                  onChange={(e) => setLabHours(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="form-group" style={{ width: '20%' }}>
                                <label htmlFor="hours">TOTAL HOURS</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="hours"
                                  value={hours}
                                  onChange={(e) => setHours(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ border: '1px solid #ccc' }}>
                          <h3>Schedule</h3>
                          <div className="form-group-inline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className="form-group" style={{ width: '30%' }}>
                              <label htmlFor="day">DAY</label>
                              <select
                                className="form-control"
                                id="day"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                required
                              >
                                <option hidden>Select Day</option>
                                <option value="Mon/Wed">Mon/Wed</option>
                                <option value="Tue/Thurs">Tue/Thurs</option>
                                <option value="Fri/Sat">Fri/Sat</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ width: '30%' }}>
                              <label htmlFor="startTime">START TIME</label>
                              <select
                                className="form-control"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                              >
                                <option hidden>Select Start Time</option>
                                <option hidden>Select Start Time</option>
                                <option value="7:30am">7:30am</option>
                                <option value="8:00am">8:00am</option>
                                <option value="8:30am">8:30am</option>
                                <option value="9:00am">9:00am</option>
                                <option value="9:30am">9:30am</option>
                                <option value="10:00am">10:00am</option>
                                <option value="10:30am">10:30am</option>
                                <option value="11:00am">11:00am</option>
                                <option value="11:30am">11:30am</option>
                                <option value="12:00pm">12:00pm</option>
                                <option value="12:30pm">12:30pm</option>
                                <option value="1:00pm">1:00pm</option>
                                <option value="1:30pm">1:30pm</option>
                                <option value="2:00pm">2:00pm</option>
                                <option value="2:30pm">2:30pm</option>
                                <option value="3:00pm">3:00pm</option>
                                <option value="3:30pm">3:30pm</option>
                                <option value="4:00pm">4:00pm</option>
                                <option value="4:30pm">4:30pm</option>
                                <option value="5:00pm">5:00pm</option>
                                <option value="5:30pm">5:30pm</option>
                                <option value="6:00pm">6:00pm</option>
                                <option value="6:30pm">6:30pm</option>
                                <option value="7:00pm">7:00pm</option>
                                <option value="7:30pm">7:30pm</option>
                                <option value="8:00pm">8:00pm</option>
                                <option value="8:30pm">8:30pm</option>
                                <option value="9:00pm">9:00pm</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ width: '30%' }}>
                              <label htmlFor="endTime">END TIME</label>
                              <select
                                className="form-control"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                              >
                                <option hidden>Select End Time</option>
                                <option hidden>Select Start Time</option>
                                <option value="7:30am">7:30am</option>
                                <option value="8:00am">8:00am</option>
                                <option value="8:30am">8:30am</option>
                                <option value="9:00am">9:00am</option>
                                <option value="9:30am">9:30am</option>
                                <option value="10:00am">10:00am</option>
                                <option value="10:30am">10:30am</option>
                                <option value="11:00am">11:00am</option>
                                <option value="11:30am">11:30am</option>
                                <option value="12:00pm">12:00pm</option>
                                <option value="12:30pm">12:30pm</option>
                                <option value="1:00pm">1:00pm</option>
                                <option value="1:30pm">1:30pm</option>
                                <option value="2:00pm">2:00pm</option>
                                <option value="2:30pm">2:30pm</option>
                                <option value="3:00pm">3:00pm</option>
                                <option value="3:30pm">3:30pm</option>
                                <option value="4:00pm">4:00pm</option>
                                <option value="4:30pm">4:30pm</option>
                                <option value="5:00pm">5:00pm</option>
                                <option value="5:30pm">5:30pm</option>
                                <option value="6:00pm">6:00pm</option>
                                <option value="6:30pm">6:30pm</option>
                                <option value="7:00pm">7:00pm</option>
                                <option value="7:30pm">7:30pm</option>
                                <option value="8:00pm">8:00pm</option>
                                <option value="8:30pm">8:30pm</option>
                                <option value="9:00pm">9:00pm</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div style={{ border: '1px solid #ccc' }}>
                          <h3>Building & Rooms</h3>
                          <div className="form-group-inline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className="form-group" style={{ width: '50%' }}>
                              <label htmlFor="building">BUILDING</label>
                              <select
                                className="form-control"
                                id="building"
                                value={building}
                                onChange={(e) => setBuilding(e.target.value)}
                                required
                              >
                                <option hidden>Select Building</option>
                                <option value="Nantes Building">Nantes Building</option>
                                <option value="Science Building">Science Building</option>
                                <option value="Suarez Building">Suarez Building</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ width: '50%' }}>
                              <label htmlFor="room">ROOM</label>
                              <select
                                className="form-control"
                                id="room"
                                value={room}
                                style={{ marginBottom: "20px" }}
                                onChange={(e) => setRoom(e.target.value)}
                                required
                              >
                                <option hidden>Select Room</option>
                                {building === 'Nantes Building' && (
                                  <>
                                    <option value="120">120</option>
                                    <option value="121">121</option>
                                    <option value="122">122</option>
                                    <option value="AVR">AVR</option>
                                    <option value="Keyboarding Lab">Keyboarding Lab</option>
                                    <option value="Speech Lab">Speech Lab</option>
                                  </>
                                )}
                                {building === 'Science Building' && (
                                  <>
                                    <option value="105">105</option>
                                    <option value="106">106</option>
                                    <option value="107">107</option>
                                    <option value="108">108</option>
                                    <option value="203">203</option>
                                    <option value="204">204</option>
                                    <option value="205">205</option>
                                    <option value="206">206</option>
                                  </>
                                )}
                                {building === 'Suarez Building' && (
                                  <>
                                    <option value="Com Lab 1">Com Lab 1</option>
                                    <option value="Com Lab 2">Com Lab 2</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                        <button onClick={handleCloseModal} style={{ marginTop: '10px' }}>Cancel</button>
                        <button onClick={updateButton} style={{ marginTop: '10px' }}>Update</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewSchedule;
