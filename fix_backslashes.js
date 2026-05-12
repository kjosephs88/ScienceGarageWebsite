const fs = require('fs');
const path = 'gas/CH_U07_A30_G_Test_07_Chemical_Equations/Code.js';
let content = fs.readFileSync(path, 'utf8');

// Find the start and end of the TEST_LAYOUT_HTML assignment
const startMarker = 'const TEST_LAYOUT_HTML = `';
const endMarker = '`;';

const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const pre = content.substring(0, startIndex + startMarker.length);
    const middle = content.substring(startIndex + startMarker.length, endIndex);
    const post = content.substring(endIndex);
    
    // Escape backslashes in the middle part
    // We need to double them for the JS string literal
    const escapedMiddle = middle.replace(/\\/g, '\\\\');
    
    fs.writeFileSync(path, pre + escapedMiddle + post);
    console.log("Backslashes escaped successfully.");
} else {
    console.log("Could not find TEST_LAYOUT_HTML markers.");
}
