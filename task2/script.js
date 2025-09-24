// Получение элементов
const upload = document.getElementById('upload');
const processBtn = document.getElementById('processBtn');
const ctxOriginal = document.getElementById('original').getContext('2d');
const ctxR = document.getElementById('channelR').getContext('2d');
const ctxG = document.getElementById('channelG').getContext('2d');
const ctxB = document.getElementById('channelB').getContext('2d');

// Гистограммы
let histRChart, histGChart, histBChart;

// Активация кнопки
upload.addEventListener('change', function(e) {
    processBtn.disabled = !e.target.files.length;
});

// Обработка изображения
processBtn.addEventListener('click', function() {
    const file = upload.files[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = function() {
        // Очистка холста
        ctxOriginal.clearRect(0, 0, 300, 300);
        ctxR.clearRect(0, 0, 300, 300);
        ctxG.clearRect(0, 0, 300, 300);
        ctxB.clearRect(0, 0, 300, 300);
        
        // Оригинальное изображение
        ctxOriginal.drawImage(img, 0, 0, 300, 300);
        
        // Данные изображения
        const imageData = ctxOriginal.getImageData(0, 0, 300, 300);
        const data = imageData.data;
        
        // ImageData для каждого канала
        const imgR = ctxR.createImageData(300, 300);
        const imgG = ctxG.createImageData(300, 300);
        const imgB = ctxB.createImageData(300, 300);
        
        const redValues = [];
        const greenValues = [];
        const blueValues = [];
        
        // Обработка пикселей
        for (let i = 0; i < data.length; i += 4) {
            const R = data[i];
            const G = data[i + 1];
            const B = data[i + 2];
            const A = data[i + 3];
            
            redValues.push(R);
            greenValues.push(G);
            blueValues.push(B);
            
            // R 
            imgR.data[i] = R;     
            imgR.data[i + 1] = 0; 
            imgR.data[i + 2] = 0; 
            imgR.data[i + 3] = A; 
            
            // G 
            imgG.data[i] = 0;     
            imgG.data[i + 1] = G; 
            imgG.data[i + 2] = 0; 
            imgG.data[i + 3] = A; 
            
            // B 
            imgB.data[i] = 0;     
            imgB.data[i + 1] = 0; 
            imgB.data[i + 2] = B; 
            imgB.data[i + 3] = A; 
        }
        
        ctxR.putImageData(imgR, 0, 0);
        ctxG.putImageData(imgG, 0, 0);
        ctxB.putImageData(imgB, 0, 0);
        
        buildHistograms(redValues, greenValues, blueValues);
    };
    
    img.src = URL.createObjectURL(file);
});

function buildHistograms(redValues, greenValues, blueValues) {

    if (histRChart) histRChart.destroy();
    if (histGChart) histGChart.destroy();
    if (histBChart) histBChart.destroy();
    
    // Гистограммы для каждого из каналов
    histRChart = createHistogram('histR', redValues, 'Красный канал', 'rgba(255, 0, 0, 0.7)');
    histGChart = createHistogram('histG', greenValues, 'Зеленый канал', 'rgba(0, 255, 0, 0.7)');
    histBChart = createHistogram('histB', blueValues, 'Синий канал', 'rgba(0, 0, 255, 0.7)');
}

function createHistogram(canvasId, values, label, color) {
    // Массив для подсчета частот (0 - 255)
    const hist = new Array(256).fill(0);
    
    // Подсчет частот
    for (let v of values) {
        hist[v]++;
    }
    
    // Массив меток (0-255)
    const labels = Array.from({length: 256}, (_, i) => i);
    
    // График
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: hist,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Значение интенсивности'
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Частота'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}