import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, get } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';

function AddSchedule() {
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [course, setCourse] = useState('');
  const [creditUnits, setCreditUnits] = useState('');
  const [lecHours, setLecHours] = useState('');
  const [labHours, setLabHours] = useState('');
  const [hours, setHours] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [day, setDay] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [subjectCodes, setSubjectCodes] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);

  useEffect(() => {
    // Fetch faculty names from the 'users' collection with 'faculty' role
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

    // Fetch subject codes from the 'subjects' collection
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
          setSubjectsData(subjectsData);
        }
      } catch (error) {
        console.error('Error fetching subject codes:', error);
      }
    };

    // Fetch existing schedules from the 'schedules' collection
    const fetchExistingSchedules = async () => {
      const database = getDatabase(app);
      const schedulesRef = ref(database, 'schedules');

      try {
        const snapshot = await get(schedulesRef);
        const schedulesData = [];

        if (snapshot.exists()) {
          const schedules = snapshot.val();

          for (const scheduleId in schedules) {
            const schedule = schedules[scheduleId];
            schedulesData.push(schedule);
          }

          setExistingSchedules(schedulesData);
        }
      } catch (error) {
        console.error('Error fetching existing schedules:', error);
      }
    };

    fetchFacultyNames();
    fetchSubjectCodes();
    fetchExistingSchedules();
  }, []);

  useEffect(() => {
    if (subjectCode && subjectCodes[subjectCode]) {
      const selectedSubject = subjectCodes[subjectCode];
      setSubjectDescription(selectedSubject.subjectDescription);
      setCreditUnits(selectedSubject.creditUnit);
    } else {
      setSubjectDescription('');
      setCreditUnits('');
    }
  }, [subjectCode, subjectCodes]);

  useEffect(() => {
    const totalHours = parseFloat(lecHours) + parseFloat(labHours);
    setHours(totalHours.toString());
  }, [lecHours, labHours]);

  const handleAddSchedule = () => {
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

    const existingSchedule = existingSchedules.find(
      (schedule) =>
        schedule.semester === semester &&
        schedule.day === day &&
        schedule.time === `${startTime} - ${endTime}` &&
        schedule.room === room
    );

    if (existingSchedule) {
      alert(
        'A schedule with the same day, time, and room already exists. Please select another schedule.'
      );
      return;
    }

    const database = getDatabase(app);
    const schedulesRef = ref(database, 'schedules');
    const newSchedule = {
      schoolYear,
      semester,
      facultyName,
      subjectCode,
      subjectDescription,
      course,
      creditUnits,
      lecHours,
      labHours,
      hours,
      time: `${startTime} - ${endTime}`,
      day,
      building,
      room,
    };

    push(schedulesRef, newSchedule)
      .then(() => {
        alert('Schedule added successfully!');
        setSchoolYear('');
        setSemester('');
        setFacultyName('');
        setSubjectCode('');
        setSubjectDescription('');
        setCourse('');
        setCreditUnits('');
        setLecHours('');
        setLabHours('');
        setHours('');
        setStartTime('');
        setEndTime('');
        setDay('');
        setBuilding('');
        setRoom('');
      })
      .catch((error) => {
        console.error('Error adding schedule:', error);
        alert(
          'An error occurred while adding the schedule. Please try again.'
        );
      });
  };

  return (
    <div className="add-schedule-container" style={{ color: '#3d3d3d', padding: '10px', marginTop: '0px', marginBottom: '50px'}}>
      <h2>Add Schedule</h2>
      <form>
        <div className="form-group">
        <label className = "placeholder-opt" htmlFor="semester">SCHOOL YEAR</label>
          <input
            type="text"
            className="form-control"
            id="schoolYear"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className = "placeholder-opt" htmlFor="semester">SEMESTER</label>
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

        <div className="form-group">
          <label htmlFor="facultyName">FACULTY NAME</label>
          <select
            className="form-control"
            id="facultyName"
            value={facultyName}
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

        <div className="form-group">
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
          </select>
        </div>

        <div className="form-group">
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

        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="startTime">START TIME</label>
          <select
            className="form-control"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          >
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
        <div className="form-group">
          <label htmlFor="endTime">END TIME</label>
          <select
            className="form-control"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          >
            <option hidden>Select End Time</option>
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
        <div className="form-group">
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
        <div className="form-group">
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
        <button
          type="button"
          onClick={handleAddSchedule}
          className="btn btn-success"
          style={{
            width: '400px',
            fontFamily: 'Semibold',
            marginLeft: '0px',
            marginTop: '-1%',
            marginBottom: '15%',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '400px',
            align: 'center',
      
          }}
        >
          ADD SCHEDULE
        </button>
        <span style={{ textDecoration: 'line-through' }}></span>{' '}
      </form>
    </div>
  );
}

export default AddSchedule;