document.addEventListener('DOMContentLoaded', () => {
  const skillItems = document.querySelectorAll('.skill-item');

  skillItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 70}ms`;
    item.animate(
      [
        { transform: 'translateY(10px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      {
        duration: 600,
        delay: index * 70,
        fill: 'forwards',
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      }
    );
  });
});
