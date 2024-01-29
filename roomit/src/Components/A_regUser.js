import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { app } from './firebase';

import 'bootstrap/dist/css/bootstrap.css';

function UserRegistration() {
  const [role, setRole] = useState('faculty');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Function para sa automatic password generation
  const generateRandomPassword = () => {
    const length = 10; // Habang 10 character password
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };

  const handleGeneratePassword = () => {
    const generatedPassword = generateRandomPassword();
    setPassword(generatedPassword);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    try {
      const authInstance = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;

      // Store user registration information in Firebase Realtime Database
      const database = getDatabase(app);
      const usersRef = ref(database, 'users/' + user.uid);
      let userData = { email, firstName, lastName, role, password };
      await set(usersRef, userData);

      console.log('User registered and data stored:', user);
      setSuccessMessage('User registered successfully!');
      setErrorMessage('');

      // Reset input fields to their initial values
      setRole('faculty');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use a different email.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('The password is too weak. Please choose a stronger password.');
      } else {
        setErrorMessage('An error occurred during registration. Please try again.');
      }
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h2 style={{marginBottom: '50px', color: '#3d3d3d', padding: '10px'}}>
        Add User
      </h2>
      <div className="registration-container" >
        <form onSubmit={handleRegistration} >
          <div className="form-group" >
            <label className="role" htmlFor="role" >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ width: '400px' }}
            >
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
              <option value="room checker">Room Checker</option>
            </select>
          </div>

          <div className="form-group" >
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              style={{ width: '400px' }}
            />
          </div>

          <div className="form-group" >
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              style={{ width: '400px' }}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{ width: '400px' }}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: '400px' }}
            />
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="btn btn-danger mt-2"
              style={{    backgroundColor: 'maroon',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '0px',
              marginLeft: '0px',
              width: '400px',
              align: 'center',
              fontFamily: 'Medium',
              fontSize: '16px', 
              width: '400px' }}
            >
              GENERATE PASSWORD
            </button>
          </div>

          <button
            type="button"
            onClick={handleRegistration}
            style={{ 
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '400px',
              align: 'center',
              fontFamily: 'Semibold',
              marginBottom: '60px',
              marginLeft: '0px',
              fontSize: '16px',
              width: '400px' }}
          >
            REGISTER
          </button>
        </form>

        {errorMessage && <p style={{ color: 'red', marginTop: '15px' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green', marginTop: '15px' }}>{successMessage}</p>}
      </div>
    </div>
  );
}

export default UserRegistration;
