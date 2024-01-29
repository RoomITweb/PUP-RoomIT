import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './C_facultySched.css';
import 'bootstrap/dist/css/bootstrap.css';

function Logout() {
  const navigate = useNavigate();
  const [ setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    try {
      // Get the Firebase authentication instance
      const authInstance = getAuth();

      // Sign out the user
      await signOut(authInstance);

      // Redirect to the login page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
        <div>
          <p>Are you sure you want to logout?</p>
          <button className = "logout-options logout-yes" onClick={handleLogout}>Yes</button>
          <button className = "logout-options logout-no" onClick={() => setConfirmLogout(false)}>No</button>
        </div>
    </div>
  );
}

export default Logout;
