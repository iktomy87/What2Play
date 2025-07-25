import React, { useEffect } from 'react';
import styles from '../styles/BackgroundEffects.module.css';

const Stars = () => {
  useEffect(() => {
    const starsContainer = document.getElementById('stars');
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = styles.star;
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 2 + 's';
      starsContainer.appendChild(star);
    }

    // Efecto de parallax
    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      const stars = document.querySelectorAll(`.${styles.star}`);
      stars.forEach((star, index) => {
        const speed = (index % 3 + 1) * 0.5;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        star.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div id="stars" className={styles.stars}></div>;
};

export default Stars;