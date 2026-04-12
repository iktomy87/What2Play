import React, { useState, useEffect, useRef } from 'react';
import recoStyles from '../../pages/styles/RecoPage.module.css';

const AutocompleteInput = ({
  label,
  name,
  value,
  data,
  onSelect,
  onChange,
  placeholder,
  loading,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const filtered = data.filter(item => 
        item.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [value, data, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setIsOpen(true);
    onChange(e);
  };

  return (
    <div className={recoStyles.formGroup}>
      <label>{label}</label>
      {loading ? (
        <div className="loading-indicator">Cargando datos...</div>
      ) : (
        <div className={recoStyles.autocompleteWrapper} ref={wrapperRef}>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            required={required}
            disabled={loading}
          />
          {isOpen && filteredData.length > 0 && (
            <div className="autocomplete-dropdown">
              {filteredData.slice(0, 50).map((item, index) => (
                <div
                  key={`${name}-${index}`}
                  className="dropdown-item"
                  onClick={() => {
                    onSelect(name, item.nombre);
                    setIsOpen(false);
                  }}
                >
                  {item.nombre}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
