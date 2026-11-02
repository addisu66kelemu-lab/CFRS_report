const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '../node_modules/html2canvas/dist/html2canvas.js'),
  path.join(__dirname, '../node_modules/html2canvas/dist/html2canvas.esm.js')
];

const oklchFunctionCode = `
var oklch = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var L = tokens[0] ? (tokens[0].type === 16 ? tokens[0].number / 100 : tokens[0].number) : 0;
    var C = tokens[1] ? (tokens[1].type === 16 ? tokens[1].number / 100 : tokens[1].number) : 0;
    var H = tokens[2] ? (tokens[2].type === 15 ? tokens[2].number : tokens[2].number) : 0;
    var A = tokens[3] ? (tokens[3].type === 16 ? tokens[3].number / 100 : tokens[3].number) : 1;
    var hRad = (H * Math.PI) / 180;
    var a = C * Math.cos(hRad);
    var b = C * Math.sin(hRad);
    var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    var l = l_ * l_ * l_;
    var m = m_ * m_ * m_;
    var s = s_ * s_ * s_;
    var rLinear = +4.0767434720 * l - 3.3077115913 * m + 0.2309699292 * s;
    var gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    var bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    var toSrgb = function (x) {
        if (x <= 0) return 0;
        if (x >= 1) return 255;
        return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255);
    };
    return pack(toSrgb(rLinear), toSrgb(gLinear), toSrgb(bLinear), A);
};
`;

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace error throw with safe fallback
  content = content.replace(
    /throw new Error\("Attempting to parse an unsupported color function \\"" \+ value\.name \+ "\\""\);/g,
    'return COLORS.TRANSPARENT;'
  );

  // 2. Add oklch to SUPPORTED_COLOR_FUNCTIONS if not already present
  if (!content.includes('oklch: oklch')) {
    content = content.replace(
      /var SUPPORTED_COLOR_FUNCTIONS = \{([\s\S]*?)rgba: rgb\s*\};/,
      oklchFunctionCode + '\nvar SUPPORTED_COLOR_FUNCTIONS = {$1rgba: rgb,\n    oklch: oklch,\n    lab: oklch,\n    oklab: oklch,\n    color: oklch\n};'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('html2canvas successfully patched for oklch support.');
