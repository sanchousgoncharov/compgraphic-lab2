const upload = document.getElementById('upload');
const ctxOriginal = document.getElementById('original').getContext('2d');
const ctxGray1 = document.getElementById('gray1').getContext('2d');
const ctxGray2 = document.getElementById('gray2').getContext('2d');
const ctxDiff = document.getElementById('diff').getContext('2d');

function buildHistogram(intensities) {
    const hist = new Array(256).fill(0);
    for (let v of intensities) hist[v]++;
    return hist;
}

function drawHistogram(canvasId, hist, label) {
    new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
            labels: [...Array(256).keys()],
            datasets: [{
                label: label,
                data: hist,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: { display: false },
                y: { beginAtZero: true }
            }
        }
    });
}

upload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        ctxOriginal.drawImage(img, 0, 0, 300, 300);
        const imageData = ctxOriginal.getImageData(0, 0, 300, 300);
        const data = imageData.data;

        const img1 = ctxGray1.createImageData(300, 300);
        const img2 = ctxGray2.createImageData(300, 300);
        const diff = ctxDiff.createImageData(300, 300);

        const intensities1 = [];
        const intensities2 = [];

        for (let i = 0; i < data.length; i += 4) {
            const R = data[i],
                G = data[i + 1],
                B = data[i + 2];

            // 1. NTSC RGB
            const g1 = Math.round(0.299 * R + 0.587 * G + 0.114 * B);
            // 2. sRGB
            const g2 = Math.round(0.2126 * R + 0.7152 * G + 0.0722 * B);
            // Разность
            const d = Math.abs(g1 - g2);

            img1.data[i] = img1.data[i + 1] = img1.data[i + 2] = g1;
            img1.data[i + 3] = 255;

            img2.data[i] = img2.data[i + 1] = img2.data[i + 2] = g2;
            img2.data[i + 3] = 255;

            diff.data[i] = diff.data[i + 1] = diff.data[i + 2] = d;
            diff.data[i + 3] = 255;

            intensities1.push(g1);
            intensities2.push(g2);
        }

        ctxGray1.putImageData(img1, 0, 0);
        ctxGray2.putImageData(img2, 0, 0);
        ctxDiff.putImageData(diff, 0, 0);

        // Строим гистограммы
        drawHistogram('hist1', buildHistogram(intensities1), 'Гистограмма NTSC RGB');
        drawHistogram('hist2', buildHistogram(intensities2), 'Гистограмма sRGB');
    };
    img.src = URL.createObjectURL(file);
});