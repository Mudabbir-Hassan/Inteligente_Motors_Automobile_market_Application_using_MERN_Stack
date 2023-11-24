import React, { useState } from 'react';
import '../Styles/Register.css';
import LoadingSpinner from './Loader';
import { useNavigate, NavLink } from 'react-router-dom';

function Register(Props) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // File Change Handler

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Perform validation on the selected file (e.g., file type, size, etc.)
            setFile(selectedFile);
            setError('');
        }
    };

    // Form Submit Handler

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload your ID Card or CNIC');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Send the file data to the server using fetch

        setIsLoading(true);
        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                setIsLoading(false);

                //Send object to parent(App.js)
                Props.ParentFunction(data.message);
                navigate('/form');
            })
            .catch((error) => {
                console.error('Error: ', error);
            });
    };

    return (
        <div className='main-page-bg'>
            {isLoading ? <LoadingSpinner message={'Please wait while we are extracting data....'} /> :
                <div className="register-container">
                    <h1>Register Through CNIC</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="file-input-container">
                            <label className="file-input-label">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                                Choose File
                            </label>
                            {file && <p>Selected File: {file.name}</p>}
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit">Register</button>
                    </form>
                    <div className="login-option">
                        <p style={{color:'aliceblue'}}>Already have an account?
                            <NavLink to="/login">Login Now</NavLink>
                        </p>
                    </div>
                </div>
            }
        </div>
    );
}

export default Register;
