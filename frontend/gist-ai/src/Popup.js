import React, { useState, useEffect } from 'react';

const Popup = () => {
  const [readingList, setReadingList] = useState([]);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['readingList'], (result) => {
      setReadingList(result.readingList || []);
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>gist.ai</h2>
    </div>
  );
};

export default Popup;
