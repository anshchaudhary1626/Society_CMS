import React, { useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const StarRating = ({ rating = 0, onChange, readOnly = false, size = 24 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (index) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };

  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = hoverRating ? index <= hoverRating : index <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={`transition-colors duration-150 focus:outline-none ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
          >
            {isFilled ? (
              <AiFillStar size={size} className="text-amber-400" />
            ) : (
              <AiOutlineStar size={size} className="text-slate-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
