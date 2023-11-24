import React from 'react';
import { useState, useEffect,useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, PresentationControls } from "@react-three/drei";
import '../Styles/Ad.css';

function Model({ filename, scale, ...props }) {
  const { scene } = useGLTF(filename);
  return <primitive object={scene} scale={scale} {...props} />;
}

const Ad = ({ AdTitle, AdCategory, AdEngine, AdDescription, AdPrice, AdLocation, AdNumber, AdImage, isInModal }) => {
  const [uploadedModel, setUploadedModel] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    Is3D(AdImage);
  }, [AdImage]);

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  function Is3D(filename) {
    if (filename.endsWith(".glb") || filename.endsWith(".gltf")) {
      setUploadedModel(filename);
    }
  }

  return (
    <div className='ad-grid'>
      <div className={isInModal ? 'ad-modal' : 'ad'}>
        {uploadedModel ?
          <div className='ad-image-div'>
            <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 3, 5], fov: 45 }} className="ad-image" gl={{ alpha: false }}
              onCreated={({ gl }) => {
                gl.toneMappingExposure = 1.5;
              }} >
              <color attach="background" args={["#B6B6B6"]} />
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} />
              <PresentationControls ref={controlsRef} speed={1.5} global zoom={0.4} polar={[-0.1, Math.PI / 4]}>
                <Model filename={uploadedModel} scale={0.25} />
              </PresentationControls>
            </Canvas>
          </div> :
          <div className='ad-image-div'>
            <img src={AdImage} alt={AdTitle} className="ad-image ad-image2" />
          </div>
        }
        <div className="ad-details">
          <h3 className="ad-title">{AdTitle}</h3>
          <p className="ad-category">{AdCategory}</p>
          <p className="ad-engine">{AdEngine}</p>
          <p className="ad-description">{AdDescription}</p>
          <p className='ad-price'>{AdPrice}</p>
          <p className='ad-location'>{AdLocation}</p>
          <p className='ad-number'>{AdNumber}</p>
        </div>
        <div className='ad-btn-div'>
          <button className='ad-btn'>Buy</button>
          <button className='ad-btn'>Contact</button>
        </div>
      </div>
    </div >
  );
};

export default Ad;
