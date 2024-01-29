import React from 'react';
import moment from 'moment';

function ViewScheduleMatrix({ schedules }) {
  // Organize schedule data by days of the weeksss
  const scheduleByDay = schedules.reduce((acc, schedule) => {
    const days = schedule.day.split('/'); // Split days if there's a "/" in the day
    days.forEach((day) => {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
    });
    return acc;
  }, {});

  // Define the days of the week with both abbreviated and full names
  const daysOfWeek = [
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
    { short: 'Sun', full: 'Sunday' },
  ];

// Define a CSS class for cells with schedules
const cellWithScheduleStyle = {
  backgroundColor: 'maroon', // Set your desired background color
  color: 'white',
};


  return (
    <div style={{ overflowY: 'auto', maxHeight: '300px', maxWidth: '100%' }}>
    
      <h2>Schedule Matrix</h2>
      <table className="table table-bordered" style={{ width: '100%', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map((day, index) => (
              <th key={index}>{`${day.short}/${day.full}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }, (_, hourIndex) => (
            <tr key={hourIndex}>
              <td>{`${(7 + hourIndex) % 12 || 12}:00 ${(hourIndex < 6 || hourIndex >= 18) ? 'am' : 'pm'} - ${(8 + hourIndex) % 12 || 12}:00 ${(hourIndex < 5 || hourIndex >= 17) ? 'am' : 'pm'}`}</td>
              {daysOfWeek.map((day, dayIndex) => (
                 <td key={dayIndex} >
                  {schedules
                    .filter(schedule => {
                      const scheduleDay = moment(schedule.day, 'dddd').format('dddd');
                      const scheduleStartTime = moment(schedule.time.split(' - ')[0], 'h:mma');
                      const scheduleEndTime = moment(schedule.time.split(' - ')[1], 'h:mma');
                      const cellStartTime = moment(`${(7 + hourIndex) % 12 || 12}:00 ${(hourIndex < 6 || hourIndex >= 18) ? 'am' : 'pm'}`, 'h:mma');
                      const cellEndTime = moment(`${(8 + hourIndex) % 12 || 12}:00 ${(hourIndex < 5 || hourIndex >= 17) ? 'am' : 'pm'}`, 'h:mma');

                      return (
                        (scheduleDay === day.full || scheduleDay === day.short) &&
                        scheduleStartTime.isSameOrBefore(cellEndTime) &&
                        scheduleEndTime.isSameOrAfter(cellStartTime)
                      );
                    })
                    .map((filteredSchedule, index) => (
                      <div key={index} style={cellWithScheduleStyle}>
                        <p>{`${filteredSchedule.subjectCode} - ${filteredSchedule.subjectDescription}`}</p>
                        <p>{`${filteredSchedule.facultyName}`}</p>
                      </div>
                    ))}
                </td>
              ))}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewScheduleMatrix;
