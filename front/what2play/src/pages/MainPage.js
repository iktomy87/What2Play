import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Stars from './BackgroundEffects/Stars';
import FloatingElements from './BackgroundEffects/FloatingElements';
import styles from './styles/HomePage.module.css';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection/HeroSection';
import Features from '../components/MainPage/Features';
import HowItWorks from '../components/MainPage/HowItWorks';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <Navbar />

      <HeroSection />
      <Stars />

      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default HomePage;