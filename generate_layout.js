const fs = require('fs');

const html = fs.readFileSync('public/Teacher-Tools/Answer-Keys/CH_U07_A30_G.html', 'utf8');
const startIndex = html.indexOf('<div class="narrative-block">');
const endIndex = html.indexOf('<div class="abridged-container">');

let layoutHtml = html.substring(startIndex, endIndex);
layoutHtml = layoutHtml.replace(/<div class="answer-box">.*?<\/div>/gs, ''); // Remove all answer boxes
// Remove the 'id="qX"' and '<a href="#ansX">X.</a>' from question texts, to clean it up?
// The user wants the layout. The links might be useless since there's no abridged key. 
layoutHtml = layoutHtml.replace(/<a href="#ans\d+">(\d+\.)<\/a>/g, '$1');

const jsCode = "\n// ==========================================\n// TEST LAYOUT HTML\n// ==========================================\nconst TEST_LAYOUT_HTML = `" + layoutHtml.replace(/`/g, '\\`') + "`;\n";

const codeJsPath = 'gas/CH_U07_A30_G_Test_07_Chemical_Equations/Code.js';
let codeJs = fs.readFileSync(codeJsPath, 'utf8');

if (!codeJs.includes('TEST_LAYOUT_HTML')) {
    fs.writeFileSync(codeJsPath, codeJs + jsCode);
    console.log("Appended to Code.js");
} else {
    // Replace existing
    codeJs = codeJs.replace(/const TEST_LAYOUT_HTML = `[\s\S]*?`;\n/, jsCode);
    fs.writeFileSync(codeJsPath, codeJs);
    console.log("Replaced in Code.js");
}
