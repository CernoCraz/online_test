document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('bubbles');
    const ctx = canvas.getContext('2d');
    
    // Устанавливаем размер canvas равным размеру окна
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Создаем массив пузырьков
    const bubbles = [];
    const bubbleCount = 50; // Количество пузырьков
    
    class Bubble {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.size = Math.random() * 4 + 2; // Размер пузырька
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + this.size;
            this.speed = Math.random() * 0.5 + 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.y -= this.speed;
            if (this.y < -this.size) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Создаем пузырьки
    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(new Bubble());
    }
    
    // Анимация
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}); 