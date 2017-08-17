#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kicad_utils_1 = require("./kicad-utils");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
let verbose = 0;
function v(...a) { if (verbose >= 1)
    console.log(...a); }
function vv(...a) { if (verbose >= 2)
    console.log(...a); }
function vvv(...a) { if (verbose >= 3)
    console.log(...a); }
const commands = {
    sch2svg: function (_argv) {
        const argv = minimist(_argv, {
            boolean: true,
            alias: {
                "o": "output",
                "h": "help",
            }
        });
        if (argv.help || !argv._.length) {
            console.log('Usage: sch2svg [options] [file.lib] file.sch');
            console.log('Options:');
            console.log('  -h --help: show help');
            console.log('     --force: force overwrite');
            console.log('  -o --output: output file (default=basename-of-sch.svg)');
            console.log('  -png: set output format to png (require npm install canvas)');
            console.log('  -v -vv -vvv: verbose mode');
            process.exit(argv.help ? 0 : 1);
        }
        vv(argv);
        const libFiles = [];
        const schFiles = [];
        for (let arg of argv._) {
            if (arg.endsWith(".sch")) {
                v("Add SCH file", arg);
                schFiles.push(arg);
            }
            else if (arg.endsWith(".lib")) {
                v("Add LIB file", arg);
                libFiles.push(arg);
            }
            else {
                console.warn("WARN: unkown file type: " + arg);
            }
        }
        const _libs = {};
        function lib(path) {
            if (!_libs[path]) {
                v("Loading LIB", path);
                try {
                    const content = fs.readFileSync(path, 'utf-8');
                    _libs[path] = kicad_utils_1.Lib.Library.load(content);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            return _libs[path];
        }
        for (let schFile of schFiles) {
            const outFile = argv.output || schFile.replace(/\.sch$/, argv.png ? '.png' : '.svg');
            v("Checking output file", outFile);
            try {
                const stat = fs.statSync(outFile);
                if (stat) {
                    if (!argv.force) {
                        console.warn(outFile + " is already exists. skip");
                        continue;
                    }
                }
            }
            catch (e) {
                if (e.code === 'ENOENT') {
                    // ok
                }
                else {
                    throw e;
                }
            }
            const libs = libFiles.map((i) => lib(i));
            if (!libs.length) {
                v("Autoload .lib files from directory because .lib files are not specified");
                const dir = path.dirname(schFile);
                const files = fs.readdirSync(dir);
                for (let file of files) {
                    if (file.endsWith(".lib")) {
                        libs.push(lib(path.join(dir, file)));
                    }
                }
            }
            v("Loading SCH", schFile);
            const sch = kicad_utils_1.Sch.Schematic.load(fs.readFileSync(schFile, 'utf-8'));
            if (argv.png) {
                const MAX_WIDTH = 1920 * 2;
                const MAX_HEIGHT = 1080 * 2;
                const scale = Math.min(MAX_WIDTH / sch.descr.width, MAX_HEIGHT / sch.descr.height);
                const Canvas = require('canvas');
                const canvas = Canvas.createCanvas ? Canvas.createCanvas(sch.descr.width * scale, sch.descr.height * scale) : new Canvas(sch.descr.width * scale, sch.descr.height * scale);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.translate(0, 0);
                ctx.scale(scale, scale);
                const plotter = new kicad_utils_1.CanvasPlotter(ctx);
                plotter.startPlot();
                new kicad_utils_1.SchPlotter(plotter).plotSchematic(sch, libs);
                plotter.endPlot();
                const out = fs.createWriteStream(outFile), stream = canvas.pngStream();
                stream.on('data', function (chunk) {
                    out.write(chunk);
                });
                stream.on('end', function () {
                    console.log('saved png');
                });
            }
            else {
                console.log('Plotting with SVGPlotter');
                const svgPlotter = new kicad_utils_1.SVGPlotter();
                svgPlotter.startPlot();
                new kicad_utils_1.SchPlotter(svgPlotter).plotSchematic(sch, libs);
                svgPlotter.endPlot();
                console.log(`Writing output to ${outFile}`);
                fs.writeFileSync(outFile, svgPlotter.output);
            }
        }
    }
};
const argv = minimist(process.argv.slice(2), {
    stopEarly: true,
    boolean: true,
    alias: {
        "h": "help",
    }
});
verbose = (Object.keys(argv).find((i) => /^v+$/.test(i)) || "").length;
vv(argv);
;
const subcommand = argv._.shift();
if (!subcommand || argv.help) {
    console.log("Usage: kicad-utils [opts] [subcommand]");
    console.log('Options:');
    console.log('  -h --help: show help');
    console.log('  --v --vv --vvv: verbose mode');
    console.log('Sub commands:');
    process.exit(argv.help ? 0 : 1);
}
const func = commands[subcommand];
if (!func) {
    console.warn(`Unknown subcommand ${subcommand}`);
    process.exit(1);
}
func(argv._);
//# sourceMappingURL=kicad-utils_cui.js.map