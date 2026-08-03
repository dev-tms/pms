export const getTwoMonthsBackDate = () => {
    const today = new Date();
    const twoMonthsBack = new Date(today.setMonth(today.getMonth() - 2));
    twoMonthsBack.setHours(0, 0, 0, 0);
    return twoMonthsBack;
}

export const getCeilAndFloorDatesByDate = (date) => {
    const today = new Date(date? date : new Date());
    today.setHours(0, 0, 0, 0);
    return {from: today, to: new Date(today.getTime() + (24*60*60*1000)-1)};
}

export const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}