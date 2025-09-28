import { useState, useEffect } from 'react';

const DecryptedText = ({
  text,
  speed = 50,
  maxIterations = 15,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  animateOn = 'hover',
  revealDirection = 'start',
  className = '',
  parentClassName = '',
  encryptedClassName = ''
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);

  const scramble = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (iterations >= maxIterations) return text[index];
        return characters[Math.floor(Math.random() * characters.length)];
      }).join(''));
      iterations++;
      if (iterations > maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view') {
      scramble();
    }
  }, []);

  const handleHover = () => {
    if (animateOn === 'hover' && !isAnimating) {
      setIsAnimating(true);
      scramble();
    }
  };

  return (
    <span
      className={className}
      onMouseEnter={handleHover}
      style={{ cursor: animateOn === 'hover' ? 'pointer' : 'default' }}
    >
      {displayText.split('').map((char, index) => (
        <span
          key={index}
          className={isAnimating && char !== text[index] ? encryptedClassName : ''}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default DecryptedText;
