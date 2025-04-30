const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles.forEach(particle => particle.reset());
});
const particles = [];
class Particle {
    constructor() {
        this.reset();
        this.color = "#ff0000"; 
        this.returnForce = 0.05; 
        this.pushed = false; 
        this.size = 1; 
    }
    reset() {
        const scale = Math.min(canvas.width, canvas.height) / 3;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 50;
        let x, y;
        do {
            x = (Math.random() - 0.5) * scale * 1.8 + centerX;
            y = (Math.random() - 0.5) * scale * 1.8 + centerY;
        } while (!this.isInsideHeart(x, y, scale));
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        this.speed = 0.2 + Math.random() * 0.2; 
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        this.pushed = false;
    }
    isInsideHeart(x, y, scale) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 50;
        const xLocal = (x - centerX) / scale;
        const yLocal = -((y - centerY) / scale);
        return Math.pow(xLocal * xLocal + yLocal * yLocal - 1, 3) - xLocal * xLocal * yLocal * yLocal * yLocal < 0;
    }
    update() {
        const scale = Math.min(canvas.width, canvas.height) / 3;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 50;
        const prevX = this.x;
        const prevY = this.y;
        const nextX = this.x + this.vx;
        const nextY = this.y + this.vy;
        const insideHeart = this.isInsideHeart(nextX, nextY, scale);
        if (this.pushed) {
            this.x = nextX;
            this.y = nextY;
            if (!this.isInsideHeart(this.x, this.y, scale)) {
                const dx = centerX - this.x;
                const dy = centerY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.vx += (dx / distance) * this.returnForce;
                this.vy += (dy / distance) * this.returnForce;
                const maxReturnSpeed = 4;
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (currentSpeed > maxReturnSpeed) {
                    this.vx = (this.vx / currentSpeed) * maxReturnSpeed;
                    this.vy = (this.vy / currentSpeed) * maxReturnSpeed;
                }
            } else {
                this.pushed = false;
                const angle = Math.atan2(this.vy, this.vx);
                this.speed = 0.2 + Math.random() * 0.2;
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
            }
        } else {
            if (insideHeart) {
                this.x = nextX;
                this.y = nextY;
                if (Math.random() < 0.01) {
                    const angle = Math.atan2(this.vy, this.vx) + (Math.random() - 0.5) * 0.4;
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed;
                }
            } else {
                let bestAngle = 0;
                let maxDistance = 0;
                for (let i = 0; i < 8; i++) {
                    const testAngle = (i / 8) * Math.PI * 2;
                    const testX = this.x + Math.cos(testAngle) * this.speed;
                    const testY = this.y + Math.sin(testAngle) * this.speed;

                    if (this.isInsideHeart(testX, testY, scale)) {
                        const dx = testX - this.x;
                        const dy = testY - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist > maxDistance) {
                            maxDistance = dist;
                            bestAngle = testAngle;
                        }
                    }
                }
                if (maxDistance > 0) {
                    this.vx = Math.cos(bestAngle) * this.speed;
                    this.vy = Math.sin(bestAngle) * this.speed;
                    this.x += this.vx;
                    this.y += this.vy;
                } else {
                    const dx = centerX - this.x;
                    const dy = centerY - this.y;
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed;
                    this.x += this.vx;
                    this.y += this.vy;
                }
            }
        }
        this.vx *= 1.5;
        this.vy *= 1.5;
        const minSpeed = 0.1;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed < minSpeed && !this.pushed) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
const initialParticleCount = 19000;
for (let i = 0; i < initialParticleCount; i++) {
    particles.push(new Particle());
}
let mouseX = 0, mouseY = 0;
let mouseActive = false;
canvas.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
});
canvas.addEventListener("mouseout", () => {
    mouseActive = false;
});
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        if (mouseActive) {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const mouseRadius = 90; 
            if (distance < mouseRadius) {
                const force = (1 - distance / mouseRadius) * 10; 
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
                particle.pushed = true;
            }
        }
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}

animate();