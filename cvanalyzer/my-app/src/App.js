
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LoginPage from './fcomponents/loginpage';  // Your LoginPage component
import RecruiterPage from './fcomponents/recruiterpage';  // Your other components
import RecruitHome from './fcomponents/recruithome';  // Your other components

const App = () => {
  return (
    <Router> {/* Wrap your app in Router */}
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Route for LoginPage */}
        <Route path="/recruiterpage" element={<RecruiterPage />} /> {/* Route for RecruiterPage */}
        <Route path="/recruithome" element={<RecruitHome />} /> {/* Route for RecruitHome */}
      </Routes>
    </Router>
  );
};

export default App;
