// CSS Animation utility functions
// Note: AnimeJS has been deprecated, replaced with CSS animations

/**
 * Add a class to trigger the entrance animation and remove it after animation completes
 * @param {HTMLElement} element The element to animate
 */
export const animateTodoEnter = (element) => {
  if (!element) return;
  
  // Add the CSS class that triggers the animation
  element.classList.add('todo-item-enter');
  
  // Remove the class after the animation completes to avoid conflicts with future animations
  setTimeout(() => {
    element.classList.remove('todo-item-enter');
  }, 600);
};

/**
 * Animate a todo item when it's completed using CSS
 * @param {HTMLElement} element The element to animate
 * @param {Function} onComplete Callback to run when animation completes
 */
export const animateTodoComplete = (element, onComplete) => {
  if (!element) return;
  
  const pencilElement = element.querySelector('.pencil-animation');
  if (pencilElement) {
    pencilElement.classList.add('completed');
  }
  
  // Apply color animation via CSS transition
  element.style.color = 'rgba(107, 114, 128, 0.8)';
  element.style.transition = 'color 0.5s ease';
  
  // Call the callback after animation completes
  setTimeout(() => {
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }, 500);
};

/**
 * Animate a todo item when it's deleted using CSS
 * @param {HTMLElement} element The element to animate
 * @param {Function} onComplete Callback to run when animation completes
 */
export const animateTodoDelete = (element, onComplete) => {
  if (!element) return;
  
  // Add the CSS class that triggers the animation
  element.classList.add('todo-item-delete');
  
  // Call the callback after animation completes
  setTimeout(() => {
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }, 500);
};

/**
 * Animate a shake effect to indicate an error using CSS
 * @param {HTMLElement} element The element to animate
 */
export const animateShake = (element) => {
  if (!element) return;
  
  // Add a shake animation class
  element.classList.add('shake-animation');
  
  // Remove the class after the animation completes
  setTimeout(() => {
    element.classList.remove('shake-animation');
  }, 500);
};

/**
 * Animate a button press effect using CSS
 * @param {HTMLElement} element The element to animate
 */
export const animateButtonPress = (element) => {
  if (!element) return;
  
  // Add the button press animation class
  element.classList.add('button-press');
  
  // Remove the class after the animation completes
  setTimeout(() => {
    element.classList.remove('button-press');
  }, 300);
};

/**
 * Animate floating objects like particles in Nature theme
 * @param {HTMLElement} element The element to animate
 */
export const animateFloating = (element) => {
  if (!element) return;
  
  // Add floating animation class
  element.classList.add('animate-float');
};