import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import Form from './Components/Registeration_Form';
import CreateAd from './Components/Create_Ad';
import Home from './Components/Home';
import Navbar from './Components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [Data, setData] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    const Token = localStorage.getItem('token');
    if(Token && Token!=='')
    {
      setIsAuthenticated(true);
    }
    else{
      setIsAuthenticated(false);
    }
  }, []);

  // Utility function which will pass extracted details to Form
  function SetExtractedData(data) {
    console.log('Data From Child:', data);
    setData(data);
    setIsExtracted(true);
  }

  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/home" /> : <Register ParentFunction={SetExtractedData} />}
          />
          <Route
            path="/form"
            element={isExtracted ? <Form FormData={Data} /> : <Navigate to="/register" />}
          />
          <Route path="/create-ad" element={isAuthenticated ? <CreateAd /> : <Navigate to="/login" />} />
          <Route path="/home" element={isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
