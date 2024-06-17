const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split(' - ').map(Number);
    return new Date(year, month - 1, day);
}

export default parseDate;

