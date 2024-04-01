import React, { useState, useEffect } from 'react';
import { onValue,getDatabase, ref, get, set, query, orderByChild, equalTo, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import ReactModal from 'react-modal';
import BarcodeScanner from './BarcodeScanner';

function FacultySchedule() {
  // State variables para sa data ng faculty schedule at iba pa.
  const [facultyName, setFacultyName] = useState('');
  const [facultySchedules, setFacultySchedules] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [attendingClass, setAttendingClass] = useState(false);
  const [roomOccupied, setRoomOccupied] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [refresh, setRefresh] = useState('');
  const [yearHeader, setYearHeader] = useState('2023-2024');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(yearHeader);
  const dayWord = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let dayNamePrefix = '';
  // Firebase authentication at database
  const auth = getAuth(app);
  const database = getDatabase(app);
  ReactModal.setAppElement('#root');

  useEffect(() => {
    console.log('ChangesInHistory');
    const historyRef = ref(database, 'history');
    onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHistoryData(data);
      }
    });
    return () => {
    };
  }, [database]);


  const parseDate2 = (dateTime) => {
    // Parse the datetime string
    const date = new Date(dateTime);

    // Extract year, month, and day components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');

    // Construct the formatted date string
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
     setRefresh('');
    }, 1000); // Trigger every second

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures the effect runs only once on mount



  function convertTo24HourFormat(timeString2) {                
    timeString2 = timeString2.trim();
    const timeRegex = /^(\d{1,2}):(\d{2})([ap]m)$/i;
    const match = timeString2.match(timeRegex);   
    if (!match) {
      console.error("Invalid time string format:", timeString2);
      console.log("not Match", timeString2);
      return null;
    }
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toLowerCase();
    if (period === "pm" && hours !== 12) {
      hours += 12;
    } else if (period === "am" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  function addMinutes(timeString, minutesToAdd) {
    const [hours, minutes] = timeString.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes + minutesToAdd;
    totalMinutes = (totalMinutes + 1440) % 1440; // Ensure result stays within 24 hours
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

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
        const currentDate = new Date();
        dayNamePrefix = dayWord[currentDate.getDay()].slice(0, 3);

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
              let scheduleData = schedule.val();
              if (
                scheduleData.schoolYear === selectedSchoolYear &&
                scheduleData.semester === selectedSemester
              ) {
                const scheduleId = schedule.key; 
                scheduleData = { ...scheduleData, Id: scheduleId };
                const timeString2 = scheduleData.time.trim(); // Example time string
                   
                if (timeString2 && timeString2.includes("-")) {
                  const [startTime, endTime] = timeString2.split("-");
                  const militaryStartTime = convertTo24HourFormat(startTime);
              //    const graceStartTime = addMinutes(militaryStartTime, -15);
             //     console.log('Grace Start Time' , addMinutes(militaryStartTime,15));
                  const militaryEndTime = convertTo24HourFormat(endTime);
                  if (militaryStartTime && militaryEndTime) {
                    const currentTime = new Date();
                    const hours = currentTime.getHours().toString().padStart(2, '0');
                    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
                    const timeString = `${hours}:${minutes}`;
                    if (!/^\d{2}:\d{2}$/.test(militaryStartTime) || !/^\d{2}:\d{2}$/.test(timeString)) {
                      console.error("Invalid military start time or current time format");
                    } else {
                      if (timeString >= addMinutes(militaryStartTime,-15) && timeString <= addMinutes(militaryEndTime,15)) {
                        let disabledSchedule = false;
                        const currentDate = new Date();
                        const matchingEntry = Object.values(historyData).find(x => x.room === scheduleData.room && x.day === scheduleData.day && x.facultyName === scheduleData.facultyName);
                        if (matchingEntry) {
                          if(parseDate2(matchingEntry.attendTime)===parseDate2(currentDate)){
                          disabledSchedule = true;
                          }
                        }
                        if(scheduleData?.roomOccupied ==="1"){
                          disabledSchedule = true
                        }
                        scheduleData = { ...scheduleData, disabled2: disabledSchedule };
                      }
                      else {                
                        const disabledSchedule = true;
                        scheduleData = { ...scheduleData, disabled2: disabledSchedule };
                        if(scheduleData?.roomOccupied==="1"){
                          const attendDate = new Date();
                  
                          AutoEndClass(scheduleData)
                           
                        }
                      }
                    }
                  } else {
                    console.error("Error converting time");
                  }
                } else {
                  console.error("Error: Invalid time string or format");
                }
               if(scheduleData.day.includes(dayNamePrefix)){
                facultySchedules.push(scheduleData);
               }
               
             //   console.log(scheduleData)
              }
            });
            setFacultySchedules(facultySchedules);
           // console.log(facultySchedules)
          }
        }

        // Check kung may ini-occupy na room at kung naka-attend ng class
        const occupiedRoomRef = ref(database, `users/${user.uid}/occupiedRoom`);
        const occupiedRoomSnapshot = await get(occupiedRoomRef);

        const attendingClassRef = ref(database, `users/${user.uid}/attendingClass`);
        const attendingClassSnapshot = await get(attendingClassRef);

        const selectedScheduleRef = ref(database, `rooms`);
        const selectedScheduleSnapshot = await get(selectedScheduleRef);

        if (attendingClassSnapshot.exists()) {
          setAttendingClass(true);
        }

        if (selectedScheduleSnapshot.exists() && occupiedRoomSnapshot.exists()) {
          //   setRoomOccupied(true);
        } else {
          //  setRoomOccupied(false);
        }

        // Retrieve selectedSchedule from local storage if exists
        const savedSelectedSchedule = localStorage.getItem('selectedSchedule');
        if (savedSelectedSchedule) {
         // setSelectedSchedule(JSON.parse(savedSelectedSchedule));
       
        }
        setRefresh("Refresh");
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
  }, [refresh,auth, database, facultyName, selectedSchoolYear, selectedSemester, roomOccupied, attendingClass, selectedSchedule]);

  // Function para sa pagbukas ng scanner at pag-set ng message
  const handleOpenScanner = async (subject) => {
    setSelectedSchedule(subject);
    setShowScanner(true);
    setIsScannerOpen(true);
    setSelectedId(subject.Id);
    if (subject.room) {
      setIsScannerOpen(true);
      setScanMessage(`Room: ${subject.room}`);
    }
    // const scheduleRef = ref(database, `schedules/${subject.key}`);
    //  await update(scheduleRef, { roomOccupied: "1" });
  };

  // Function para sa pag-process ng result ng QR code scan
  const handleQrCodeScan = (result) => {
    setScanResult(result);
    if(scanMessage){
      console.log('Scan Message Clear:', scanMessage);
    }
    if(result.includes(scanMessage)){
      console.log('Include Clear:', scanMessage);
    }

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



      setAttendingClass(true);
      setSuccessMessage('You have successfully attended the class.');
      setErrorMessage('');

      // Set attendingClassRef only if it doesn't exist
      if (!attendingClassSnapshot.exists()) {
        await set(attendingClassRef, true);
      }

      await set(ref(database, `rooms/${selectedSchedule.room}`), scheduleData, currentTime);
      await set(ref(database, `users/${userUid}/occupiedRoom`), selectedSchedule.room);

      localStorage.setItem('selectedSchedule', JSON.stringify(selectedSchedule));
      // setRoomOccupied(true);
      const scheduleRef = ref(database, `schedules/${selectedId}`);
      
      await update(scheduleRef, { roomOccupied: "1",attendTime:currentTime});
      setRoomOccupied(true);
      setAttendingClass(true);
      setSuccessMessage('You have successfully attended the class.');
      setErrorMessage('');
    }

  };
  const AutoEndClass = async (subject) => {
    if (auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const currentDate = new Date().toLocaleString();;
       const selectedSubject = {
        ...subject,
        attendTime: subject.attendTime || currentDate
      };
      console.log("selectedSubject",selectedSubject)
      set(ref(database, `users/${userUid}/occupiedRoom`), null);
      set(ref(database, `users/${userUid}/attendingClass`), null);

      if (subject !== null && subject !== undefined) {

        // const attendtime = new Date(); // Use either new Date() or Date.now()
        // console.log('attendtime',attendDate)
        // attendtime.setHours(attendDate); // Use setHours() to set the hour
        
        const timeEnded = Date.now();
        const historyRef = ref(database, `history`);

        try {
          const historySnapshot = await get(historyRef);

          if (historySnapshot.exists()) {
            const historyData = historySnapshot.val();

            await set(historyRef, {
              ...historyData,
              [timeEnded.toString()]: {
                ...selectedSubject,
                timeEnded: timeEnded 
              },
            });
          } else {
            await set(historyRef, {
              [timeEnded.toString()]: {
                ...selectedSubject,
                timeEnded: timeEnded         
              },
            });
          }

          console.log("History Entry Added:", {
            ...subject,
            timeEnded: timeEnded,
          });

          await set(ref(database, `rooms/${subject.room}`), null);
        } catch (error) {
          console.error('Error updating history:', error);
          setErrorMessage('Error ending the class. Please try again.');
        }
      }
    }
    const scheduleRef = ref(database, `schedules/${subject.Id}`);
    await update(scheduleRef, { roomOccupied: '0',attendTime:'' });
    setAttendingClass(false);
    setSuccessMessage('');
  };

  // Function para sa pag-end ng class
  const handleEndClass = async (subject) => {
    const selectedScheduleRef = ref(database, `rooms`);
    const selectedScheduleSnapshot = await get(selectedScheduleRef);

    if (selectedScheduleSnapshot.exists()) {
      const selectedSchedule = selectedScheduleSnapshot.val();
      setSelectedSchedule(subject);
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

          // setRoomOccupied(false);
          setErrorMessage('');
          setSuccessMessage('You have successfully ended the class.');

        } catch (error) {
          console.error('Error updating history:', error);
          setErrorMessage('Error ending the class. Please try again.');
        }
      }
    }
    const scheduleRef = ref(database, `schedules/${subject.Id}`);
    await update(scheduleRef, { roomOccupied: '0',attendTime:'' });
    console.log('getId1', subject.Id)

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
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{yearHeader}</h2>
                      <p style={{ fontFamily: 'Regular', marginBottom: '20px' }}>Welcome, {facultyName}!</p>

              <div className="row">
                <div className="content-wrapper">
                  <div className="form-group">
                    {/* <select
                      className="form-control"
                      onChange={(e) => {
                        setSelectedSchoolYear(e.target.value);
                        filterSchedulesBySchoolYearAndSemester(e.target.value, selectedSemester);
                      }}
                      value={selectedSchoolYear}
                    >
                      <option value="" disabled hidden>Choose a School Year</option>
                      <option style={{ fontFamily: 'Regular' }} value="All">All</option>
                      <option style={{ fontFamily: 'Regular' }} value="2022-2023">2022-2023</option>
                      <option style={{ fontFamily: 'Regular' }} value="2023-2024">2023-2024</option>
                    </select> */}
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
                      <option style={{ fontFamily: 'Regular' }} value="" disabled hidden>Choose a Semester</option>
                      <option style={{ fontFamily: 'Regular' }} value="All">All</option>
                      <option style={{ fontFamily: 'Regular' }} value="1st Semester">1st Semester</option>
                      <option style={{ fontFamily: 'Regular' }} value="2nd Semester">2nd Semester</option>
                      <option style={{ fontFamily: 'Regular' }} value="Summer">Summer</option>
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
                          <td style={{ display: "none" }}>{subject.key}</td>


                          <td>
                            {subject.roomOccupied === "1" ? (
                              <button className="btn btn-danger" onClick={() => handleEndClass(subject)}>End Class</button>
                            ) : (
                              <button className="btn btn-success" onClick={() => handleOpenScanner(subject)} disabled={subject.disabled2}>Open Scanner</button>
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
              {(
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
