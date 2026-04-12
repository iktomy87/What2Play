import React from 'react';

const GenreSelector = ({ options, selectedGenres, onChange, recoStyles }) => {
  return (
    <fieldset className={recoStyles.formGroup}>
      <legend>Géneros preferidos (opcional)</legend>
      <div className={recoStyles.genreCheckboxes}>
        {options.map((genre) => (
          <label key={genre} className={recoStyles.checkboxLabel}>
            <input 
              type="checkbox" 
              value={genre} 
              onChange={onChange} 
              checked={selectedGenres.includes(genre)} 
            />
            <span className={recoStyles.checkboxCustom}></span>
            {genre}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default GenreSelector;
