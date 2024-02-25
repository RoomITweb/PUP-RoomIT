import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, get, child, remove } from 'firebase/database';
import { app } from './firebase';
import 'bootstrap/dist/css/bootstrap.css';


function AddSubject() {
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
    if (!subjectCode || !subjectDescription || !creditUnit) {
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
      subjectCode,
      subjectDescription,
      creditUnit,
    };
  
    push(subjectsRef, newSubject)
      .then(() => {
        setSuccessMessage('Subject added successfully!');
        setErrorMessage('');
  
        // Clear input fields
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

      {/* Display subjects as a table */}
      <div className="mt-4 table-container overflow-auto">
        <h3>Subjects List</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.subjectCode}</td>
                <td>{subject.subjectDescription}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddSubject;