'use client';

import styles from './AddressSearchDropdown.module.scss';

const AddressSearchDropdown = ({ error, results, onSelect, selectedIndex = -1 }) => {
  // console.log('[AddressSearchDropdown] Render:', { 
  //   resultsCount: results?.length || 0, 
  //   error,
  //   hasResults: !!results?.length,
  //   hasError: !!error,
  //   selectedIndex
  // });
  
  // Don't show dropdown if no results and no error
  if (!results?.length && !error) {
    // console.log('[AddressSearchDropdown] Not showing dropdown (no results and no error)');
    return null;
  }

  return (
    <ul className={styles.dropdown} role="listbox">
      {results && results.length > 0 ? (
        results.map((item, index) => {
          // console.log('[AddressSearchDropdown] Rendering item:', item.place_id);
          const isSelected = index === selectedIndex;
          return (
            <li
              key={item.place_id}
              role="option"
              aria-selected={isSelected}
              className={`${styles.item} ${isSelected ? styles.selected : ''}`}
              onMouseDown={(event) => {
                // Select before the input blur handler can close the dropdown.
                event.preventDefault();
                onSelect(item.place_id);
              }}
              onClick={(event) => event.preventDefault()}
              onMouseEnter={() => {
                // Visual feedback only, keyboard navigation state remains
              }}
            >
              <span className={styles.main}>{item.structured_formatting.main_text}</span>
              <span className={styles.secondary}>
                {item.structured_formatting.secondary_text}
              </span>
            </li>
          );
        })
      ) : null}
      {error && (
        <li
          role="option"
          className={`${styles.item} text-danger`}
          style={{ cursor: 'default' }}
        >
          {error}
        </li>
      )}
    </ul>
  );
};

export default AddressSearchDropdown;
