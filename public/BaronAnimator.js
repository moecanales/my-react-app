class BaronAnimator {
    constructor(game) {
        this.game = game;
        this.hudCanvas = null;
        this.hudCtx = null;
        
        this.overlayContainer = null;
        this.overlayCanvas = null;
        this.overlayCtx = null;
        this.overlayText = null;

        this.time = 0;
        this.hudState = 'normal'; // 'normal', 'laughing', 'angry', 'annoyed'
        this.hudTimer = 0;
        this.overlayState = 'normal'; // 'laughing', 'sad', 'angry', 'shocked'
        this.overlayTimer = 0;

        // Global mouse tracking for the Mona Lisa effect
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Give the DOM a moment to be fully parsed before fetching elements
        setTimeout(() => this.bindDOM(), 100);
        this.startLoop();
    }

    bindDOM() {
        this.hudCanvas = document.getElementById('baron-face');
        if (this.hudCanvas) {
            this.hudCtx = this.hudCanvas.getContext('2d');
            this.hudCanvas.style.cursor = 'pointer'; // Makes it clear he is clickable
            
            // Click to annoy listener
            this.hudCanvas.addEventListener('click', () => {
                if (this.hudState !== 'annoyed') {
                    this.hudState = 'annoyed';
                    this.hudTimer = 1.5;
                    if (this.game.audio) this.game.audio.playAnnoyedGrunt();
                }
            });
        }

        this.overlayContainer = document.getElementById('baron-overlay');
        this.overlayCanvas = document.getElementById('baron-overlay-canvas');
        if (this.overlayCanvas) this.overlayCtx = this.overlayCanvas.getContext('2d');
        this.overlayText = document.getElementById('baron-overlay-text');
    }

    startLoop() {
        const loop = () => {
            this.time += 0.016;

            // Handle HUD Timer
            if (this.hudTimer > 0) {
                this.hudTimer -= 0.016;
                if (this.hudTimer <= 0) this.hudState = 'normal';
            }

            // Handle Overlay Timer
            if (this.overlayTimer > 0) {
                this.overlayTimer -= 0.016;
                if (this.overlayTimer <= 0) {
                    this.overlayState = 'normal';
                    if (this.overlayContainer) this.overlayContainer.classList.add('hidden');
                }
            }

            // Render HUD (90x90) - Shrunk by ~10% (0.5 scale) and perfectly centered vertically (Y: 61)
            if (this.hudCtx) {
                this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
                this.drawCharacter(this.hudCanvas, this.hudCtx, 45, 61, this.time, this.hudState, 0.5);
            }

            // Render Overlay (300x300)
            if (this.overlayCtx && this.overlayTimer > 0) {
                this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
                // Center is 150, 150. Scale up (1.5)
                this.drawCharacter(this.overlayCanvas, this.overlayCtx, 150, 160, this.time, this.overlayState, 1.5);
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    triggerHUD(mood) {
        if (this.overlayTimer > 0) return; // Don't override if a big event is happening
        this.hudState = mood;
        this.hudTimer = 1.5;
        if (mood === 'laughing' && this.game.audio) this.game.audio.playRetroLaugh();
        if (mood === 'angry' && this.game.audio) this.game.audio.playAngryGrowl();
    }

    triggerOverlay(mood, text) {
        this.overlayState = mood;
        this.overlayTimer = 2.0; // Show for 2 seconds
        
        if (this.overlayContainer && this.overlayText) {
            this.overlayText.innerText = text;
            this.overlayText.className = `text-${mood}`; // Apply dynamic color class
            this.overlayContainer.classList.remove('hidden');
        }

        if (!this.game.audio) return;
        if (mood === 'laughing') this.game.audio.playRetroLaugh();
        else if (mood === 'sad') this.game.audio.playSadTrombone();
        else if (mood === 'angry') this.game.audio.playAngryGrowl();
        else if (mood === 'shocked') this.game.audio.playSurpriseBoing();
    }

    // Calculates the pupil offset based on absolute screen coordinates
    getPupilOffset(canvas, baseX, baseY, localX, localY, scale, maxOffset) {
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const absX = rect.left + (baseX + localX * scale);
        const absY = rect.top + (baseY + localY * scale);
        
        const dx = this.mouseX - absX;
        const dy = this.mouseY - absY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.hypot(dx, dy) * 0.015, maxOffset);
        
        return {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist
        };
    }

    drawCharacter(canvas, ctx, baseX, baseY, time, state, scale) {
        ctx.save();
        ctx.translate(baseX, baseY);
        ctx.scale(scale, scale);

        let drawX = 0; let drawY = 0;
        let hatBounce = 0;
        let faceColor = '#6a1b9a'; // Default purple

        if (state === 'laughing') {
            drawY = -Math.abs(Math.sin(time * 20)) * 15;
            hatBounce = Math.abs(Math.sin(time * 20 + 0.5)) * 6;
        } else if (state === 'sad') {
            drawY = 10 + Math.abs(Math.sin(time * 8)) * 3; 
            hatBounce = -5;
        } else if (state === 'angry') {
            faceColor = '#c62828'; // Turns red
            drawX = Math.sin(time * 50) * 4;
            drawY = Math.cos(time * 45) * 4;
            hatBounce = Math.sin(time * 50) * 2;
        } else if (state === 'shocked') {
            drawY = -5;
            hatBounce = 40; // Hat flies off
        } else if (state === 'annoyed') {
            drawX = Math.sin(time * 10) * 1;
        } else {
            drawY = -Math.abs(Math.sin(time * 3)) * 3;
        }

        // Draw Head
        ctx.fillStyle = faceColor; 
        ctx.beginPath(); ctx.arc(drawX, drawY, 60, 0, Math.PI * 2); ctx.fill();

        // Draw Hat
        ctx.fillStyle = '#111';
        ctx.fillRect(drawX - 55, drawY - 55 - hatBounce, 110, 8);
        ctx.fillRect(drawX - 35, drawY - 110 - hatBounce, 70, 55);
        ctx.fillStyle = '#fbc02d';
        ctx.fillRect(drawX - 35, drawY - 65 - hatBounce, 70, 10);
        
        const leftEyeX = drawX - 20;
        const leftEyeY = drawY - 15;

        // --- EYES (Left) ---
        ctx.fillStyle = '#fff';
        if (state === 'laughing') {
            ctx.lineWidth = 4; ctx.strokeStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(leftEyeX - 15, leftEyeY); ctx.lineTo(leftEyeX, leftEyeY - 10); ctx.lineTo(leftEyeX + 15, leftEyeY); ctx.stroke();
        } else if (state === 'sad') {
            ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY, 8, 0, Math.PI); ctx.fill();
            const tearY = (time * 60) % 50; 
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath(); ctx.arc(leftEyeX, drawY + tearY, 4, 0, Math.PI * 2); ctx.fill();
        } else if (state === 'angry') {
            ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY, 8, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 5; ctx.strokeStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(leftEyeX - 15, leftEyeY - 10); ctx.lineTo(leftEyeX + 15, leftEyeY); ctx.stroke();
        } else if (state === 'shocked') {
            ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY, 3, 0, Math.PI * 2); ctx.fill();
        } else if (state === 'annoyed') {
            ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY, 8, 0, Math.PI); ctx.fill(); 
            ctx.lineWidth = 3; ctx.strokeStyle = '#111';
            ctx.beginPath(); ctx.moveTo(leftEyeX - 12, leftEyeY - 4); ctx.lineTo(leftEyeX + 12, leftEyeY); ctx.stroke();
            
            const offset = this.getPupilOffset(canvas, baseX, baseY, leftEyeX, leftEyeY, scale, 3);
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(leftEyeX + offset.x, leftEyeY + Math.max(0, offset.y), 3, 0, Math.PI * 2); ctx.fill();
        } else {
            const blink = Math.sin(time * 2) > 0.95;
            if (!blink) { 
                ctx.beginPath(); ctx.arc(leftEyeX, leftEyeY + 1, 8, 0, Math.PI); ctx.fill(); 
                
                const offset = this.getPupilOffset(canvas, baseX, baseY, leftEyeX, leftEyeY, scale, 2);
                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(leftEyeX + offset.x, leftEyeY + 1 + Math.max(0, offset.y), 3, 0, Math.PI * 2); ctx.fill();
            }
            else { 
                ctx.fillRect(leftEyeX - 8, leftEyeY, 16, 4); 
            }
        }

        // --- MONOCLE (Right Eye) ---
        let monocleX = drawX + 20; let monocleY = drawY - 15;
        if (state === 'sad') { monocleY = drawY + 25; monocleX = drawX + 30; }
        
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#fbc02d'; ctx.beginPath();
        ctx.moveTo(monocleX + 14, monocleY); ctx.quadraticCurveTo(drawX + 45, drawY + 10, drawX + 30, drawY + 50); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(monocleX, monocleY, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.fill();
        
        if (state === 'laughing') {
            ctx.fillStyle = '#fff'; ctx.fillRect(monocleX - 10, monocleY, 20, 3);
        } else if (state === 'sad') {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(drawX + 20, drawY - 15, 8, 0, Math.PI); ctx.fill();
        } else if (state === 'angry') {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(monocleX, monocleY, 8, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 5; ctx.strokeStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(monocleX - 15, monocleY - 10); ctx.lineTo(monocleX + 15, monocleY - 20); ctx.stroke();
        } else if (state === 'shocked') {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(monocleX, monocleY, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(monocleX, monocleY, 3, 0, Math.PI * 2); ctx.fill();
        } else if (state === 'annoyed') {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(monocleX, monocleY, 8, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 3; ctx.strokeStyle = '#111';
            ctx.beginPath(); ctx.arc(monocleX, monocleY - 12, 10, Math.PI, Math.PI * 2); ctx.stroke(); 
            
            const offset = this.getPupilOffset(canvas, baseX, baseY, monocleX, monocleY, scale, 4);
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(monocleX + offset.x, monocleY + offset.y, 3, 0, Math.PI * 2); ctx.fill();
        } else {
             if (Math.sin(time * 2) <= 0.95) { 
                ctx.fillStyle = '#fff'; 
                ctx.beginPath(); ctx.arc(monocleX, monocleY + 1, 8, 0, Math.PI); ctx.fill(); 
                
                const offset = this.getPupilOffset(canvas, baseX, baseY, monocleX, monocleY, scale, 2);
                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(monocleX + offset.x, monocleY + 1 + Math.max(0, offset.y), 3, 0, Math.PI * 2); ctx.fill();
            }
        }

        // --- MOUTH ---
        if (state === 'laughing') {
            const mouthOpen = 25 + Math.sin(time * 30) * 10; 
            ctx.fillStyle = '#0f3460';
            ctx.beginPath(); ctx.moveTo(drawX - 20, drawY + 25); ctx.lineTo(drawX + 20, drawY + 25);
            ctx.bezierCurveTo(drawX + 15, drawY + 25 + mouthOpen, drawX - 15, drawY + 25 + mouthOpen, drawX - 20, drawY + 25); ctx.fill();
            ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.arc(drawX, drawY + 20 + mouthOpen * 0.6, 10, 0, Math.PI, true); ctx.fill();
        } else if (state === 'sad') {
            const lipTremble = Math.sin(time * 40) * 2;
            ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(drawX, drawY + 35 + lipTremble, 12, Math.PI, Math.PI * 2); ctx.stroke();
        } else if (state === 'angry') {
            ctx.fillStyle = '#fff'; ctx.fillRect(drawX - 15, drawY + 20, 30, 10);
            ctx.lineWidth = 1; ctx.strokeStyle = '#000';
            for(let i=-10; i<=10; i+=5) { ctx.beginPath(); ctx.moveTo(drawX + i, drawY + 20); ctx.lineTo(drawX + i, drawY + 30); ctx.stroke(); }
        } else if (state === 'shocked') {
            ctx.fillStyle = '#0f3460'; ctx.beginPath(); ctx.ellipse(drawX, drawY + 35, 10, 15, 0, 0, Math.PI * 2); ctx.fill();
        } else if (state === 'annoyed') {
            ctx.lineWidth = 3; ctx.strokeStyle = '#fff';
            ctx.beginPath(); 
            ctx.moveTo(drawX - 15, drawY + 25);
            ctx.quadraticCurveTo(drawX, drawY + 20, drawX + 15, drawY + 30);
            ctx.stroke();
        } else {
            // Stoic, tracking flat line
            ctx.lineWidth = 3; ctx.strokeStyle = '#fff';
            ctx.beginPath(); 
            ctx.moveTo(drawX - 12, drawY + 20);
            ctx.lineTo(drawX + 12, drawY + 20);
            ctx.stroke();
        }

        // --- MUSTACHE ---
        ctx.fillStyle = '#e0e0e0'; 
        if (state === 'sad') {
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX - 20, drawY + 25, drawX - 40, drawY + 45); ctx.quadraticCurveTo(drawX - 20, drawY + 35, drawX, drawY + 15); ctx.fill();
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX + 20, drawY + 25, drawX + 40, drawY + 45); ctx.quadraticCurveTo(drawX + 20, drawY + 35, drawX, drawY + 15); ctx.fill();
        } else if (state === 'angry') {
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.lineTo(drawX - 45, drawY + 25); ctx.lineTo(drawX - 20, drawY + 10); ctx.fill();
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.lineTo(drawX + 45, drawY + 25); ctx.lineTo(drawX + 20, drawY + 10); ctx.fill();
        } else if (state === 'shocked') {
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX - 20, drawY - 10, drawX - 30, drawY - 30); ctx.quadraticCurveTo(drawX - 10, drawY - 10, drawX, drawY + 15); ctx.fill();
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX + 20, drawY - 10, drawX + 30, drawY - 30); ctx.quadraticCurveTo(drawX + 10, drawY - 10, drawX, drawY + 15); ctx.fill();
        } else {
            const stacheWobble = state === 'laughing' ? Math.sin(time * 25) * 6 : 0;
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX - 20, drawY + 5 - stacheWobble, drawX - 45, drawY + 5 - stacheWobble); ctx.quadraticCurveTo(drawX - 20, drawY + 20 - stacheWobble, drawX, drawY + 15); ctx.fill();
            ctx.beginPath(); ctx.moveTo(drawX, drawY + 15); ctx.quadraticCurveTo(drawX + 20, drawY + 5 + stacheWobble, drawX + 45, drawY + 5 + stacheWobble); ctx.quadraticCurveTo(drawX + 20, drawY + 20 + stacheWobble, drawX, drawY + 15); ctx.fill();
        }
        ctx.restore();
    }
}