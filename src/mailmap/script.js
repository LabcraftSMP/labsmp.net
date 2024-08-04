let poi;

let settings = {
    stopSize: 10,
    zoom: 0.15,
    lineWidth: 3
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let mousePos = {x:0, y:0}

function updateCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (!e) return;

    mousePos = {
        x: (e.clientX - rect.left) / (rect.right - rect.left) * rect.width,
        y: (e.clientY - rect.top) / (rect.bottom - rect.top) * rect.height
    };
}
updateCanvas();
addEventListener("resize", e => updateCanvas(e));
canvas.addEventListener("mousemove", e => updateCanvas(e));

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function drawCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawTextAligned(text, align, x1, y1, x2, y2) {
    const measurement = ctx.measureText(text);
    let x, y;

    switch (align) {
        case "R":
            x = x1 + x2 - measurement.width;
            y = y1 + y2 / 2 + 0.5 * measurement.emHeightAscent;
            break;
        case "L":
            x = x1;
            y = y1 + y2 / 2 + 0.5 * measurement.emHeightAscent;
            break;
        case "T":
            x = x1 + x2 / 2 - 0.5 * measurement.width;
            y = y1 + measurement.emHeightAscent;
            break;
        case "B":
            x = x1 + x2 / 2 - 0.5 * measurement.width;
            y = y2;
            break;
        default:
            x = x1;
            y = y2;
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

function animate() {
    requestAnimationFrame(animate);

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.font = "1.5em sans-serif";

    ctx.lineWidth = settings.lineWidth;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    drawLine(width/2, 0, width/2, height);
    drawLine(0, height/2, width, height/2);

    let textQueue = [];

    poi.stops.forEach(stop => {
        const x = stop[0] * settings.zoom + width / 2;
        const y = stop[1] * settings.zoom + height / 2;

        drawCircle(x, y, settings.stopSize);

        if (Math.sqrt(
            (mousePos.x - x) ** 2 + (mousePos.y - y) ** 2
        ) < settings.stopSize + settings.lineWidth) {

            textQueue.push([stop[2], x, y]);
        }
    });

    ctx.lineWidth = 8;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";

    textQueue.forEach(text => {
        drawTextAligned(text[0], "B", text[1], 0, 0, text[2] - settings.stopSize * 2);
    });

    drawTextAligned("+X", "R", 10, 10, width - 20, height - 20);
    drawTextAligned("-X", "L", 10, 10, width - 20, height - 20);
    drawTextAligned("+Z", "B", 10, 10, width - 20, height - 20);
    drawTextAligned("-Z", "T", 10, 10, width - 20, height - 20);
}

fetch("mailmap/poi.json")
    .then(response => response.json())
    .then(json => {
        poi = json;
        animate();
    });





function toggleSettingsMenu() {
    const content = document.getElementById("settings-content");
    const button = document.getElementById("settings-button");

    if (content.hidden) {
        content.hidden = false;
        content.style.display = "flex";
        button.innerHTML = "<";
    } else {
        content.hidden = true;
        content.style.display = "none";
        button.innerHTML = ">";
    }
}

function adjustSetting(setting, value) {
    settings[setting] = value;
}