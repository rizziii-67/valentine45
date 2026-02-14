document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const photos = [
        "better_avoid_this_tshirt.jpeg",
        "cant_forget_this.jpeg",
        "completely_flat.jpeg",
        "first_pic_saved.jpeg",
        "i_wanna_ride_u_mommy.jpeg",
        "nearly_died.jpeg",
        "never_took_screenshot_this_fast.jpeg",
        "special_mention.jpeg",
        "uff_mommy.jpeg",
        "will_bite_ur_lips_so_harder.jpeg"
    ];

    const chats = [
        "first_kiss.jpeg",
        "first_time_calling_me_purushaa.jpeg",
        "first_time_from_you.jpeg",
        "first_ummmah.jpeg",
        "professional_daddy.jpeg",
        "we_are_engaged_right.jpeg"
    ];

    // --- State ---
    let currentPage = 'center';
    let audioStarted = false;
    let quizStage = 0;
    let photoZIndex = 100;

    // --- DOM Elements ---
    const app = document.getElementById('app');
    const introOverlay = document.getElementById('intro-overlay');
    const bgMusic = document.getElementById('bg-music');
    const muteBtn = document.getElementById('mute-btn');
    const audioControl = document.getElementById('audio-control');
    const stringContainer = document.querySelector('.string-container');
    const chatGrid = document.getElementById('chat-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const quizCard = document.getElementById('quiz-card');
    const finalSurprise = document.getElementById('final-surprise');
    const finalMessage = document.getElementById('final-message');
    const surpriseLink = document.getElementById('surprise-link');
    const navArrows = document.querySelectorAll('.nav-arrow');
    const whiteFlash = document.getElementById('white-flash-overlay');

    // --- Cinematic Intro ---
    setTimeout(() => {
        // Text animation is handled by CSS (4s duration)
        // Fade out overlay
        introOverlay.style.opacity = 0;

        // Try audio start
        initAudio();

        setTimeout(() => {
            introOverlay.remove();
            // Intro done
        }, 2000);
    }, 4500);

    initPhotos();
    initChats();
    initQuiz();
    initParticles();

    // --- Navigation & Global Interactions ---

    // Parallax logic
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        // Apply to photos that are hanging (not dragging)
        document.querySelectorAll('.photo-card:not(.dragging)').forEach(card => {
            const currentRot = card.dataset.rot || 0;
            // Shift shadow
            card.style.boxShadow = `${-x}px ${10 - y}px 20px rgba(0,0,0,0.3)`;
        });

        // Chat tilt
        document.querySelectorAll('.chat-item:hover').forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemX = e.clientX - rect.left - rect.width / 2;
            const itemY = e.clientY - rect.top - rect.height / 2;
            item.style.transform = `perspective(1000px) rotateY(${itemX / 20}deg) rotateX(${-itemY / 20}deg) scale(1.05)`;
        });
    });

    navArrows.forEach(arrow => {
        arrow.addEventListener('enter', () => {
            // Nudge handled by CSS
        });

        arrow.addEventListener('click', (e) => {
            // Heart trail
            for (let i = 0; i < 5; i++) {
                setTimeout(() => createHeartParticle(e.clientX, e.clientY, true), i * 50);
            }
            // Transition
            const target = e.target.dataset.target;

            // White flash
            whiteFlash.style.opacity = 0.3;
            setTimeout(() => whiteFlash.style.opacity = 0, 600);

            navigateTo(target);
            initAudio();
        });
    });

    function navigateTo(target) {
        const pages = { 'left': 0, 'center': 1, 'right': 2 };
        const translateX = -100 * pages[target];
        app.style.transform = `translateX(${translateX}vw)`;

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            if (page.id === `page-${target}`) page.classList.add('active');
        });
        currentPage = target;
    }

    app.style.transform = `translateX(-100vw)`; // Start Center

    // --- Audio ---
    function initAudio() {
        if (!audioStarted) {
            bgMusic.volume = 0.5;
            bgMusic.play().then(() => {
                audioStarted = true;
                audioControl.classList.remove('hidden');
                muteBtn.classList.add('playing');
            }).catch(e => console.log("Audio autoplay waiting for interaction"));
        }
    }

    muteBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            muteBtn.textContent = "🎵";
            muteBtn.classList.add('playing');
        } else {
            bgMusic.pause();
            muteBtn.textContent = "🔇";
            muteBtn.classList.remove('playing');
        }
    });

    document.body.addEventListener('click', initAudio, { once: true });


    // --- Photo Gallery (Center) ---
    function initPhotos() {
        photos.forEach((photo, index) => {
            const card = document.createElement('div');
            card.classList.add('photo-card');

            const rot = Math.random() * 6 - 3;
            card.dataset.rot = rot;
            const leftPos = 5 + (index * (90 / photos.length));
            const topVar = Math.random() * 20;

            card.style.left = `${leftPos}%`;
            card.style.top = `${50 + topVar}px`;
            card.style.transform = `rotate(${rot}deg)`;

            const img = document.createElement('img');
            img.src = `photos/${photo}`;
            img.draggable = false;

            const clip = document.createElement('div');
            clip.classList.add('clip');

            const caption = document.createElement('div');
            caption.classList.add('photo-caption');
            // Store caption text but don't show yet
            card.dataset.caption = formatCaption(photo);

            card.appendChild(clip);
            card.appendChild(img);
            card.appendChild(caption);
            stringContainer.appendChild(card);

            // Drag Logic
            let isDragging = false;
            let startX, startY;

            card.addEventListener('mousedown', (e) => {
                isDragging = true;
                card.classList.add('dragging');
                clip.style.display = 'none';
                card.style.zIndex = ++photoZIndex;

                const rect = card.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const containerRect = stringContainer.getBoundingClientRect();
                const x = e.clientX - containerRect.left - startX;
                const y = e.clientY - containerRect.top - startY;

                card.style.left = `${x}px`;
                card.style.top = `${y}px`;
                card.style.transform = `rotate(${rot + 5}deg) scale(1.1)`;

                // Glow effect while holding
                card.style.boxShadow = "0 0 20px rgba(255, 77, 109, 0.6)";

                if (Math.random() > 0.8) createHeartParticle(e.clientX, e.clientY);
            });

            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                card.classList.remove('dragging');
                card.classList.add('placed');

                // Drop Bounce
                card.animate([
                    { transform: `rotate(${rot}deg) scale(1.05) translateY(0)` },
                    { transform: `rotate(${rot}deg) scale(1.0) translateY(10px)` },
                    { transform: `rotate(${rot}deg) scale(1.0) translateY(0)` }
                ], { duration: 400, easing: 'ease-out' });

                // Reset transform/shadow
                card.style.transform = `rotate(${rot}deg)`;
                card.style.boxShadow = '';

                // Typewriter Caption
                if (!caption.dataset.typed) {
                    typewriter(caption, card.dataset.caption);
                    caption.dataset.typed = "true";
                }

                // Heart Burst
                createBurst(card.getBoundingClientRect());
            });
        });
    }

    function typewriter(element, text) {
        element.innerHTML = "";
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            element.appendChild(span);
            setTimeout(() => span.classList.add('visible'), i * 50);
        });
    }

    // --- Chat Gallery (Left) ---
    function initChats() {
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.classList.add('chat-item');

            const img = document.createElement('img');
            img.src = `chats/${chat}`;

            const cap = document.createElement('div');
            cap.classList.add('chat-caption');
            cap.innerHTML = `<span>${formatCaption(chat)}</span>`; // For fade-up if needed

            item.appendChild(img);
            item.appendChild(cap);
            chatGrid.appendChild(item);

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'none';
            });

            item.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = cap.textContent;
                lightbox.classList.remove('hidden');
                // Zoom anim
                lightboxImg.animate([
                    { transform: 'scale(0.9)', opacity: 0 },
                    { transform: 'scale(1)', opacity: 1 }
                ], { duration: 300 });
            });
        });
    }

    closeLightbox.addEventListener('click', () => lightbox.classList.add('hidden'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.add('hidden');
    });


    // --- Quiz (Right) ---
    function initQuiz() {
        renderQuizStage();
    }

    function renderQuizStage() {
        quizCard.innerHTML = '';
        const qContainer = document.createElement('div');
        const qText = document.createElement('div');
        qText.classList.add('question-text');

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options-container');

        const feedback = document.createElement('div');
        feedback.classList.add('feedback-text');

        // Logic
        if (quizStage === 0) {
            qText.textContent = "Where daddy likes to sniff?";
            // Pause before showing options/input
            optionsDiv.style.opacity = 0;
            setTimeout(() => {
                optionsDiv.style.transition = "opacity 1s";
                optionsDiv.style.opacity = 1;
            }, 1000);

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = "Your answer...";
            input.style.padding = '10px';
            input.style.borderRadius = '5px';
            input.style.border = '1px solid #ccc';
            input.style.color = '#333';
            input.style.marginBottom = '10px';

            const submitInfo = document.createElement('button');
            submitInfo.textContent = "Answer";
            submitInfo.classList.add('quiz-btn');

            submitInfo.onclick = () => {
                const ans = input.value.toLowerCase().trim();
                // "below arms" includes "arm" which is risky, but user said "below arms" is correct.
                if (ans.includes("below arms") || ans.includes("underarm") || ans.includes("armpit")) {
                    feedback.textContent = "Can't wait to sniff you there mommy";
                    feedback.style.color = "#a5d6a7";
                    setTimeout(() => { quizStage++; renderQuizStage(); }, 2000);
                } else {
                    feedback.textContent = "Hmm… you forgot already?";
                    feedback.style.color = "#ef9a9a";
                }
            };
            optionsDiv.appendChild(input);
            optionsDiv.appendChild(submitInfo);

        } else if (quizStage === 1) {
            qText.textContent = "if u got chance to do more than kiss with me before 8 years will u get tempted?";
            const btnYes = createBtn("Yes", () => {
                feedback.textContent = "such a dirty girl u are";
                feedback.style.color = "#ff4d6d";
                setTimeout(() => { quizStage++; renderQuizStage(); }, 2000);
            });
            const btnNo = createBtn("No", () => {
                feedback.textContent = "i knew u nerdy ass";
                setTimeout(() => { quizStage++; renderQuizStage(); }, 2000);
            });
            optionsDiv.appendChild(btnYes);
            optionsDiv.appendChild(btnNo);

        } else if (quizStage === 2) {
            qText.textContent = "Will you be my valentine?";
            qText.style.transform = "scale(1.1)";

            // Dramatic pause
            optionsDiv.style.opacity = 0;
            setTimeout(() => {
                quizCard.classList.add('zoomed'); // CSS handle zoom
                optionsDiv.style.transition = "opacity 1s";
                optionsDiv.style.opacity = 1;
            }, 1000);

            const btnYes = createBtn("Yes!", () => {
                triggerFinalSuccess();
            });
            const btnNo = createBtn("No", () => {
                finalReveal("...jokes aside baby a surprise is waiting for u");
            });
            optionsDiv.appendChild(btnYes);
            optionsDiv.appendChild(btnNo);
        }

        qContainer.appendChild(qText);
        qContainer.appendChild(optionsDiv);
        qContainer.appendChild(feedback);
        quizCard.appendChild(qContainer);
    }

    function createBtn(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.classList.add('quiz-btn');
        btn.addEventListener('click', onClick);
        return btn;
    }

    function triggerFinalSuccess() {
        // Grand Final Effects
        app.style.transition = "transform 10s ease";
        app.style.transform += " scale(1.05)"; // Zoom in whole app slightly

        // Golden Rain and Confetti
        const duration = 5000;
        const end = Date.now() + duration;

        (function frame() {
            createGoldenParticle();
            createHeartParticle(Math.random() * window.innerWidth, -10, false, true); // confetti heart
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        finalReveal("You always were.");
    }

    function finalReveal(msgText) {
        quizCard.style.transition = "opacity 1s";
        quizCard.style.opacity = 0;
        setTimeout(() => {
            quizCard.classList.add('hidden');
            finalSurprise.classList.remove('hidden');
            finalMessage.textContent = msgText;
            finalMessage.style.opacity = 0;
            finalMessage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: 'forwards' });

            setTimeout(() => {
                surpriseLink.classList.remove('hidden');
            }, 1000);
        }, 1000);
    }

    // --- Helpers ---
    function formatCaption(filename) {
        return filename.split('.')[0].replace(/_/g, ' ');
    }

    function createHeartParticle(x, y, explode = false, isConfetti = false) {
        const heart = document.createElement('div');
        heart.innerText = '❤';
        heart.style.position = 'fixed';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.color = `rgba(255, ${Math.random() * 50 + 50}, ${Math.random() * 50 + 100}, 0.8)`;
        heart.style.fontSize = `${Math.random() * 20 + 10}px`;
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';

        document.body.appendChild(heart);

        let vx = (Math.random() - 0.5) * 10;
        let vy = (Math.random() - 0.5) * 10;

        if (!explode) {
            vy = -2 - Math.random() * 2; // Float up
            vx = (Math.random() - 0.5) * 2;
        }

        if (isConfetti) {
            vy = Math.random() * 5 + 2; // Fall down
            vx = (Math.random() - 0.5) * 5;
        }

        let opacity = 1;

        const anim = setInterval(() => {
            x += vx;
            y += vy;
            opacity -= 0.01;

            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;
            heart.style.opacity = opacity;

            if (opacity <= 0) {
                clearInterval(anim);
                heart.remove();
            }
        }, 16);
    }

    function createGoldenParticle() {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.left = `${Math.random() * window.innerWidth}px`;
        p.style.top = `-10px`;
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.background = 'gold';
        p.style.borderRadius = '50%';
        p.style.boxShadow = '0 0 5px gold';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '9000';
        document.body.appendChild(p);

        let y = -10;
        let speed = Math.random() * 5 + 2;
        const anim = setInterval(() => {
            y += speed;
            p.style.top = `${y}px`;
            if (y > window.innerHeight) {
                clearInterval(anim);
                p.remove();
            }
        }, 16);
    }

    function createBurst(rect) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 10; i++) {
            createHeartParticle(cx, cy, true);
        }
    }

    // Background Particles
    function initParticles() {
        setInterval(() => {
            createHeartParticle(
                Math.random() * window.innerWidth,
                window.innerHeight + 20
            );
        }, 500); // Slightly slower creation for performance
    }

});
