import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, PresentationControls } from "@react-three/drei";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './Loader';
import Modal from 'react-modal';
import '../Styles/Create_Ad.css';
import { NavLink } from 'react-router-dom';


const categories = ["Jeep", "SUVs", "Mini SUVs", "Hatchback", "Imported"];

function Model({ filename, scale, ParentFunction, ...props }) {
    const { scene } = useGLTF(filename);
    return <primitive object={scene} scale={scale} {...props} />;
}

function CreateAd() {
    const [uploadedModel, setUploadedModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [adTitle, setAdTitle] = useState("");
    const [adCategory, setAdCategory] = useState("");
    const [adEngine, setAdEngine] = useState("");
    const [IsDisable, setIsDisable] = useState(false);
    const [adDescription, setAdDescription] = useState("");
    const [adPrice, setAdPrice] = useState("");
    const [adLocation, setAdLocation] = useState("");
    const [adNumber, setAdNumber] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [AdError, setAdError] = useState('');
    const imageContainerRef = useRef(null);
    const [IsCreated, setIsCreated] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const navigate = useNavigate();

    function convertToLocalCurrency(number) {
        const crore = Math.floor(number / 10000000); // Get the crore value
        const lakh = Math.floor((number % 10000000) / 100000); // Get the lakh value
        const thousand = Math.floor((number % 100000) / 1000); // Get the thousand value
        const hundred = Math.floor((number % 1000) / 100); // Get the hundred value
        const rupees = number % 100; // Get the rupees value

        // Constructing the crore-lakh format string
        let result = '';
        if (crore > 0) {
            result += crore + ' Crore ';
        }
        if (lakh > 0) {
            result += lakh + ' Lakh ';
        }
        if (thousand > 0) {
            result += thousand + ' Thousand ';
        }
        if (hundred > 0) {
            result += hundred + ' Hundred ';
        }
        if (rupees > 0) {
            result += rupees + ' Rupees ';
        }

        return result.trim();
    }

    // Usage:
    //const adPriceInCroreLakh = convertToCroreLakh(adPrice);

    useEffect(() => {
        // Scroll to the center of the image container after the image is uploaded
        if ((uploadedImage && imageContainerRef.current) || (uploadedModel && imageContainerRef.current)) {
            imageContainerRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }, [uploadedImage, uploadedModel]);

    const handleModalClose = () => {
        setIsCreated(false);
        navigate('/home');

    };

    useEffect(() => {
        if (AdError !== '') {
            // Scroll to the end of the page
            window.scrollTo(0, document.body.scrollHeight);
        }
    }, [AdError]);

    // Function to handle the file upload

    const handleFileUpload = (event) => {
        setAdError('');
        const file = event.target.files[0];
        if (file) {
            if (imageContainerRef.current) {
                imageContainerRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
            }
            setFile(file);
            setIsLoading(true);
            const fileURL = URL.createObjectURL(file);
            const filename = file.name.toLowerCase();

            if (filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".png")) {
                const img = new Image();
                img.src = fileURL;
                img.onload = () => setIsLoading(false);
                setUploadedImage(fileURL);
                setUploadedModel(null);
            } else if (filename.endsWith(".glb") || filename.endsWith(".gltf")) {
                setUploadedModel(fileURL);
                setUploadedImage(null);
                setIsLoading(false);
            }
        }
    };

    // Function to handle ad submission

    const handleAdSubmission = async (event) => {
        event.preventDefault();
        if (adTitle.trim() === '') {
            setError('1');
            return;
        }
        else if (adCategory.trim() === '') {
            setError('2');
            return;
        }
        else if (adEngine.trim() === '' || isNaN(adEngine.trim()) || adEngine.trim().toLowerCase().includes('e')) {
            setError('3');
            return;
        }
        else if (adDescription.trim() === '') {
            setError('4');
            return;
        }
        else if (adPrice.trim() === '' || isNaN(adPrice.trim()) || adPrice.trim().toLowerCase().includes('e')) {
            setError('5');
            return;
        }
        else if (adLocation.trim() === '') {
            setError('6');
            return;
        }
        else if (adNumber.trim() === '' || isNaN(adNumber.trim()) || adNumber.trim().toLowerCase().includes('e')) {
            setError('7');
            return;
        }
        else if (!file) {
            setError('8');
            return;
        }

        const formData = new FormData();
        formData.append("adTitle", adTitle.trim());
        formData.append("adCategory", adCategory.trim());
        formData.append("adEngine", adEngine.trim());
        formData.append("adDescription", adDescription.trim());
        formData.append("adPrice", adPrice.trim());
        formData.append("adLocation", adLocation.trim());
        formData.append("adNumber", adNumber.trim());
        formData.append("adPhoto", file);
        setIsLoading2(true);
        try {
            const response = await fetch("http://localhost:3001/create_ad", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setIsLoading2(false);
                setIsCreated(true);
                console.log("Ad submitted successfully");
            } else {
                setIsLoading2(false);
                setAdError('Unable to create ad at this moment! Please try again');
                console.error("Failed to submit ad");
            }
        } catch (error) {
            // Handle network errors or exceptions
            setIsLoading2(false);
            setAdError('Unable to create ad at this moment! Please try again');
            console.error("An error occurred while submitting the ad", error);
        }
    };

    return (
        <div className="create-ad-body">
            {isLoading2 ? <LoadingSpinner message={'Please wait while ad is being created....'} /> :
                <div className="main-div">
                    <form onSubmit={handleAdSubmission}>
                        <h1>Create Your Ad</h1>
                        <div>
                            <label htmlFor="adTitle">Ad Title:*</label>
                            <input
                                type="text"
                                id="adTitle"
                                value={adTitle}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdTitle(e.target.value);
                                    if (e.target.value.trim() === '') {
                                        setError('1');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setError('1');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '1' && <div className="ad-error-message">Title can't be empty</div>}
                        </div>
                        <div>
                            <label htmlFor="adCategory">Ad Category:*</label>
                            <select
                                id="adCategory"
                                value={adCategory}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdCategory(e.target.value);
                                    setIsDisable(true);
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setError('2');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            >
                                <option disabled={IsDisable} value=''>
                                    Please Select a Category
                                </option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {error === '2' && <div className="ad-error-message">Please select a category from it</div>}
                        </div>
                        <div>
                            <label htmlFor="adEngine">Engine Power (CC):*</label>
                            <input
                                type="text"
                                id="adEngine"
                                value={adEngine}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdEngine(e.target.value);
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('3');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('3');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '3' && <div className="ad-error-message">Engine Power is not a valid number</div>}
                        </div>
                        <div>
                            <label htmlFor="adDescription">Ad Description:*</label>
                            <textarea
                                id="adDescription"
                                rows={4}
                                value={adDescription}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdDescription(e.target.value);
                                    if (e.target.value.trim() === '') {
                                        setError('4');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setError('4');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '4' && <div className="ad-error-message">Description can't be empty</div>}
                        </div>
                        <div>
                            <label htmlFor="adPrice">Ad Price (PKR):*</label>
                            <input
                                type="text"
                                id="adPrice"
                                value={adPrice}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdPrice(e.target.value.trim());
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('5');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('5');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '5' ? <div className="ad-error-message">Price can only be in digits and can't be empty</div> : adPrice && <div className="ad-help-message">{convertToLocalCurrency(adPrice)}</div>}
                        </div>
                        <div>
                            <label htmlFor="adLocation">Ad Location:*</label>
                            <input
                                type="text"
                                id="adLocation"
                                value={adLocation}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdLocation(e.target.value);
                                    if (e.target.value.trim() === '') {
                                        setError('6');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setError('6');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '6' && <div className="ad-error-message">Location can't be empty</div>}
                        </div>
                        <div>
                            <label htmlFor="adNumber">Contact Number:*</label>
                            <input
                                type="text"
                                id="adNumber"
                                value={adNumber}
                                onChange={(e) => {
                                    setAdError('');
                                    setAdNumber(e.target.value);
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('7');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value.trim() === '' || isNaN(e.target.value.trim()) || e.target.value.trim().toLowerCase().includes('e')) {
                                        setError('7');
                                    }
                                    else {
                                        setError('');
                                    }
                                }}
                            />
                            {error === '7' && <div className="ad-error-message">Please enter a valid number</div>}
                        </div>
                        <div className="file-input-container">
                            <label className="file-input-label">
                                <input type="file" accept=".glb,.gltf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                                Upload Photo
                            </label>
                            {file && <p>Selected File: {file.name}</p>}
                        </div>
                        {error === '8' && <div className="ad-error-message">Please select any photo for this Ad</div>}

                        {uploadedModel ? isLoading ? <div className="loading-container" ref={imageContainerRef}>Loading....</div> :
                            <div className="canvas-container" ref={imageContainerRef}>
                                <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} className="canvas-div" gl={{ alpha: false }}
                                    onCreated={({ gl }) => {
                                        gl.toneMappingExposure = 1.5;
                                    }}>
                                    <color attach="background" args={["#ffffff"]} />
                                    <ambientLight intensity={0.8} />
                                    <pointLight position={[10, 10, 10]} />
                                    <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                                        <Model filename={uploadedModel} scale={0.15} />
                                    </PresentationControls>
                                </Canvas>
                            </div>
                            : <></>
                        }
                        {uploadedImage ? isLoading ? <div className="loading-container" ref={imageContainerRef}>Loading....</div> :
                            <div className="image-container" ref={imageContainerRef}>
                                <img src={uploadedImage} alt="Uploaded" className="image-div" />
                            </div>
                            : <></>
                        }
                        <div className="button-container">
                            <button type="submit">Submit Ad</button>
                        </div>
                        {AdError !== '' && (
                            <p className="reg-error">{AdError}</p>
                        )}
                    </form>
                    <div className="create-add-back-button-div">
                        <NavLink className="back-button" to="/home">Go Back</NavLink>
                    </div>
                    <Modal
                        className="modal"
                        overlayClassName="modal-overlay"
                        isOpen={IsCreated}
                        onRequestClose={handleModalClose}>
                        <h2>Ad Created Successful!</h2>
                        <p>Continue to home page to view ads.</p>
                        <div className='OK-btn-div'><button onClick={handleModalClose}>OK</button></div>
                    </Modal>
                </div>
            }
        </div>
    );
}

export default CreateAd;
