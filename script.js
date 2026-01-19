// 動画ファイルのリスト（拡張子なしで指定）
const videoFiles = [
    'video1',
    'video1',
    'video1',
    'video2',
];

// DOM Elements
const clickArea = document.getElementById('click-area');
const clearButton = document.getElementById('clear-button');
const shuffleButton = document.getElementById('shuffle-button');
const screenshotButton = document.getElementById('screenshot-button');

// State
const activeVideos = [];

// Initialize
function init() {
    // Listen to click on document to capture clicks on top of videos
    document.addEventListener('click', handleClick);
    clearButton.addEventListener('click', clearAllVideos);
    shuffleButton.addEventListener('click', shuffleVideos);
    screenshotButton.addEventListener('click', takeScreenshot);
}

// Handle click event
function handleClick(e) {
    // Ignore clicks on controls or interactive elements
    if (e.target.closest('.control-button') || e.target.closest('a') || e.target.closest('.header')) {
        return;
    }

    // Allow clicking on video-popup to spawn new video (removed exclusion)

    const x = e.clientX;
    const y = e.clientY;
    spawnVideo(x, y);
}

// Spawn a video at the given position
function spawnVideo(x, y) {
    if (videoFiles.length === 0) {
        console.log('動画ファイルが設定されていません。');
        return;
    }

    const randomIndex = Math.floor(Math.random() * videoFiles.length);
    const videoName = videoFiles[randomIndex];

    const videoPopup = document.createElement('div');
    videoPopup.className = 'video-popup';

    const video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    // MOV source (Safari - Prioritized for Transparency)
    const sourceMov = document.createElement('source');
    sourceMov.src = `${videoName}.mov?v=3`;
    sourceMov.type = 'video/quicktime';
    video.appendChild(sourceMov);

    // WebM source (Chrome, Firefox, Edge)
    const sourceWebm = document.createElement('source');
    sourceWebm.src = `${videoName}.webm?v=3`;
    sourceWebm.type = 'video/webm';
    video.appendChild(sourceWebm);

    videoPopup.appendChild(video);

    // Random scale between 0.6 and 2.3
    let scale;
    if (videoName === 'video2') {
        // Random scale between 0.7 and 2.0 for video2
        scale = 0.7 + Math.random() * 1.3;
    } else {
        // Random scale between 0.6 and 2.3 for others (video1)
        scale = 0.6 + Math.random() * 1.7;
    }

    // Set scale as CSS variable for animation usage
    videoPopup.style.setProperty('--scale', scale);

    videoPopup.style.left = `${x}px`;
    videoPopup.style.top = `${y}px`;
    videoPopup.style.transform = `translate(-50%, -50%) scale(var(--scale))`;

    document.body.appendChild(videoPopup);

    video.play().catch(err => {
        console.log('Video autoplay was prevented:', err);
    });

    activeVideos.push({ element: videoPopup, x, y });

    // video.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     video.muted = !video.muted;
    // });

    videoPopup.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        removeVideo(videoPopup);
    });
}

// Remove a specific video
function removeVideo(videoPopup) {
    videoPopup.classList.add('closing');

    setTimeout(() => {
        videoPopup.remove();
        const index = activeVideos.findIndex(v => v.element === videoPopup);
        if (index > -1) {
            activeVideos.splice(index, 1);
        }
    }, 300);
}

// Clear all videos
function clearAllVideos(e) {
    if (e) e.stopPropagation();

    activeVideos.forEach(v => {
        v.element.classList.add('closing');
    });

    setTimeout(() => {
        activeVideos.forEach(v => {
            v.element.remove();
        });
        activeVideos.length = 0;
    }, 300);
}

// Shuffle videos to random positions
function shuffleVideos(e) {
    if (e) e.stopPropagation();

    const padding = 100;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;

    activeVideos.forEach(v => {
        // Add glitch class
        v.element.classList.add('glitching');

        const newX = padding + Math.random() * (maxX - padding);
        const newY = padding + Math.random() * (maxY - padding);

        v.x = newX;
        v.y = newY;
        v.element.style.left = `${newX}px`;
        v.element.style.top = `${newY}px`;

        // Remove glitch class after animation
        setTimeout(() => {
            v.element.classList.remove('glitching');
        }, 300);
    });
}

// Take screenshot and save as JPEG
function takeScreenshot(e) {
    if (e) e.stopPropagation();

    // Hide controls temporarily
    const controls = document.querySelectorAll('.controls, .controls-right, .header');
    controls.forEach(el => el.style.visibility = 'hidden');

    html2canvas(document.body, {
        backgroundColor: '#fffaf0',
        scale: 2,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        // Restore controls
        controls.forEach(el => el.style.visibility = 'visible');

        // Convert to JPEG and download
        const link = document.createElement('a');
        link.download = `histericlub_${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
    }).catch(err => {
        console.log('Screenshot failed:', err);
        controls.forEach(el => el.style.visibility = 'visible');
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
