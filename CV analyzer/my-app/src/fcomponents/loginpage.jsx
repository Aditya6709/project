import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  "./cssfiles/loginpage.css";
const LoginPage = () => {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    
    if (userType === 'Recruiter') {
      navigate('/recruiterpage');
    } else if (userType === 'Job Seeker') {
      navigate('/recruithome');
    } else {
      alert("Please select a user type");
    }
  };

  return (
    <div className='main'>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className='input'>
          <label>
            <input 
              type="radio" 
              value="Recruiter" 
              checked={userType === 'Recruiter'} 
              onChange={(e) => setUserType(e.target.value)} 
            />
            Want to hire someone?
          </label>
          <label>
            <input 
              type="radio" 
              value="Job Seeker" 
              checked={userType === 'Job Seeker'} 
              onChange={(e) => setUserType(e.target.value)} 
            />
           Want to get Hired.
          </label>
        </div>
        <div className="submitbutton">
        <button type="submit" className='login'>Login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
