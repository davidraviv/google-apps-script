function purgeOldBackupFiles() {
  // Config
  const FolderId = 'XXXXXXXXXXXXXXXXXXXXX'; // browes to google drive folder and copy the id from the url
  const DaysRetentionNumber = 30; //how many days old your files and folders must be before getting deleted?
  const MinFileCount = 21; // keep last X files and delete the rest if they are older than DaysRetentionNumber
  const MyMail = 'myemail@example.com'

  // Init
  Logger.clear();
  const RetentionPeriod = DaysRetentionNumber * 24 * 60 * 60 * 1000;
  const folder = DriveApp.getFolderById(FolderId);
  const files = folder.getFiles();
  Logger.log('Cleaning old files in folder ' + folder.getName());  
  Logger.log('Keeping at least ' + MinFileCount + ' files, and purging files that are older than ' + DaysRetentionNumber +' days.');
  

  // Iterate on all files and keep them in array fileList
  let fileList = [];
  while (files.hasNext()) {
    var file = files.next();
    fileList.push(file);
  }

  // Sort the files by created date descending
  fileList.sort(function(x, y) {return x.getDateCreated() < y.getDateCreated() ? 1 : -1});
  Logger.log('Sorted files:');
  fileList.forEach((file) => {
    Logger.log(`  ${file.getName()}  ${file.getDateCreated().toISOString().substring(0, 19).replace('T',' ')}`);
  })

  // Cut the first MinFileCount files
  let filesToCheck = fileList.slice(MinFileCount);

  // Purge files older than RetentionPeriod
  let sizeCleared = 0;
  Logger.log('Files to purge while keeping the last ' + MinFileCount + ' files:');
  filesToCheck.forEach((file) => {
    let createdDate = file.getDateCreated().toISOString().substring(0, 19).replace('T',' ');
    if (new Date() - file.getLastUpdated() > RetentionPeriod) {
      sizeCleared += file.getSize();
      //file.setTrashed(true); //uncomment this line to put them in the trash
          Logger.log(`  ${file.getName()}  ${createdDate} - PURGED!`);
    } else {
          Logger.log(`  ${file.getName()}  ${createdDate}`);
    }
  })

  // Calculate and log the purged files size
  sizeCleared = Math.round(43286892 / 1024 / 100)/10;
  Logger.log('Total size cleared: ' + sizeCleared + 'M');

  // Email summary log
  const htmlBody = `<html>
  <body style="font-family:courier;">
  <span style="white-space: pre-wrap">
  ${Logger.getLog()}
  </span>
  </body>
  </html>`
  MailApp.sendEmail(MyMail, 'Daily cleanup of backup files report', '', { htmlBody });
}
