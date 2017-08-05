"use strict";
//#!tsc && NODE_PATH=dist/src node dist/sketch2.js 
Object.defineProperty(exports, "__esModule", { value: true });
const kicad_common_1 = require("./src/kicad_common");
const kicad_strokefont_1 = require("./src/kicad_strokefont");
const kicad_plotter_1 = require("./src/kicad_plotter");
const fs = require("fs");
{
    const font = kicad_strokefont_1.StrokeFont.instance;
    const width = 2000, height = 2000;
    const Canvas = require('canvas');
    const canvas = Canvas.createCanvas ? Canvas.createCanvas(width, height) : new Canvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineJoin = 'round';
    // ctx.translate(canvas.width / 2, canvas.height / 2);
    const plotter = new kicad_plotter_1.CanvasPlotter(ctx);
    const text = 'jeyjmcNV';
    const size = 100;
    const lineWidth = 20;
    const bold = false;
    const italic = false;
    const pos = { x: canvas.width / 2, y: canvas.height / 2 };
    const vjustify = kicad_common_1.TextVjustify.CENTER;
    {
        const boundingbox = font.computeStringBoundaryLimits(text, size, lineWidth, italic);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.translate(0, size / 2);
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(0, 0, boundingbox.width, -boundingbox.height);
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
        ctx.fillRect(0, 0, boundingbox.width, boundingbox.topLimit);
        ctx.fillRect(0, 0, boundingbox.width, boundingbox.bottomLimit);
        {
            const n = text.charCodeAt(0) - ' '.charCodeAt(0);
            const glyph = font.glyphs[n];
            console.log(JSON.stringify(glyph));
            ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
            ctx.fillRect(glyph.boundingBox.pos1.x * size, glyph.boundingBox.pos1.y * size, glyph.boundingBox.width * size, glyph.boundingBox.height * size);
            ctx.restore();
        }
    }
    font.drawText(plotter, pos, text, size, lineWidth, kicad_common_1.TextAngle.HORIZ, kicad_common_1.TextHjustify.LEFT, vjustify, italic, bold);
    const out = fs.createWriteStream('text.png'), stream = canvas.pngStream();
    stream.on('data', function (chunk) {
        out.write(chunk);
    });
    stream.on('end', function () {
        console.log('saved png');
    });
}
//# sourceMappingURL=sketch2.js.map