// Map the URL parameters to your JSON files
const CLASS_CONFIG = {
  'chemistry': { name: 'Chemistry', id: '14ZoA8T0nMPdJWUw1SK_Xyg29H-7uNDmr' },
  'physics': { name: 'Physics', id: '1jkSocKGbPCwxwmHfmaS01XW8Qe-gGFWi' },
  'forensics': { name: 'Forensic Science', id: '1-rHu_79GYndg7UJFVnyMk_66ZUbO8WJu' }
};

function doGet(e) {
  // Check the URL for "?mode=something". If nothing is there, default to 'home'.
  const mode = (e.parameter && e.parameter.mode) ? e.parameter.mode.toLowerCase() : 'home';
  
  // Use a Template instead of raw HTML output so we can pass variables
  const template = HtmlService.createTemplateFromFile('Index');
  template.initialMode = mode;
  
  return template.evaluate()
    .setTitle('Assignment Quick Links')
    .setFaviconUrl('https://thesciencegarage.com/SGfavicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getClasses() {
  // Convert our config object into an array to send to the frontend
  return Object.keys(CLASS_CONFIG).map(key => {
    return {
      mode: key,
      name: CLASS_CONFIG[key].name,
      id: CLASS_CONFIG[key].id
    };
  });
}

function getClassData(fileId, forceRefresh) {
  const cache = CacheService.getScriptCache();
  
  if (!forceRefresh) {
    const cachedData = cache.get(fileId);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }

  try {
    const file = DriveApp.getFileById(fileId);
    const jsonString = file.getBlob().getDataAsString();
    
    // Save to cache if it's small enough
    if (jsonString.length < 100000) {
      cache.put(fileId, jsonString, 900);
    }
    
    return JSON.parse(jsonString);
  } catch(e) {
    throw new Error('Could not read the data file. Please ensure the JSON file exists and the ID is correct.');
  }
}