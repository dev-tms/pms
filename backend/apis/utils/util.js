export const getNMonthsBackDate = (n, date = new Date()) => {
    const today = new Date(date);
    const nMonthsBack = new Date(today.setMonth(today.getMonth() - n));
    nMonthsBack.setHours(0, 0, 0, 0);
    return nMonthsBack;
}

export const getCeilAndFloorDatesByDate = (date = new Date()) => {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    return {from: today, to: new Date(today.getTime() + (24*60*60*1000)-1)};
}

export const escapeRegex = (str) => {
  return str?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}