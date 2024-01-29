import React, { useState } from 'react';
import { app } from './firebase';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import pupLogo from './PUP_LOGO.png';
import 'bootstrap/dist/css/bootstrap.css';
import './login_design.css';

const Login = () => {
  const [loginAs, setLoginAs] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  
  // Function para sa pag-log in ng user
const handleLogin = async (e) => {
  e.preventDefault();
  const auth = getAuth(app);

  try {
    if (isForgotPassword) {
      // Kung nasa "Forgot Password" mode, tawagin ang handleForgotPassword function
      await handleForgotPassword();
    } else {
      // Kung hindi nasa "Forgot Password" mode, ituloy ang normal na authentication logic
      // Dito ilalagay ang authentication logic, halimbawa:
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Kunin ang user object mula sa userCredential
      const user = userCredential.user;

      // Dito, gawin ang request para kunin ang user role mula sa database.
      // Ito ay posibleng gawin gamit ang Firebase Realtime Database o Firestore API.

      // Halimbawa sa Firebase Realtime Database:
      const database = getDatabase(app);
      const userRef = ref(database, 'users/' + user.uid); // I-update ang 'users' na path na base sa iyong database structure.
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      
      if (userData && userData.role === loginAs) {
        // Kung ang user role ay tumutugma sa piniling role, ituloy ang login.
        switch (loginAs) {
          case 'admin':
            navigate('/admin');
            break;
          case 'faculty':
            navigate('/faculty');
            break;
          case 'room checker':
            navigate('/room-checker');
            break;
          default:
            // Handle other cases if needed
            break;
        }
      } else {
        // Kung hindi tumutugma ang role, ibigay ang appropriate error message.
        alert('Invalid role. Please select the correct role.');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Error: Incorrect E-mail or Password.');
  }
};

  // Function para sa pag-send ng reset password email
  const handleForgotPassword = async () => {
    const auth = getAuth(app);

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
      setIsForgotPassword(false); // Balik sa login mode pagkatapos ng pag-send
    } catch (error) {
      console.error('Forgot Password error:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  return (
    <div className="container-fluid" >
      <div className="login-container">
 
          <div className="login-box">
            <img src={pupLogo} alt="Roomit Logo" className="img-fluid" />
            <h2>RoomIT</h2>
            {isForgotPassword ? (
              <>
                <p className="font-medium">Enter your email to reset your password:</p>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="btn btn-primary"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="btn btn-secondary"
                  >
                    Back to Login
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="font-medium" htmlFor="loginAs">Login as:</label>
                  <select
                    id="loginAs"
                    name="loginAs"
                    value={loginAs}
                    onChange={(e) => setLoginAs(e.target.value)}
                    className="form-select"
                  >
                    <option value="faculty">Faculty</option>
                    <option value="room checker">Room Checker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary">LOGIN</button>
                <p className="forgot-pw">
                  <button onClick={() => setIsForgotPassword(true)} className="btn btn-link">
                    Forgot Password
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
  );
};

export default Login;