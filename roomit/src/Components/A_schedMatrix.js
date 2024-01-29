import React from 'react';
import moment from 'moment';

function ViewScheduleMatrix({ schedules }) {
  // Function to expand abbreviated days
  const expandDays = (abbreviatedDay) => {
    switch (abbreviatedDay) {
      case 'Mon/Wed':
        return ['Monday', 'Wednesday'];
      case 'Tue/Thurs':
        return ['Tuesday', 'Thursday'];
      case 'Fri/Sat':
        return ['Friday', 'Saturday'];
      default:
        return [abbreviatedDay];
    }
  };

  // Organize schedule data by days of the week
  const scheduleByDay = schedules.reduce((acc, schedule) => {
    const expandedDays = expandDays(schedule.day);

    expandedDays.forEach((day) => {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
    });
    return acc;
  }, {});

  // Define the days of the week with full names
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Define a CSS class for cells with schedules
  const cellWithScheduleStyle = {
    backgroundColor: 'maroon', // Set your desired background color
    color: 'white',
  };

  return (
    <div>
      <h2>Schedule Matrix</h2>
      <table className="table table-bordered" style={{ width: '100%'}}>
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }, (_, hourIndex) => (
            <tr key={hourIndex}>
              <td>{`${(7 + hourIndex) % 12 || 12}:00 ${(hourIndex < 6 || hourIndex >= 18) ? 'am' : 'pm'} - ${(8 + hourIndex) % 12 || 12}:00 ${(hourIndex < 5 || hourIndex >= 17) ? 'am' : 'pm'}`}</td>
              {daysOfWeek.map((day, dayIndex) => (
                <td key={dayIndex}>
                  {scheduleByDay[day] &&
                    scheduleByDay[day].map((filteredSchedule, index) => {
                      const scheduleStartTime = moment(filteredSchedule.time.split(' - ')[0], 'h:mma');
                      const scheduleEndTime = moment(filteredSchedule.time.split(' - ')[1], 'h:mma');
                      const cellStartTime = moment(`${(7 + hourIndex) % 12 || 12}:00 ${(hourIndex < 6 || hourIndex >= 18) ? 'am' : 'pm'}`, 'h:mma');
                      const cellEndTime = moment(`${(8 + hourIndex) % 12 || 12}:00 ${(hourIndex < 5 || hourIndex >= 17) ? 'am' : 'pm'}`, 'h:mma');

                      if (
                        scheduleStartTime.isSameOrBefore(cellEndTime) && scheduleEndTime.isSameOrAfter(cellStartTime)
                      ) {
                        return (
                          <div key={index} style={cellWithScheduleStyle}>
                            <p>{`${filteredSchedule.time}`}</p>
                            <p>{`${filteredSchedule.subjectCode} - ${filteredSchedule.subjectDescription}`}</p>
                            <p>{`${filteredSchedule.facultyName}`}</p>
                            <p>{`${filteredSchedule.course}`}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
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
