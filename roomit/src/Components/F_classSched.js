import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import ReactModal from 'react-modal';
import BarcodeScanner from './BarcodeScanner';

// React component para sa schedule ng faculty
function FacultySchedule() {
  // State variables para sa data ng faculty schedule at iba pa.
  const [facultyName, setFacultyName] = useState('');
  const [facultySchedules, setFacultySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [attendingClass, setAttendingClass] = useState(false);
  const [roomOccupied, setRoomOccupied] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Firebase authentication at database
  const auth = getAuth(app);
  const database = getDatabase(app);
  ReactModal.setAppElement('#root');

  // Effect hook para sa pag-fetch ng data
  useEffect(() => {
    const fetchData = async (user) => {
      try {
        // Kunin ang user data mula sa database
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          if (userData.role === 'faculty') {
            setFacultyName(`${userData.firstName} ${userData.lastName}`);
          }
        }

        // Kunin ang faculty schedules base sa school year at semester
        if (selectedSchoolYear && selectedSemester) {
          const schedulesRef = ref(database, 'schedules');
          const facultyScheduleQuery = query(
            schedulesRef,
            orderByChild('facultyName'),
            equalTo(facultyName)
          );
          const scheduleSnapshot = await get(facultyScheduleQuery);

          if (scheduleSnapshot.exists()) {
            const facultySchedules = [];
            scheduleSnapshot.forEach((schedule) => {
              const scheduleData = schedule.val();
              if (
                scheduleData.schoolYear === selectedSchoolYear &&
                scheduleData.semester === selectedSemester
              ) {
                facultySchedules.push(scheduleData);
              }
            });
            setFacultySchedules(facultySchedules);
          }
        }

        // Check kung may ini-occupy na room at kung naka-attend ng class
        const occupiedRoomRef = ref(database, `users/${user.uid}/occupiedRoom`);
        const occupiedRoomSnapshot = await get(occupiedRoomRef);

        const attendingClassRef = ref(database, `users/${user.uid}/attendingClass`);
        const attendingClassSnapshot = await get(attendingClassRef);

        const selectedScheduleRef = ref(database, `rooms`);
        const selectedScheduleSnapshot = await get(selectedScheduleRef);

        console.log('occupiedRoomSnapshot', occupiedRoomSnapshot.val());
        console.log('attendingClassSnapshot', attendingClassSnapshot.val());
        console.log('selectedScheduleSnapshot', selectedScheduleSnapshot.val());
        console.log('roomOccupied', roomOccupied);
        console.log('attendingClass', attendingClass);
        console.log('selectedSchedule', selectedSchedule);

        if (attendingClassSnapshot.exists()) {
          setAttendingClass(true);
        }

        if (selectedScheduleSnapshot.exists() && occupiedRoomSnapshot.exists()) {
          setRoomOccupied(true);
        } else {
          setRoomOccupied(false);
        }

         // Retrieve selectedSchedule from local storage if exists
         const savedSelectedSchedule = localStorage.getItem('selectedSchedule');
         if (savedSelectedSchedule) {
           setSelectedSchedule(JSON.parse(savedSelectedSchedule));
          }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Subscription sa authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setLoading(false);
      }
    });

    // Cleanup function para sa unsubscribe kapag nag-unmount ang component
    return () => {
      unsubscribe();
    };
  }, [auth, database, facultyName, selectedSchoolYear, selectedSemester, roomOccupied, attendingClass, selectedSchedule]);

  // Function para sa pagbukas ng scanner at pag-set ng message
  const handleOpenScanner = (subject) => {
    setSelectedSchedule(subject);
    setShowScanner(true);
    setIsScannerOpen(true);

    if (subject.room) {
      setIsScannerOpen(true);
      setScanMessage(`Room: ${subject.room}`);
    }
  };

  // Function para sa pag-process ng result ng QR code scan
  const handleQrCodeScan = (result) => {
    console.log('QR Code Scan Result:', result);
    setScanResult(result);

    if (scanMessage && result.includes(scanMessage)) {
      if (roomOccupied && selectedSchedule.room !== scanMessage) {
        setErrorMessage('Error: Room is already occupied by another user.');
        return;
      }

      setAttendingClass(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Error: Room not found or invalid QR code.');
    }
  };

  // Function para sa pagsara ng scanner
  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanResult(null);
    setScanMessage('');
    setErrorMessage('');
  };

  // Function para sa pag-attend ng class
  const handleAttendClass = async () => {
    if (auth.currentUser) {
      const userUid = auth.currentUser.uid;

      const occupiedRoomRef = ref(database, `users/${userUid}/occupiedRoom`);
      const occupiedRoomSnapshot = await get(occupiedRoomRef);

      const attendingClassRef = ref(database, `users/${userUid}/attendingClass`);
      const attendingClassSnapshot = await get(attendingClassRef);

      if (occupiedRoomSnapshot.exists() && occupiedRoomSnapshot.val() !== selectedSchedule.room) {
        setErrorMessage('Error: You are already attending a class in another room.');
        return;
      }

      const currentTime = new Date().toLocaleString();
      const scheduleData = {
        schoolYear: selectedSchedule.schoolYear,
        semester: selectedSchedule.semester,
        facultyName: facultyName,
        subjectCode: selectedSchedule.subjectCode,
        subjectDescription: selectedSchedule.subjectDescription,
        course: selectedSchedule.course,
        day: selectedSchedule.day,
        time: selectedSchedule.time,
        building: selectedSchedule.building,
        room: selectedSchedule.room,
        attendedTime: currentTime,
      };

      selectedSchedule.attendTime = currentTime;

      // Set attendingClassRef only if it doesn't exist
      if (!attendingClassSnapshot.exists()) {
      await set(attendingClassRef, true);
    }

      await set(ref(database, `rooms/${selectedSchedule.room}`), scheduleData, currentTime);
      await set(ref(database, `users/${userUid}/occupiedRoom`), selectedSchedule.room);

      localStorage.setItem('selectedSchedule', JSON.stringify(selectedSchedule));

      setRoomOccupied(true);
      setAttendingClass(true);
      setSuccessMessage('You have successfully attended the class.');
      setErrorMessage('');
    }
  };

  // Function para sa pag-end ng class
  const handleEndClass = async () => {
    const selectedScheduleRef = ref(database, `rooms`);
    const selectedScheduleSnapshot = await get(selectedScheduleRef);

    if (selectedScheduleSnapshot.exists()) {
      const selectedSchedule = selectedScheduleSnapshot.val();
      setSelectedSchedule(selectedSchedule);
      console.log("Selected Schedule:", selectedSchedule);
    } else {
      console.log("Selected Schedule not found.");
    }

    setAttendingClass(false);
    setShowScanner(false);

    if (auth.currentUser) {
      const userUid = auth.currentUser.uid;

      set(ref(database, `users/${userUid}/occupiedRoom`), null);
      set(ref(database, `users/${userUid}/attendingClass`), null);

      if (selectedSchedule !== null && selectedSchedule !== undefined) {
        const timeEnded = Date.now();
        const historyRef = ref(database, `history`);

        try {
          const historySnapshot = await get(historyRef);

          if (historySnapshot.exists()) {
            const historyData = historySnapshot.val();

            await set(historyRef, {
              ...historyData,
              [timeEnded.toString()]: {
                ...selectedSchedule,
                timeEnded: timeEnded,
              },
            });
          } else {
            await set(historyRef, {
              [timeEnded.toString()]: {
                ...selectedSchedule,
                timeEnded: timeEnded,
              },
            });
          }

          console.log("History Entry Added:", {
            ...selectedSchedule,
            timeEnded: timeEnded,
          });

          await set(ref(database, `rooms/${selectedSchedule.room}`), null);

          // Remove selectedSchedule mula sa localStorage
          localStorage.removeItem('selectedSchedule');

          setRoomOccupied(false);
          setErrorMessage('');
          setSuccessMessage('You have successfully ended the class.');

        } catch (error) {
          console.error('Error updating history:', error);
          setErrorMessage('Error ending the class. Please try again.');
        }
      }
    }
  };

  // Function para sa pag-filter ng schedules base sa day
  const filterSchedulesByDay = (day) => {
    if (day === 'All') {
      setFacultySchedules([]);
      return;
    }

    const filteredSchedules = facultySchedules.filter((schedule) => schedule.day === day);
    setFacultySchedules(filteredSchedules);
  };

  // Function para sa pag-filter ng schedules base sa school year at semester
  const filterSchedulesBySchoolYearAndSemester = (schoolYear, semester) => {
    if (schoolYear === 'All' && semester === 'All') {
      setFacultySchedules([]);
      return;
    }

    const filteredSchedules = facultySchedules.filter((schedule) => {
      if (schoolYear === 'All') {
        return schedule.semester === semester;
      }
      if (semester === 'All') {
        return schedule.schoolYear === schoolYear;
      }
      return schedule.schoolYear === schoolYear && schedule.semester === semester;
    });

    setFacultySchedules(filteredSchedules);
  };

  // Render ng HTML para sa UI gamit ang mga state variables at functions.
  return (
    <div className='h-screen justify-center flex items-center'>
      <div className="container ">
        <div className="row">
          <div className="col-12">
            <div className="content-wrapper">
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>My Schedule</h2>
            <p style={{ fontFamily: 'Regular', marginBottom: '20px' }}>Welcome, {facultyName}!</p>

              <div className="row">
                <div className="content-wrapper">
                  <div className="form-group">
                    <select
                      className="form-control"
                      onChange={(e) => {
                        setSelectedSchoolYear(e.target.value);
                        filterSchedulesBySchoolYearAndSemester(e.target.value, selectedSemester);
                      }}
                      value={selectedSchoolYear}
                    >
                    <option value="" disabled hidden>Choose a School Year</option>
                    <option style={{ fontFamily: 'Regular'}}value="All">All</option>
                    <option style={{ fontFamily: 'Regular'}}value="2022-2023">2022-2023</option>
                    <option style={{ fontFamily: 'Regular'}}value="2023-2024">2023-2024</option>
                    </select>
                  </div>
                </div>
                <div className="content-wrapper">
                  <div className="form-group">
                    <select
                      className="form-control"
                      onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        filterSchedulesBySchoolYearAndSemester(selectedSchoolYear, e.target.value);
                      }}
                      value={selectedSemester}
                    >
                    <option style={{ fontFamily: 'Regular'}}value="" disabled hidden>Choose a Semester</option>
                    <option style={{ fontFamily: 'Regular'}}value="All">All</option>
                    <option style={{ fontFamily: 'Regular'}}value="1st Semester">1st Semester</option>
                    <option style={{ fontFamily: 'Regular'}}value="2nd Semester">2nd Semester</option>
                    <option style={{ fontFamily: 'Regular'}}value="Summer">Summer</option>
                    </select>
                  </div>
                </div>
                <div className="content-wrapper">
                  <div className="form-group">
                    <select
                      className="form-control"
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        filterSchedulesByDay(e.target.value);
                      }}
                      value={selectedDay}
                    >
                    <option style={{ fontFamily: 'Regular'}}value="" disabled hidden>Choose a Day</option>
                    <option style={{ fontFamily: 'Regular'}}value="All">All</option>
                    <option style={{ fontFamily: 'Regular'}}value="Mon/Wed">Mon/Wed</option>
                    <option style={{ fontFamily: 'Regular'}}value="Tue/Thurs">Tue/Thurs</option>
                    <option style={{ fontFamily: 'Regular'}}value="Fri/Sat">Fri/Sat</option>
                    <option style={{ fontFamily: 'Regular'}}value="Monday">Monday</option>
                    <option style={{ fontFamily: 'Regular'}}value="Tuesday">Tuesday</option>
                    <option style={{ fontFamily: 'Regular'}}value="Wednesday">Wednesday</option>
                    <option style={{ fontFamily: 'Regular'}}value="Thursday">Thursday</option>
                    <option style={{ fontFamily: 'Regular'}}value="Friday">Friday</option>
                    <option style={{ fontFamily: 'Regular'}}value="Saturday">Saturday</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Display ng UI depende sa loading status at data availability */}
              {loading ? (
                <p>Loading...</p>
              ) : facultySchedules.length === 0 ? (
                <p>No schedules available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>School Year</th>
                        <th>Semester</th>
                        <th>Subject Code</th>
                        <th>Subject Description</th>
                        <th>Course</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Building</th>
                        <th>Room</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Map through ng faculty schedules para sa bawat row ng table */}
                      {facultySchedules.map((subject, index) => (
                        <tr key={index}>
                          <td>{subject.schoolYear}</td>
                          <td>{subject.semester}</td>
                          <td>{subject.subjectCode}</td>
                          <td>{subject.subjectDescription}</td>
                          <td>{subject.course}</td>
                          <td>{subject.day}</td>
                          <td>{subject.time}</td>
                          <td>{subject.building}</td>
                          <td>{subject.room}</td>
                          <td>
                            {/* Display ng button depende sa status ng room occupation */}
                            {roomOccupied ? (
                              <button className="btn btn-danger" onClick={handleEndClass}>End Class</button>
                            ) : (
                              <button className="btn btn-success" onClick={() => handleOpenScanner(subject)}>Open Scanner</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Display ng scanner modal kung kinakailangan */}
      {showScanner && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm bg-gray-200 ">
          <div className="absolute bg-white p-6 rounded-md shadow-md w-3/4 sm:w-3/4 md:w-1/2 lg:w-1/4 border border-5 border-red-800 ">
            <h2 className="text-lg font-semibold mb-4">Open Scanner for:</h2>
            {selectedSchedule && (
              <h2 className="text-2xl font-bold mb-4">Room {selectedSchedule.room}</h2>
            )}
            <BarcodeScanner onDecodeResult={handleQrCodeScan} className="mx-auto mb-4 w-full" />

            {/* Display ng scan result */}
            {scanResult && (
              <div>
                <p className="text-sm mb-1 font-normal">Scan Result</p>
                <p className="text-lg font-bold">{scanResult}</p>
              </div>
            )}
            
            {/* Buttons at messages */}
            <div className="mt-4">
              {isScannerOpen && (
                <button className="bg-red-600 text-white px-4 py-2 mr-2 sm:mr-0" onClick={handleCloseScanner}>
                  Close Scanner
                </button>
              )}
              {attendingClass && (
                <button className="bg-blue-600 text-white px-4 py-2" onClick={handleAttendClass}>
                  Attend Class
                </button>
              )}
              {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
              {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultySchedule;
