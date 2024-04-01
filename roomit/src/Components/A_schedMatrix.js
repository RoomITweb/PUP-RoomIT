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
  if(!schedules){
return;
  }
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

  // Define dedicated colors for each schedule
  const scheduleColors = {
    'GEED23420 - ROTC': 'indianred',
    'INTE30073 - Information and Assurance Security 2': 'peru',
    'COMP8097 - Object Oriented Programming': 'cornflowerblue',
    'GEED10073 - Art Appreciation': 'maroon',
    'COMP8274 - Electrical Planning': 'coral',
    'PHED10042 - Team Sports': 'darksalmon',
    'GEED10083 - Science, Technology and Society': 'lightcoral',
    'ENG0110 - Circuits And Wirings': 'lightskyblue ',
    'GEED123 - Understanding the Self': 'plum',
    // Add more schedules and colors as needed
  };

  return (
    <div>
      <h2>Schedule Matrix</h2>
      <table className="table table-bordered" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Time </th>
            {daysOfWeek.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 32 }, (_, halfHourIndex) => {
            const startTimeHour = (Math.floor(7 + halfHourIndex / 2) % 12 || 12);
            const startTimeMeridiem = halfHourIndex < 10 ? 'am' : 'pm'; // Start at 7:30 am

            const startTime = `${startTimeHour}:${(halfHourIndex % 2 === 0) ? '00' : '30'} ${startTimeMeridiem}`;

            // Move the declarations outside the loop
            const cellStartTime = moment(startTime, 'h:mma');

            return (
              <tr key={halfHourIndex}>
                <td>{`${startTime}`}</td>
                {daysOfWeek.map((day, dayIndex) => {
                  return (
                    <td key={dayIndex}>
                      {scheduleByDay[day] &&
                        scheduleByDay[day].map((filteredSchedule, index) => {
                          const scheduleStartTime = moment(filteredSchedule.time.split(' - ')[0], 'h:mma');
                          const scheduleEndTime = moment(filteredSchedule.time.split(' - ')[1], 'h:mma');

                          if (scheduleStartTime.isSameOrBefore(cellStartTime) && scheduleEndTime.isSameOrAfter(cellStartTime)) {
                            const scheduleKey = `${filteredSchedule.subjectCode} - ${filteredSchedule.subjectDescription}`;
                            const scheduleColor = filteredSchedule?.roomOccupied === "1" ? 'maroon' : 'green'; // Default color is maroon                         

                            return (
                              <div key={index} style={{ backgroundColor: scheduleColor, color: 'white' }}>
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
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ViewScheduleMatrix;
