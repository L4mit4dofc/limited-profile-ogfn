document.addEventListener('DOMContentLoaded', () => {
  const fontSelect = document.querySelector('#font-family');
  const textColorInput = document.querySelector('#text-color');
  const appearanceStatus = document.querySelector('#appearance-status');
  const fontFamilies = {
    inter: '"Inter", Arial, sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    tahoma: 'Tahoma, Geneva, sans-serif',
    trebuchet: '"Trebuchet MS", sans-serif',
    georgia: 'Georgia, serif',
    times: '"Times New Roman", Times, serif',
    garamond: 'Garamond, "Times New Roman", serif',
    palatino: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    courier: '"Courier New", Courier, monospace',
    consolas: 'Consolas, "Courier New", monospace',
    'lucida-console': '"Lucida Console", Monaco, monospace',
    impact: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    'comic-sans': '"Comic Sans MS", "Comic Sans", cursive'
  };

  if (fontSelect instanceof HTMLSelectElement) {
    fontSelect.addEventListener('change', () => {
      const fontFamily = fontFamilies[fontSelect.value];
      if (fontFamily) {
        document.body.style.fontFamily = fontFamily;
      }
    });
  }

  if (textColorInput instanceof HTMLInputElement) {
    textColorInput.addEventListener('input', () => {
      document.body.dataset.customTextColor = 'true';
      document.body.style.setProperty('--custom-text-color', textColorInput.value);
    });
  }

  const seasonalSelect = document.querySelector('#seasonal-effect');
  const seasonalCanvas = document.querySelector('#seasonal-canvas');

  if (seasonalSelect instanceof HTMLSelectElement && seasonalCanvas instanceof HTMLCanvasElement) {
    const context = seasonalCanvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const particles = [];
    let animationFrame = null;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resizeCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      seasonalCanvas.width = Math.round(width * pixelRatio);
      seasonalCanvas.height = Math.round(height * pixelRatio);
      seasonalCanvas.style.width = `${width}px`;
      seasonalCanvas.style.height = `${height}px`;

      if (context) {
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
    };

    const createParticles = () => {
      const count = Math.min(54, Math.max(22, Math.round(width / 24)));
      particles.length = 0;

      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.2 + Math.random() * 2.8,
          speed: 0.35 + Math.random() * 0.8,
          drift: (Math.random() - 0.5) * 0.7,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.018,
          opacity: 0.16 + Math.random() * 0.1
        });
      }
    };

    const drawFrame = (animate) => {
      if (!context) {
        return;
      }

      const season = seasonalSelect.value;
      context.clearRect(0, 0, width, height);

      if (season === 'summer') {
        const glow = context.createRadialGradient(width * 0.82, 0, 0, width * 0.82, 0, Math.max(width, height) * 0.72);
        glow.addColorStop(0, 'rgba(255, 207, 125, 0.13)');
        glow.addColorStop(1, 'rgba(255, 207, 125, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      particles.forEach((particle) => {
        if (animate) {
          particle.phase += 0.012;
          particle.x += particle.drift + Math.sin(particle.phase) * 0.24;
          particle.y += particle.speed;
          particle.rotation += particle.rotationSpeed;

          if (particle.y > height + 12) {
            particle.y = -12;
            particle.x = Math.random() * width;
          }
          if (particle.x < -12) particle.x = width + 12;
          if (particle.x > width + 12) particle.x = -12;
        }

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);

        if (season === 'snow') {
          context.fillStyle = `rgba(255, 255, 255, ${0.36 + (particle.size / 3) * 0.24})`;
          context.beginPath();
          context.arc(0, 0, particle.size * 0.62, 0, Math.PI * 2);
          context.fill();
        } else if (season === 'summer') {
          context.fillStyle = `rgba(255, 226, 171, ${particle.opacity})`;
          context.beginPath();
          context.arc(0, 0, particle.size * 0.48, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillStyle = season === 'spring'
            ? 'rgba(255, 203, 212, 0.48)'
            : 'rgba(208, 129, 75, 0.54)';
          context.beginPath();
          context.ellipse(0, 0, particle.size * 0.72, particle.size * 0.38, 0, 0, Math.PI * 2);
          context.fill();
          if (season === 'autumn') {
            context.strokeStyle = 'rgba(91, 48, 26, 0.36)';
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(-particle.size * 0.55, 0);
            context.lineTo(particle.size * 0.55, 0);
            context.stroke();
          }
        }

        context.restore();
      });
    };

    const stopAnimation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    const animateFrame = () => {
      drawFrame(true);
      animationFrame = window.requestAnimationFrame(animateFrame);
    };

    const updateSeason = () => {
      stopAnimation();
      const season = seasonalSelect.value;
      document.body.dataset.season = season;
      seasonalCanvas.hidden = season === 'none' || !context;

      if (seasonalCanvas.hidden) {
        if (context) context.clearRect(0, 0, width, height);
        return;
      }

      createParticles();
      drawFrame(false);

      if (!reducedMotion.matches && !document.hidden) {
        animationFrame = window.requestAnimationFrame(animateFrame);
      }
    };

    resizeCanvas();
    seasonalSelect.addEventListener('change', updateSeason);
    window.addEventListener('resize', () => {
      resizeCanvas();
      if (seasonalSelect.value !== 'none') updateSeason();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAnimation();
      } else if (seasonalSelect.value !== 'none' && !reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animateFrame);
      }
    });
    reducedMotion.addEventListener('change', () => {
      if (seasonalSelect.value !== 'none') updateSeason();
    });
    updateSeason();
  }

  const musicForm = document.querySelector('#music-settings');
  const musicFile = document.querySelector('#music-file');
  const musicLink = document.querySelector('#music-link');
  const musicAudio = document.querySelector('#music-audio');
  const musicPlayer = document.querySelector('#music-player');
  const musicStatus = document.querySelector('#music-status');
  let currentObjectUrl = null;

  const setMusicStatus = (message) => {
    if (musicStatus instanceof HTMLElement) {
      musicStatus.textContent = message;
    }
  };

  const clearMusicPlayer = () => {
    if (musicAudio instanceof HTMLAudioElement) {
      musicAudio.pause();
      musicAudio.removeAttribute('src');
      musicAudio.load();
      musicAudio.hidden = true;
    }

    if (musicPlayer instanceof HTMLElement) {
      musicPlayer.replaceChildren();
      musicPlayer.hidden = true;
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };

  const getEmbedUrl = (rawLink) => {
    let url;

    try {
      url = new URL(rawLink);
    } catch {
      return null;
    }

    if (url.protocol !== 'https:' || url.username || url.password) {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const youtubeHosts = new Set([
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'music.youtube.com',
      'youtu.be',
      'www.youtu.be'
    ]);

    if (youtubeHosts.has(hostname)) {
      let videoId = '';

      if (hostname.endsWith('youtu.be')) {
        videoId = url.pathname.split('/').filter(Boolean)[0] || '';
      } else if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || '';
      } else {
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(pathParts[0])) {
          videoId = pathParts[1] || '';
        }
      }

      return /^[A-Za-z0-9_-]{11}$/.test(videoId)
        ? { provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${videoId}` }
        : null;
    }

    if (hostname === 'open.spotify.com' || hostname === 'www.spotify.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const contentIndex = parts[0] === 'intl' && parts.length > 2 ? 2 : 0;
      const contentType = parts[contentIndex];
      const contentId = parts[contentIndex + 1];

      return ['track', 'album', 'playlist', 'episode', 'show'].includes(contentType)
        && /^[A-Za-z0-9]+$/.test(contentId || '')
        ? { provider: 'Spotify', src: `https://open.spotify.com/embed/${contentType}/${contentId}` }
        : null;
    }

    return null;
  };

  if (
    musicForm instanceof HTMLFormElement
    && musicFile instanceof HTMLInputElement
    && musicLink instanceof HTMLInputElement
    && musicAudio instanceof HTMLAudioElement
    && musicPlayer instanceof HTMLElement
  ) {
    musicFile.addEventListener('change', () => {
      const file = musicFile.files?.[0];
      if (!file) {
        return;
      }

      if (file.type !== 'audio/mpeg' && !file.name.toLowerCase().endsWith('.mp3')) {
        clearMusicPlayer();
        musicLink.value = '';
        musicFile.value = '';
        setMusicStatus('Choose an MP3 file.');
        return;
      }

      clearMusicPlayer();
      musicLink.value = '';
      currentObjectUrl = URL.createObjectURL(file);
      musicAudio.src = currentObjectUrl;
      musicAudio.hidden = false;
      setMusicStatus(`${file.name} is ready. Press Play to listen.`);
    });

    musicForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const embed = getEmbedUrl(musicLink.value.trim());

      if (!embed) {
        clearMusicPlayer();
        musicFile.value = '';
        setMusicStatus('Enter a valid YouTube video or Spotify track, album, playlist, episode, or show link.');
        return;
      }

      clearMusicPlayer();
      musicFile.value = '';

      const frame = document.createElement('iframe');
      frame.src = embed.src;
      frame.title = `${embed.provider} music player`;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      musicPlayer.append(frame);
      musicPlayer.hidden = false;
      setMusicStatus(`${embed.provider} player loaded. Press Play in the player to listen.`);
    });
  }

  const languagePickerStatus = document.querySelector('#language-picker-status');
  const showTranslationError = () => {
    if (languagePickerStatus instanceof HTMLElement) {
      languagePickerStatus.textContent = 'Language options could not load. Please try again later.';
    }
  };

  window.googleTranslateElementInit = () => {
    if (!window.google || !window.google.translate) {
      showTranslationError();
      return;
    }

    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        autoDisplay: false
      },
      'google_translate_element'
    );
  };

  const translationScript = document.createElement('script');
  translationScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  translationScript.async = true;
  translationScript.onerror = showTranslationError;
  document.head.append(translationScript);

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNavigation = document.querySelector('#site-navigation');

  if (menuToggle instanceof HTMLButtonElement && siteNavigation instanceof HTMLElement) {
    const closeMenu = () => {
      siteNavigation.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      siteNavigation.hidden = isOpen;
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    });

    siteNavigation.addEventListener('click', (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !siteNavigation.hidden) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  const skillItems = document.querySelectorAll('.skill-item');

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  }
});
