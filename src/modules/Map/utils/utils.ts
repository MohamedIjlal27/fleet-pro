export const formatEportTimeStamp = (epochTime: number) => {
    const date = new Date(epochTime * 1000); // Convert to milliseconds

// Format the date to MM/DD/YYYY HH:mm
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Use 24-hour format
    });

// Replace the default format to match MM/DD/YYYY HH:mm
    const [month, day, year, hour, minute] = formattedDate.split(/[/,\s:]+/);
    const finalFormattedDate = `${month}/${day}/${year} ${hour}:${minute}`;
    return finalFormattedDate;
}