import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo.png'; 
import styles from '../pages/styles/HomePage.module.css'; 

const Header = () => {
  return (
    <header className={styles.header}>
      <Link to="/">
      <div className={styles.logoContainer} >
        <img 
          src={logoImage} 
          className={styles.logoImage}
        />
      </div>
      </Link>
    </header>
  );
};

export default Header;