const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day + 1);
}

export default parseDate;

