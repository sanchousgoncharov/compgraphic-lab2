var b, image;

document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    image = new Image();
    image.onload = () =>
    {
        document.getElementById("canvas").width = image.width;
        document.getElementById("canvas").height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        update();
    };
    image.src = imageUrl;
});

function update()
 {
    var hueValue = document.getElementById('hue').value;
    var saturationValue = document.getElementById('saturation').value;
    var valueValue = document.getElementById('value').value;

    ['hueVal', 'saturationVal', 'valueVal'].forEach((id, index) => {
        document.getElementById(id).textContent = Math.round([hueValue, saturationValue, valueValue][index]);
    });

    canvas.getContext('2d').drawImage(image, 0, 0);
    b = canvas.getContext('2d').getImageData(0, 0, image.width, image.height);
    processImageData(b, hueValue);
    canvas.getContext('2d').putImageData(b, 0, 0);
}

function processImageData(imageData, hueValue)
 {
    var hueShift =  Number(hueValue) ;
    var saturationChange = document.getElementById('saturation').value / 100;
    var valueChange = document.getElementById('value').value / 100;

    const pixels = imageData.data;
    for (var i = 0; i < pixels.length; i += 4) 
    {
        var [h, s, v] = rgb_to_hsv(pixels[i], pixels[i + 1], pixels[i + 2]);       
        h += hueShift;
        s = Math.max(0, Math.min(1, s * (1 + saturationChange)));
        v = Math.max(0, Math.min(1, v * (1 + valueChange)));  
        const [r, g, b] = hsv_to_rgb(h, s, v);      
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
    }
}

document.getElementById('hue').addEventListener('input', update);
document.getElementById('saturation').addEventListener('input', update);
document.getElementById('value').addEventListener('input', update);

function rgb_to_hsv(r,g,b)
{
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b); 
    var h=0,s=0;

    if (max !== min)
    {
        if(max === r && g>=b)
            h = 60 * (g-b)/(max - min);
        else if(max == r && g < b )
            h = 60 * (g-b)/(max - min) + 360;
        else if(max == g)
            h = 60 * (b-r)/(max - min) + 120;
        else if(max == b)
            h = 60 * (r-g)/(max - min) + 240;
    }

    if (max == 0)
        s=0;
    else
        s = 1 - min/max;

    var v=max
    return [h,s,v]
}

function hsv_to_rgb(h, s, v)
 {
    var r, g, b;
    Hi = Math.floor(h / 60) % 6;
    f = h / 60 - Math.floor(h / 60);
    p = v * (1-s);
    q = v * (1-f * s);
    t = v * (1-(1-f) * s);

    switch(Hi)
    {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break; 
        case 3: r = p, g = q, b = v; break; 
        case 4: r = t, g = p, b = v; break; 
        case 5: r = v, g = p, b = q; break; 
    }
    return [r * 255, g * 255, b * 255];
}

document.getElementById("download").addEventListener("click", () => 
{
    const link = Object.assign(document.createElement("a"), 
    {
        download: "result.png",
        href: canvas.toDataURL()
    });
    link.click();
});