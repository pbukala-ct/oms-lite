// components/Layout.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { fetchChannels } from '../utils/channels.js'; // Adjust the import path as needed
import { useRouter } from 'next/router';


const Layout = ({ children, onStoreFilterChange }) => {

  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [allStores, setAllStores] = useState(true);
  const [selectedChannelName, setSelectedChannelName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();



  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setUserEmail(savedEmail);
      };

    const loadChannels = async () => {
      try {
        const fetchedChannels = await fetchChannels();
        setChannels(fetchedChannels);
        const savedChannel = localStorage.getItem('selectedChannel');
        if (savedChannel) {
          setSelectedChannel(savedChannel);
          const channelName = fetchedChannels.find(c => c.id === savedChannel)?.name || 'Unknown Store';
          setSelectedChannelName(channelName);
        } else if (fetchedChannels.length > 0) {
          setSelectedChannel(fetchedChannels[0].id);
          setSelectedChannelName(fetchedChannels[0].name);
        }


      } catch (error) {
        console.error("Failed to load channels:", error);
      }
    };

    loadChannels();
  // Load allStores state from localStorage
  const savedAllStores = localStorage.getItem('allStores');
  if (savedAllStores !== null) {
    setAllStores(JSON.parse(savedAllStores));
  }
}, []);

useEffect(() => {
  if (onStoreFilterChange) {
    onStoreFilterChange(selectedChannel, allStores);
  }
}, [selectedChannel, allStores, onStoreFilterChange]);

const handleChannelChange = (e) => {
  const newChannel = e.target.value;
  setSelectedChannel(newChannel);
  const channelName = channels.find(c => c.id === newChannel)?.name || 'Unknown Store';
    setSelectedChannelName(channelName);
  localStorage.setItem('selectedChannel', newChannel);
};

const handleAllStoresChange = (e) => {
  const newAllStores = e.target.checked;
  setAllStores(newAllStores);
  localStorage.setItem('allStores', JSON.stringify(newAllStores));
};

const handleLogout = () => {
  localStorage.removeItem('selectedChannel');
  localStorage.removeItem('allStores');
  localStorage.removeItem('userEmail');
  router.push('/login');
};

  return (
    <div className="min-h-screen bg-ct-blue-light flex flex-col">
      <Head>
        <title>OMS Lite</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-white shadow-md relative z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-ct-blue">OMS Lite</h1>
              <div className="relative">
                <label htmlFor="store-select" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-ct-blue">
                  Select Store
                </label>
                <select
                  id="store-select"
                  value={selectedChannel}
                  onChange={handleChannelChange}
                  className="block w-64 pl-3 pr-10 py-2 text-base border-2 border-ct-blue focus:outline-none focus:ring-ct-blue focus:border-ct-blue sm:text-sm rounded-md appearance-none"
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ct-blue">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                  <input
                    id="all-stores"
                    type="checkbox"
                    checked={allStores}
                    onChange={handleAllStoresChange}
                    className="h-4 w-4 text-ct-blue focus:ring-ct-blue border-gray-300 rounded"
                  />
                  <label htmlFor="all-stores" className="ml-2 block text-sm text-gray-900">
                    All stores (admin mode)
                  </label>
                </div>
            </div>
            <div className="flex items-center">
            {userEmail && <span className="mr-4 text-ct-blue-dark">{userEmail}</span>}
              <button
                onClick={handleLogout}
                className="text-ct-blue-dark hover:text-ct-blue px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
              <div className="w-16 h-16 ml-4">
                <Image
                  src="/commercetools-logo-small.png"
                  alt="Commercetools"
                  width={64}
                  height={64}
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      {selectedChannelName && !allStores && (
      <div className="bg-ct-blue text-white py-4 px-6 text-center">
        <p className="text-sm font-medium mb-1">Selected Store</p>
        <h2 className="text-3xl font-bold">{selectedChannelName}</h2>
      </div>
    )}

      <main className="flex-grow flex w-full p-4 overflow-hidden">
        <div className="w-full overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;