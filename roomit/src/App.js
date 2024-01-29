import React from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './Components/firebase';
import { BrowserRouter as Router } from 'react-router-dom';
import RouterComponent from './Components/router';

// Initialize Firebase at the app level
initializeApp(firebaseConfig);

function App() {
  return (
    <Router>
      <div className="App">
        <RouterComponent />
      </div>
    </Router> 
  );
}

export default App;
