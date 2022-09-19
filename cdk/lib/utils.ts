const fs = require('fs')

export const resourceLabel = (prefix:string, resourceId:string) => {
    return `${prefix}-${resourceId.toLowerCase()}`;
};

export const writeToExports = (content: string) => {
    fs.writeFile('../build/export.js', content, (err: any) => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
}

export const dateFromNow = (days: number) => {
  //move to utils
  const DAYS = days * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  const WORKSHOP_DATE = new Date() // date of this workshop
  WORKSHOP_DATE.setHours(0)
  WORKSHOP_DATE.setMinutes(0)
  WORKSHOP_DATE.setSeconds(0)
  WORKSHOP_DATE.setMilliseconds(0)
  return new Date(WORKSHOP_DATE.getTime() + DAYS);
}