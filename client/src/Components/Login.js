import React, { useState } from 'react';
import '../Styles/Login.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login({ setIsAuthenticated }) {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [Error, setError] = useState('');
  const [LoginError, setLoginError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [eyeIcon, setEyeIcon] = useState(faEye);

  //Email Validation

  function VerifyEmail(_email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(_email);
  }

  //Submit Handler

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!VerifyEmail(email)) {
      setError('1');
      return;
    }
    else if (password === '') {
      setError('2');
      return;
    }
    else {
      setError('');
    }

    // Add your login logic here
    const user = { email, password }; // User object
    setIsDisabled(true);
    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // Handle the response data
        if (data.message === 'Authentication successful') {
          setLoginError(false);
          setIsDisabled(false);
          localStorage.setItem('token', email);
          setIsAuthenticated(true);
        } else {
          setLoginError(true);
          setIsDisabled(false);
        }
      })
      .catch(error => {
        // Handle the error
        console.error(error);
      });
  };

  return (
    <div className='main-page-bg'>
      <div className="login-container">
        <h1>Login Now</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              if (!VerifyEmail(e.target.value)) {
                setError('1');
              }
              else {
                setError('')
              }
              setLoginError(false);
              setUsername(e.target.value);
            }}
            onBlur={(e) => {
              if (!VerifyEmail(e.target.value)) {
                setError('1');
              }
              else {
                setError('')
              }
            }}
          />
          {Error === '1' && (
            <p className="error-message">Please enter a valid email address</p>
          )}
          <div className='password-input-container common-1'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='password-input'
              placeholder="Password"
              value={password}
              onChange={(e) => {
                if (e.target.value === '') {
                  setError('2');
                }
                else {
                  setError('');
                }
                setLoginError(false);
                setPassword(e.target.value);
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setError('2');
                }
                else {
                  setError('');
                }
              }}
            />
            <button
              className="password-toggle-btn"
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
                setEyeIcon(showPassword ? faEye : faEyeSlash);
              }}
            >
              <FontAwesomeIcon icon={eyeIcon} size="lg" />
            </button>
          </div>
          {Error === '2' && (
            <p className="error-message">Password cannot be empty</p>
          )}
          <button className='login-btn' disabled={isDisabled} type="submit" > Login</button>
          {LoginError && (
            <p className="login-error">Invalid Email or Password</p>
          )}
        </form>
        <div className="register-option">
          <p style={{ color: 'aliceblue' }}>Don't have an account?
            {isDisabled ? <span>Register Now</span> :
              <NavLink to="/register">Register Now</NavLink>
            }
          </p>
        </div>
      </div >
    </div>
  );
}

export default Login;