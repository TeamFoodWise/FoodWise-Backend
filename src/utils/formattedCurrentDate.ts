function getFormattedDate() {
    const date = new Date();
    const localISODate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const [year, month, day] = localISODate.split('-');

    return `${day}-${month}-${year}`;
}

export default getFormattedDate;