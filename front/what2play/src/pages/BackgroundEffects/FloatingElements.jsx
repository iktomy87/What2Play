import React, { useEffect } from 'react';
import styles from '../styles/BackgroundEffects.module.css';

const FloatingElements = () => {
  useEffect(() => {
    const container = document.getElementById('floatingElements');
    const elementCount = 8;
    
    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement('div');
      element.className = styles.floatingElement;
      element.style.left = Math.random() * 100 + '%';
      element.style.top = Math.random() * 100 + '%';
      element.style.width = Math.random() * 100 + 50 + 'px';
      element.style.height = element.style.width;
      element.style.animationDelay = Math.random() * 6 + 's';
      element.style.animationDuration = (Math.random() * 4 + 4) + 's';
      container.appendChild(element);
    }
  }, []);

  return <div id="floatingElements" className={styles.floatingElements}></div>;
};

export default FloatingElements;