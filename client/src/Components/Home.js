import '../Styles/Home.css';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import Ad from './Ad';
import LoadingSpinner from './Loader';
import { NavLink } from 'react-router-dom';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

// Set the app element for react-modal
Modal.setAppElement(document.body);

const categories = ["Jeep", "SUVs", "Sedan", "Hatchback", "Imported"];
let all_ads;
let filter_by_category_ads;

const Home = ({ setIsAuthenticated }) => {
  const [ad, setAd] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAds, setFilteredAds] = useState([]);
  const [count, setcount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [adCategory, setAdCategory] = useState("All");
  const [isOpened, setIsOpened] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [openedAds, setOpenedAds] = useState(() => {
    const storedOpenedAds = localStorage.getItem('openedAds');
    return storedOpenedAds ? JSON.parse(storedOpenedAds) : [];
  });
  const myref = useRef();

  //Analyzing ads based on user interest
  const AnalyzeOpenedAds = (openedAds) => {
    const brandCounts = {};
    let mostFrequentBrand = '';
    let maxCount = 0;
    let minAdEngine = Infinity;
    let maxAdEngine = -Infinity;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    openedAds.forEach((ad) => {
      const brand = ad.adTitle.split(' ')[0].toLowerCase();
      const adEngine = Number(ad.adEngine);
      const price = Number(ad.adPrice);

      // Count the occurrence of each brand
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;

      // Update the most frequent brand
      if (brandCounts[brand] > maxCount) {
        maxCount = brandCounts[brand];
        mostFrequentBrand = brand;
      }

      // Update the minimum and maximum adEngine values
      if (adEngine < minAdEngine) {
        minAdEngine = adEngine;
      }
      if (adEngine > maxAdEngine) {
        maxAdEngine = adEngine;
      }

      // Update the minimum and maximum prices
      if (price < minPrice) {
        minPrice = price;
      }
      if (price > maxPrice) {
        maxPrice = price;
      }
    });

    return {
      brand: mostFrequentBrand,
      minAdEngine,
      maxAdEngine,
      minPrice,
      maxPrice,
    };
  };

  // Fetch ads from the server
  useEffect(() => {
    fetch('http://localhost:3001/home')
      .then(response => response.json())
      .then(data => {
        all_ads = data.ads;
        setAd(data.ads);

        //Filtering Ads based on user interests
        if (openedAds && openedAds.length > 2) {
          console.log('Opened Ads: ', openedAds.length);
          const userInterests = AnalyzeOpenedAds(openedAds);
          console.log('Frequent Brand: ',userInterests.brand);
          let chosenCategory = '';

          const brandCount = openedAds.filter((ad) => ad.adTitle.toLowerCase().startsWith(userInterests.brand)).length;
          const brandPercentage = (brandCount / openedAds.length) * 100;
          console.log('Frequent Brand Percentage: ', brandPercentage);
          console.log('Engine Difference: ', Math.abs(userInterests.maxAdEngine - userInterests.minAdEngine));

          if (brandPercentage >= 90) {
            console.log('Brand selected');
            chosenCategory = 'brand';
          } else if (Math.abs(userInterests.maxAdEngine - userInterests.minAdEngine) <= 502) {
            console.log('Engine selected');
            chosenCategory = 'adEngine';
          } else {
            console.log('Price selected');
            chosenCategory = 'price';
          }
          const filtered = all_ads.filter((ad) => {
            const brand = ad.adTitle.split(' ')[0].toLowerCase();
            const adEngine = Number(ad.adEngine);
            console.log('AdEngine: ',adEngine);
            console.log('Min Engine:',userInterests.minAdEngine);
            const price = Number(ad.adPrice);

            if (chosenCategory === 'brand' && brand === userInterests.brand) {
              return true;
            }

            if (chosenCategory === 'adEngine' && Math.abs(adEngine - userInterests.minAdEngine) < 502) {
              return true;
            }

            if (chosenCategory === 'price' && price >= userInterests.minPrice && price <= userInterests.maxPrice) {
              return true;
            }

            return false;
          });

          filter_by_category_ads = filtered;
          setFilteredAds(filtered);
        } else {
          console.log('Not Filtered by user interests');
          setFilteredAds(data.ads);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching ads:', error);
      });
  }, []);

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

  const handleModalClose = () => {
    setIsOpened(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('openedAds');
    setIsAuthenticated(false);
  }

  const handleAdOpen = (ad) => {
    setSelectedAd(ad);
    setIsOpened(true);

    // Check if the ad already exists in the openedAds array
    const isAdOpened = openedAds.some((openedAd) => openedAd._id === ad._id);
    if (isAdOpened) {
      return;
    }

    // Add the opened ad to the openedAds array
    const updatedOpenedAds = [...openedAds, ad];
    setOpenedAds(updatedOpenedAds);

    // Store the openedAds data in localStorage
    localStorage.setItem('openedAds', JSON.stringify(updatedOpenedAds));
  }

  //Filtering on Category

  const handleCategory = (e) => {
    myref.current.value = '';
    setAdCategory(e.target.value);
    if (e.target.value !== 'All') {
      const filtered = ad.filter((_ad) => {
        const { adCategory } = _ad;
        const searchCategory = e.target.value.toLowerCase();
        return (
          adCategory.toLowerCase().includes(searchCategory)
        );
      });
      filter_by_category_ads = filtered;
      setFilteredAds(filtered);
    }
    else {
      setFilteredAds(ad);
    }
  }

  //Filtering on search button

  const handleSearchButton = (e) => {
    if (searchTerm.trim() !== '') {
      if (adCategory === 'All') {
        const filtered = all_ads.filter((_ad) => {
          const { adTitle } = _ad;
          //const { title, category, description, location } = ad;
          const searchQuery = searchTerm.toLowerCase();
          console.log('Search Query: ', searchQuery);

          return (
            adTitle.toLowerCase().includes(searchQuery) /*||
            description.toLowerCase().includes(searchQuery) ||
            location.toLowerCase().includes(searchQuery) */
          );
        });
        setcount(filtered.length);
        setFilteredAds(filtered);
      } else {
        const filtered = filter_by_category_ads.filter((_ad) => {
          const { adTitle } = _ad;
          //const { title, category, description, location } = ad;
          const searchQuery = searchTerm.toLowerCase();
          console.log('Search Query: ', searchQuery);

          return (
            adTitle.toLowerCase().includes(searchQuery) /*||
            description.toLowerCase().includes(searchQuery) ||
            location.toLowerCase().includes(searchQuery) */
          );
        });
        setcount(filtered.length);
        setFilteredAds(filtered);
      }
    }
    else {
      setcount(0);
      if (adCategory === 'All') {
        setFilteredAds(all_ads);
      }
      else {
        setFilteredAds(filter_by_category_ads);
      }
    }
  };

  //Quick Search on every input letter

  const handleSearch = (e) => {
    if (adCategory === 'All') {
      setcount(0);
      setSearchTerm(e.target.value);
      if (e.target.value.trim() !== '') {
        const filtered = all_ads.filter((_ad) => {
          const { adTitle } = _ad;
          //const { title, category, description, location } = ad;
          const searchQuery = e.target.value.toLowerCase();

          return (
            adTitle.toLowerCase().includes(searchQuery) /*||
          description.toLowerCase().includes(searchQuery) ||
          location.toLowerCase().includes(searchQuery) */
          );
        });
        setFilteredAds(filtered);
      }
      else {
        setFilteredAds(all_ads);
      }
    }
    else {
      setcount(0);
      setSearchTerm(e.target.value);
      if (e.target.value.trim() !== '') {
        const filtered = filter_by_category_ads.filter((_ad) => {
          const { adTitle } = _ad;
          //const { title, category, description, location } = ad;
          const searchQuery = e.target.value.toLowerCase();

          return (
            adTitle.toLowerCase().includes(searchQuery) /*||
            description.toLowerCase().includes(searchQuery) ||
            location.toLowerCase().includes(searchQuery) */
          );
        });
        setFilteredAds(filtered);
      }
      else {
        setFilteredAds(filter_by_category_ads);
      }
    }
  };

  return (
    <div className='home-body'>
      {isLoading ? <LoadingSpinner message={'Loading....'} /> :

        <div className="home-page">
          <div className='middle-div'>
            <div>
              <label className='label' htmlFor="adCategory">Category: </label>
              <select
                id="adCategory"
                value={adCategory}
                onChange={(e) => handleCategory(e)}
              >
                <option value='All'>
                  All
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <div className='uper-div'>
            <NavLink className="sell-button" to="/create-ad">Sell Now</NavLink>
            <div className="search-bar">
              <input ref={myref} type="text" placeholder="Search" onChange={handleSearch} className="search-input" />
              <button onClick={handleSearchButton} className="search-button">Search</button>
            </div>
          </div>

          <div>
            {count !== 0 ? <p>Total Matches Found: {count}</p> : <></>}
          </div>
          <div className='home-ads'>
            {[...filteredAds].reverse().map((ad) => (
              <div className='ad-hover' key={ad._id} onClick={() => handleAdOpen(ad)}>
                <Suspense key={ad._id} fallback={<LoadingSpinner message={'Loading...'} />}>
                  <Ad
                    AdTitle={ad.adTitle}
                    AdCategory={ad.adCategory}
                    AdEngine={ad.adEngine + ' CC'}
                    AdDescription={ad.adDescription}
                    AdPrice={convertToLocalCurrency(ad.adPrice)}
                    AdLocation={ad.adLocation}
                    AdNumber={ad.adNumber}
                    AdImage={ad.adPhotoURL}
                  />
                </Suspense>
              </div>
            ))}
          </div>
          <Modal
            className="modal-home"
            overlayClassName="modal-home-overlay"
            isOpen={isOpened}
            onRequestClose={handleModalClose}>
            <FaTimes size={30} onClick={handleModalClose} className='cross-icon' />
            {selectedAd && (
              <Suspense fallback={<LoadingSpinner message={'Loading...'} />}>
                <Ad
                  AdTitle={selectedAd.adTitle}
                  AdCategory={selectedAd.adCategory}
                  AdEngine={selectedAd.adEngine + ' CC'}
                  AdDescription={selectedAd.adDescription}
                  AdPrice={convertToLocalCurrency(selectedAd.adPrice)}
                  AdLocation={selectedAd.adLocation}
                  AdNumber={selectedAd.adNumber}
                  AdImage={selectedAd.adPhotoURL}
                  isInModal={true}
                />
              </Suspense>
            )}
          </Modal>
        </div>
      }
    </div>
  );
};

export default Home;
