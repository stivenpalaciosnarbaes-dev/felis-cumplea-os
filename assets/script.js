const partyDecor = document.getElementById("party-decor");
    const pinkCircles = document.getElementById("pink-circles");
    const scene = document.querySelector(".scene");
    const partySymbols = ["🎈", "🎊", "🎉", "🎁", "🥳", "⭐", "✨"];
    const pinkColors = ["#ff8eaa", "#ffb1c2", "#ffc2d1"];
    const card = document.getElementById("card");
    const openButton = document.getElementById("open-card");
    const letter = document.querySelector(".letter");
    const hint = document.getElementById("hint");
    const backgroundVideo = document.querySelector(".background-video");
    const backgroundAudio = document.querySelector(".background-audio");

    function arrangePartyDecor() {
      const bounds = partyDecor.getBoundingClientRect();
      const forbidden = Array.from(document.querySelectorAll(".envelope"), element => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - 10,
          top: rect.top - 10,
          right: rect.right + 10,
          bottom: rect.bottom + 10
        };
      });
      const placed = [];
      const iconSize = 28;
      const gap = 5;
      let attempts = 0;
      partyDecor.replaceChildren();

      while (placed.length < 64 && attempts < 20000) {
        attempts += 1;
        const left = Math.random() * Math.max(0, bounds.width - iconSize);
        const top = Math.random() * Math.max(0, bounds.height - iconSize);
        const candidate = {
          left,
          top,
          right: left + iconSize,
          bottom: top + iconSize
        };
        const overlaps = rectangle => candidate.left < rectangle.right + gap
          && candidate.right + gap > rectangle.left
          && candidate.top < rectangle.bottom + gap
          && candidate.bottom + gap > rectangle.top;

        if (forbidden.some(overlaps) || placed.some(overlaps)) continue;

        const icon = document.createElement("span");
        icon.textContent = partySymbols[Math.floor(Math.random() * partySymbols.length)];
        icon.style.left = `${left}px`;
        icon.style.top = `${top}px`;
        partyDecor.appendChild(icon);
        placed.push(candidate);
      }
    }

    function arrangePinkCircles() {
      const bounds = pinkCircles.getBoundingClientRect();
      const heading = document.querySelector("h1").getBoundingClientRect();
      const envelope = document.querySelector(".envelope").getBoundingClientRect();
      const forbidden = Array.from(document.querySelectorAll("h1, .envelope"), element => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - 10,
          top: rect.top - 10,
          right: rect.right + 10,
          bottom: rect.bottom + 10
        };
      });
      const placed = [];
      const circleSize = 38;
      const gap = 2;
      let attempts = 0;
      pinkCircles.replaceChildren();

      const overlaps = (first, second) => first.left < second.right + gap
        && first.right + gap > second.left
        && first.top < second.bottom + gap
        && first.bottom + gap > second.top;
      const addCircle = (left, top, allowHeading = false) => {
        const candidate = {
          left,
          top,
          right: left + circleSize,
          bottom: top + circleSize
        };
        if ((!allowHeading && overlaps(candidate, heading)) || placed.some(rect => overlaps(candidate, rect))) return;
        const circle = document.createElement("span");
        circle.style.left = `${left}px`;
        circle.style.top = `${top}px`;
        circle.style.backgroundColor = pinkColors[Math.floor(Math.random() * pinkColors.length)];
        pinkCircles.appendChild(circle);
        placed.push(candidate);
      };

      const topRow = 6;
      const secondTopRow = Math.max(0, heading.top - circleSize - gap - 2);
      for (let index = 0; index < 8; index += 1) {
        const left = ((bounds.width - circleSize) * index) / 7;
        addCircle(left, topRow);
        addCircle(left, secondTopRow);
      }

      const behindHeadingTop = heading.top + (heading.height - circleSize) / 2;
      [0.12, 0.38, 0.62, 0.88].forEach(position => {
        const left = heading.left + (heading.width - circleSize) * position;
        addCircle(left, behindHeadingTop, true);
      });

      [15, 60, 105, 150, 195, 240].forEach(offset => {
        const top = envelope.top + offset;
        addCircle(Math.max(0, envelope.left - circleSize / 2), top);
        addCircle(Math.min(bounds.width - circleSize, envelope.right - circleSize / 2), top);
      });

      const belowTop = Math.min(bounds.height - circleSize, envelope.bottom + 15);
      for (let index = 0; index < 12; index += 1) {
        const left = envelope.left - 8
          + ((envelope.width + 16 - circleSize) * index) / 11;
        addCircle(left, belowTop);
      }

      while (placed.length < 80 && attempts < 20000) {
        attempts += 1;
        const left = Math.random() * Math.max(0, bounds.width - circleSize);
        const top = Math.random() * Math.max(0, bounds.height - circleSize);
        const candidate = {
          left,
          top,
          right: left + circleSize,
          bottom: top + circleSize
        };

        if (forbidden.some(rect => overlaps(candidate, rect)) || placed.some(rect => overlaps(candidate, rect))) continue;
        addCircle(left, top);
      }
    }

    arrangePartyDecor();
    arrangePinkCircles();
    window.addEventListener("resize", arrangePartyDecor);
    window.addEventListener("resize", arrangePinkCircles);

    openButton.addEventListener("click", () => {
      const opened = card.classList.toggle("opened");
      scene.classList.toggle("card-open", opened);
      openButton.setAttribute("aria-expanded", String(opened));
      hint.textContent = opened ? "¡Buen día, Fruti!" : "";
      if (opened) {
        letter.scrollTop = 0;
        backgroundAudio.defaultMuted = false;
        backgroundAudio.muted = false;
        backgroundAudio.volume = 1;
        Promise.all([backgroundVideo.play(), backgroundAudio.play()]).catch(() => {
          hint.textContent = "El navegador no pudo iniciar el video o la música.";
        });
        tossConfetti();
        window.setTimeout(() => {
          arrangePartyDecor();
          arrangePinkCircles();
        }, 750);
      } else {
        backgroundVideo.pause();
        backgroundAudio.pause();
      }
    });

    letter.addEventListener("click", () => {
      if (card.classList.contains("opened")) openButton.click();
    });

    function tossConfetti() {
      const colors = ["#ff6b9a", "#7adcc2", "#a68cff", "#ff8e5e"];
      for (let i = 0; i < 55; i += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti";
        piece.setAttribute("aria-hidden", "true");
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.backgroundColor = colors[i % colors.length];
        piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
        piece.style.animationDelay = `${Math.random() * .8}s`;
        document.body.appendChild(piece);
        window.setTimeout(() => piece.remove(), 3800);
      }
    }
