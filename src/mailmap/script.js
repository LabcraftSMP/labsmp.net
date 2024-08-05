let poi;

let settings = {
    stopSize: 6,
    lineWidth: 3,
    fontSize: 24,
};

let zoom = 0.14;
let dragging = false;
let offset = {x:0, y:0};
let offsetOld = {x:0, y:0};
let mousePos = {x:0, y:0};
let mousePosOld = {x:0, y:0};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

canvas.addEventListener("mousemove", e => {
    if (dragging) {
        offset.x = offsetOld.x - (mousePosOld.x - mousePos.x);
        offset.y = offsetOld.y - (mousePosOld.y - mousePos.y);
        canvas.style.cursor = "move";
    } else canvas.style.cursor = "";

    updateCanvas(e);
});

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

    ctx.reset();

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `bold ${settings.fontSize}px sans-serif`;
    ctx.miterLimit = 1;

    ctx.lineWidth = settings.lineWidth;
    ctx.fillStyle = "white";
    ctx.setLineDash([10, 10]);

    ctx.strokeStyle = "rgba(0, 0, 255, 0.3)";
    drawLine(width / 2 + offset.x, 0, width / 2 + offset.x, height);

    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    drawLine(0, height / 2 + offset.y, width, height / 2 + offset.y);

    let textQueue = [];

    ctx.setLineDash([]);
    ctx.strokeStyle = "black";
    poi.rails.forEach(rail => {
        const x1 = rail[0] * zoom + width / 2 + offset.x;
        const y1 = rail[1] * zoom + height / 2 + offset.y;
        const x2 = rail[2] * zoom + width / 2 + offset.x;
        const y2 = rail[3] * zoom + height / 2 + offset.y;

        drawLine(x1, y1, x2, y2);

        if (mousePos.x >= x1 - settings.lineWidth &&
            mousePos.y >= y1 - settings.lineWidth &&
            mousePos.x <= x2 + settings.lineWidth &&
            mousePos.y <= y2 + settings.lineWidth
        ) {
            textQueue = [[`N: ${Math.round(rail[0] / 8)}, ${Math.round(rail[1] / 8)}`, mousePos.x, mousePos.y - settings.fontSize * 1.2, "#800909"]];
            textQueue.push([`N: ${Math.round(rail[2] / 8)}, ${Math.round(rail[3] / 8)}`, mousePos.x, mousePos.y, "#800909"]);
        }
    });

    poi.stops.forEach(stop => {
        const x = stop[0] * zoom + width / 2 + offset.x;
        const y = stop[1] * zoom + height / 2 + offset.y;

        ctx.strokeStyle = stop[3] ? stop[3] : "black";
        drawCircle(x, y, settings.stopSize);

        if (Math.sqrt(
            (mousePos.x - x) ** 2 + (mousePos.y - y) ** 2
        ) < settings.stopSize + settings.lineWidth) {
            textQueue = [[stop[2], x, y - settings.fontSize * 2.4]];
            textQueue.push([`OW: ${stop[0]}, ${stop[1]}`, x, y - settings.fontSize * 1.2, "#098023"]);
            textQueue.push([`N: ${Math.round(stop[0] / 8)}, ${Math.round(stop[1] / 8)}`, x, y, "#800909"]);
        }
    });

    ctx.lineWidth = 8;
    ctx.strokeStyle = "white";

    textQueue.forEach(text => {
        ctx.fillStyle = text[3] ? text[3] : "black";
        drawTextAligned(text[0], "B", text[1], 0, 0, text[2] - settings.stopSize * 2);
    });

    const xAxis = clamp(width / 2 + offset.x, settings.fontSize * 3, width - settings.fontSize * 3);
    const yAxis = clamp(height / 2 + offset.y, settings.fontSize * 3, height - settings.fontSize * 3);
    ctx.fillStyle = "black";
    drawTextAligned("+X", "R", 0, yAxis, width - 10, 0);
    drawTextAligned("-X", "L", 10, yAxis, width, 0);
    drawTextAligned("+Z", "B", xAxis, 0, 0, height - 10);
    drawTextAligned("-Z", "T", xAxis, 10, 0, height);

    const xCoord = Math.round((mousePos.x - width / 2) / zoom);
    const zCoord = Math.round((mousePos.y - height / 2) / zoom);

    ctx.fillStyle = "#098023";
    ctx.fillText(xCoord + ", " + zCoord, 5, height - settings.fontSize * 1.2 - 5);

    ctx.fillStyle = "#800909";
    ctx.fillText(Math.round(xCoord / 8) + ", " + Math.round(zCoord / 8), 5, height - 5);
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

canvas.addEventListener("wheel", e =>
    zoom = clamp(zoom - e.deltaY / 10000, 0.01, 1)
);

canvas.addEventListener("mousedown", () => {
    dragging = true;
    offsetOld = JSON.parse(JSON.stringify(offset));
    mousePosOld = JSON.parse(JSON.stringify(mousePos));
});
canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);



function clamp(num, min, max) {
    return num <= min ? min 
    : num >= max ? max : num;
}