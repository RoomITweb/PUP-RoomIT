import React, { useState } from 'react';
import { getDatabase, ref, push, get, child } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';


function AddSubject() {
  const [course, setCourse] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [creditUnit, setCreditUnit] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    // Fetch subjects from Firebase Realtime Database
    const fetchSubjects = async () => {
      try {
        const database = getDatabase(app);
        const subjectsRef = ref(database, 'subjects');

        const snapshot = await get(child(subjectsRef, '/'));
        if (snapshot.exists()) {
          const subjectsData = snapshot.val();
          const subjectsArray = Object.keys(subjectsData).map((key) => ({
            id: key,
            ...subjectsData[key],
          }));
          setSubjects(subjectsArray);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []); // Empty dependency array to fetch subjects only once on component mount

  const isDuplicateSubject = async (code, description) => {
    try {
      const database = getDatabase(app);
      const subjectsRef = ref(database, 'subjects');

      const snapshot = await get(child(subjectsRef, '/'));
      if (snapshot.exists()) {
        const subjects = snapshot.val();

        for (const key in subjects) {
          if (
            subjects[key].subjectCode === code &&
            subjects[key].subjectDescription === description
          ) {
            return true; // Nakita ang duplicate
          }
        }
      }

      return false; // Walang duplicate
    } catch (error) {
      console.error('Error checking for duplicate subject:', error);
      return false; // Kung may error, hindi tayo sigurado kung may duplicate
    }
  };

  const handleAddSubject = async () => {
    if (!course || !subjectCode || !subjectDescription || !creditUnit) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
  
    // Check kung may duplicate subject
    const isDuplicate = await isDuplicateSubject(subjectCode, subjectDescription);
  
    if (isDuplicate) {
      setErrorMessage('Subject is already existing');
      return;
    }
  
    // Store subject information in Firebase Realtime Database
    const database = getDatabase(app);
    const subjectsRef = ref(database, 'subjects');
    const newSubject = {
      course,
      subjectCode,
      subjectDescription,
      creditUnit,
    };
  
    push(subjectsRef, newSubject)
      .then(() => {
        setSuccessMessage('Subject added successfully!');
        setErrorMessage('');
  
        // Clear input fields
        setCourse('');
        setSubjectCode('');
        setSubjectDescription('');
        setCreditUnit('');
      })
      .catch((error) => {
        console.error('Error adding subject:', error);
        setErrorMessage('An error occurred while adding the subject. Please try again.');
        setSuccessMessage('');
      });
  };  

  const handleDeleteSubject = async (id) => {
    try {
      const database = getDatabase(app);
      const subjectsRef = ref(database, 'subjects');

      // Remove subject from Firebase Realtime Database
      await remove(child(subjectsRef, id));

      // Update local state after deletion
      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id));
      setSuccessMessage('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting subject:', error);
      setErrorMessage('An error occurred while deleting the subject. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="add-subject-container">
      <h2>Add Subject</h2>
      <form onSubmit={handleAddSubject}>

        <div className="form-group">
          <label className = "placeholder-opt" htmlFor="course">Course & Section:</label>
          <input
           className="form-control"
            placeholder="Course & Section"
            type="text"
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subjectCode">Subject Code:</label>
          <input
           className="form-control"
            placeholder="Subject Code"
            type="text"
            id="subjectCode"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            required
            
          />
        </div>

        <div className="form-group">
          <label htmlFor="subjectDescription">Subject Description:</label>
          <input
           className="form-control"
            placeholder="Subject Description"
            type="text"
            id="subjectDescription"
            value={subjectDescription}
            onChange={(e) => setSubjectDescription(e.target.value)}
            required
           
          />
        </div>

        <div className="form-group">
          <label htmlFor="creditUnit">Credit Unit:</label>
          <input
            placeholder="Credit Unit"
            type="text"
            id="creditUnit"
            value={creditUnit}
            onChange={(e) => setCreditUnit(e.target.value)}
            required
            className="form-control"
          />
        </div>

        <button
          type="button"
          onClick={handleAddSubject}
          className="btn btn-success"
          style={{ width: '100%', fontFamily: 'Medium' ,
        marginLeft: '0px'}}
        >
          ADD SUBJECT
        </button>
        <span style={{ textDecoration: 'line-through' }}></span>{' '}
      </form>

      {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
      {successMessage && <p className="text-success mt-3">{successMessage}</p>}

      {/* Display subjects */}
      <div className="mt-4">
        <h3>Subjects List</h3>
        <ul>
          {subjects.map((subject) => (
            <li key={subject.id}>
              {subject.course} - {subject.subjectCode} - {subject.subjectDescription} - {subject.creditUnit}
              <button
                className="btn btn-danger btn-sm ml-2"
                onClick={() => handleDeleteSubject(subject.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AddSubject;