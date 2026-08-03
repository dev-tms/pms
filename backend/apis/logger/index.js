import log from 'node-file-logger';
const options = {
    folderPath: './logs/',
    dateBasedFileNaming: true,
    fileNamePrefix: 'DailyLogs_',
    fileNameExtension: '.log',    
    dateFormat: 'YYYY_MM_D',
    timeFormat: 'h:mm:ss A',
    timeZone: 'Asia/Kolkata'
  }
log.SetUserOptions(options); 

export default log;