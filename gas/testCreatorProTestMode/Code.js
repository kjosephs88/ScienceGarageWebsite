function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Test Creator Pro')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Overwrites a single backup file to act as the "Active Session"
function saveActiveBackup(payloadStr) {
  const folderName = "Test Creator Pro Backups";
  let folders = DriveApp.getFoldersByName(folderName);
  let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  const fileName = "Active_Test_Backup.json";
  let files = folder.getFilesByName(fileName);
  
  if (files.hasNext()) {
    let file = files.next();
    file.setContent(payloadStr);
    return "Autosaved.";
  } else {
    folder.createFile(fileName, payloadStr);
    return "Backup file created and saved.";
  }
}

// Retrieves the single active backup file
function loadActiveBackup() {
  const folderName = "Test Creator Pro Backups";
  let folders = DriveApp.getFoldersByName(folderName);
  if (!folders.hasNext()) throw new Error("Backup folder not found.");
  
  let files = folders.next().getFilesByName("Active_Test_Backup.json");
  if (!files.hasNext()) throw new Error("No active backup found.");
  
  return files.next().getBlob().getDataAsString();
}