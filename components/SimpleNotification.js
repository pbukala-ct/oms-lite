// components/SimpleNotification.js
import React from 'react';

const SimpleNotification = ({ message, type = 'info', onClose }) => {
  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: type === 'error' ? '#f44336' : '#4CAF50',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
    },
  };

  return (
    <div style={styles.container}>
      {message}
      {/* <button onClick={onClose} style={{ marginLeft: '10px', cursor: 'pointer' }}>
        Close
      </button> */}
    </div>
  );
};

export default SimpleNotification;