export function csvToJson(csvText: string): object[] {
    const rows: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
            current += char;
        } else if (char === '\n' && !insideQuotes) {
            rows.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (current) rows.push(current);

    const parseLine = (line: string): string[] => {
        const fields: string[] = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"' && insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                fields.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current);
        return fields.map(f => f.replace(/^"|"$/g, '')); // remove outer quotes
    };

    const headers = parseLine(rows[0]);
    return rows.slice(1).map(row => {
        const values = parseLine(row);
        const obj: { [key: string]: string } = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        return obj;
    });
}
