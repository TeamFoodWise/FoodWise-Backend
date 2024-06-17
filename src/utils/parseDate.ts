const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
}

export default parseDate;

