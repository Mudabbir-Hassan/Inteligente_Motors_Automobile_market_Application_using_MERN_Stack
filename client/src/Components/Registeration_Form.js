import React, { useState, useEffect } from 'react';
import '../Styles/Registeration_Form.css';
import { useNavigate, NavLink } from 'react-router-dom';
import Modal from 'react-modal';

// Set the app element for react-modal
Modal.setAppElement(document.body);

const Form = ({ FormData }) => {
  const [formData, setFormData] = useState({
    name: FormData.Name || '',
    identityNumber: FormData['Identity Number'] || '',
    birthDate: FormData['Birth Date'] || '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [Error, setError] = useState('');
  const [RegError, setRegError] = useState('');
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  const handleModalClose = () => {
    setIsRegistered(false);
    navigate('/login');

  };

  useEffect(() => {
    if (RegError !== '') {
      // Scroll to the end of the page
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [RegError]);

  //Email Validation

  function VerifyEmail(_email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(_email);
  }

  const handleChange = (e) => {
    setRegError('');
    if (e.target.name === 'email') {
      if (!VerifyEmail(e.target.value)) {
        setError('1');
      }
      else {
        setError('')
      }
    }
    else if (e.target.name === 'password') {
      if (e.target.value === '') {
        setError('2');
      }
      else {
        setError('');
      }
    }
    else if (e.target.name === 'confirmPassword') {
      if (e.target.value !== formData.password) {
        setError('3');
      }
      else {
        setError('');
      }
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email === '' || !VerifyEmail(formData.email)) {
      setError('1');
      return;
    }
    else if (formData.password === '') {
      setError('2');
      return;
    }
    else if (formData.confirmPassword === '') {
      setError('3');
      return;
    }
    // Perform form submission logic here
    console.log(formData);
    const requestBody = {
      name: formData.name,
      identityNumber: formData.identityNumber,
      birthDate: formData.birthDate,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    // Make a POST request to the /create_user endpoint
    fetch('http://localhost:3001/create_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Registered Successfully');
          setIsRegistered(true);
        } else if (response.status === 409) {
          setRegError('User already exist with these details');
        } else {
          setRegError('Unable to Create User');
          throw new Error('Error: ' + response.status);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className='main-page-bg-2'>
      <form className="form" onSubmit={handleSubmit}>
        <h1 style={{ textAlign: 'center', color: '#f2f2f2' }}>Registeration Form</h1>
        <div className="form-group">
          <label className='label' htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            //disabled={true}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className='label' htmlFor="identityNumber">Identity Number</label>
          <input
            type="text"
            id="identityNumber"
            name="identityNumber"
            value={formData.identityNumber}
            onChange={handleChange}
            //disabled={true}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className='label' htmlFor="birthDate">Birth Date</label>
          <input
            type="text"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            //disabled={true}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className='label' htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => {
              if (!VerifyEmail(e.target.value)) {
                setError('1');
              }
              else {
                setError('')
              }
            }}
            className="form-input"
          />
          {Error === '1' && (
            <p className="error-message">Please enter a valid email address</p>
          )}
        </div>
        <div className="form-group">
          <label className='label' htmlFor="password">Set Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={(e) => {
              if (e.target.value === '') {
                setError('2');
              }
              else {
                setError('');
              }
            }}
            className="form-input"
          />
          {Error === '2' && (
            <p className="error-message">Password can't be empty</p>
          )}
        </div>
        <div className="form-group">
          <label className='label' htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={(e) => {
              if (e.target.value !== formData.password) {
                setError('3');
              }
              else {
                setError('');
              }
            }}
            className="form-input"
          />
          {Error === '3' && (
            <p className="error-message">Password don't match</p>
          )}
        </div>
        <button type="submit" className="form-button">Submit</button>
        {RegError !== '' && (
          <p className="reg-error">{RegError}</p>
        )}
        <div className="form-back-button-div">
          <NavLink className="form-back-button" to="/register">Go Back</NavLink>
        </div>
      </form>
      <Modal
        className="modal"
        overlayClassName="modal-overlay"
        isOpen={isRegistered}
        onRequestClose={handleModalClose}>
        <h2>Registration Successful!</h2>
        <p>Please login now to continue.</p>
        <div className='OK-btn-div'><button onClick={handleModalClose}>OK</button></div>
      </Modal>
    </div>
  );
};

export default Form;
