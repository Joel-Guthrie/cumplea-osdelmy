document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const countdownScreen = document.getElementById('countdown-screen');
  const countdownElement = document.getElementById('countdown');
  const celebrationScreen = document.getElementById('celebration-screen');
  const mariachiContainer = document.getElementById('mariachi-container');
  const cardContainer = document.getElementById('card-container');
  
  // Elementos de audio
  const tickSound = document.getElementById('tick-sound');
  const confettiSound = document.getElementById('confetti-sound');
  const birthdaySong = document.getElementById('birthday-song');
  
  // Importar la función confetti desde la biblioteca confetti.js
  const confetti = window.confetti;
  
  // Función para iniciar la secuencia
  function startSequence() {
    // Intentar reproducir un sonido silencioso para desbloquear el audio en dispositivos móviles
    unlockAudio();
    
    startScreen.classList.add('hidden');
    countdownScreen.classList.remove('hidden');
    
    let count = 3;
    countdownElement.textContent = count;
    
    // Reproducir sonido de tick inmediatamente
    playSound(tickSound);
    
    // Iniciar la cuenta regresiva
    const countdownInterval = setInterval(() => {
      count--;
      countdownElement.textContent = count;
      
      // Reproducir sonido de tick en cada número
      playSound(tickSound);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        
        // Esperar un momento después del último número
        setTimeout(() => {
          countdownScreen.classList.add('hidden');
          celebrationScreen.classList.remove('hidden');
          
          // Lanzar confeti y reproducir su sonido
          launchConfetti();
          playSound(confettiSound);
          
          // Detener cualquier sonido anterior para evitar interferencias
          tickSound.pause();
          tickSound.currentTime = 0;
          
          // Pequeña pausa antes de reproducir la canción para evitar solapamiento
          setTimeout(() => {
            // Mostrar mariachis y reproducir canción
            mariachiContainer.classList.remove('hidden');
            
            // Reproducir la canción de cumpleaños
            birthdaySong.volume = 1.0;
            playSound(birthdaySong);
            
            // Después de 5 segundos, mostrar la tarjeta
            setTimeout(() => {
              cardContainer.classList.remove('hidden');
            }, 5000);
          }, 500);
        }, 1000);
      }
    }, 1000);
  }
  
  // Función para reproducir sonido de manera confiable
  function playSound(audioElement) {
    // Reiniciar el audio para asegurar que se reproduzca
    audioElement.currentTime = 0;
    
    // Intentar reproducir el audio
    const playPromise = audioElement.play();
    
    // Manejar posibles errores de reproducción
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Error reproduciendo audio:", error);
        
        // Intentar reproducir nuevamente después de un momento
        setTimeout(() => {
          audioElement.play().catch(e => console.error("Segundo intento fallido:", e));
        }, 300);
      });
    }
  }
  
  // Función para desbloquear audio en dispositivos móviles
  function unlockAudio() {
    // Crear un contexto de audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      
      // Crear un oscilador silencioso
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0; // Silenciar
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(0.001); // Detener inmediatamente
    }
    
    // También intentar reproducir y pausar todos los elementos de audio
    // para desbloquearlos en iOS
    [tickSound, confettiSound, birthdaySong].forEach(audio => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {
        // Ignorar errores aquí, es solo un intento de desbloqueo
      });
    });
  }
  
  // Función para lanzar confeti
  function launchConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Confeti desde los lados
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }
  
  // Iniciar la secuencia cuando se hace clic en el botón de inicio
  startButton.addEventListener('click', startSequence);
  
  // Asegurarse de que los sonidos se carguen correctamente
  window.addEventListener('load', function() {
    // Precargar todos los sonidos
    tickSound.load();
    confettiSound.load();
    birthdaySong.load();
  });
});