const fs = require('fs');
const { type } = require('os');

function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }

        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

class aeroplanes {
    constructor(type, costPerSeat, maxFlightRange, economySeats, businessSeats, firstClassSeats) {
        this._type = type;
        this._costPerSeat = costPerSeat;
        this._maxFlightRange = maxFlightRange;
        this._economySeats = economySeats;
        this._businessSeats = businessSeats;
        this._firstClassSeats = firstClassSeats;
    }
}

class airports {
    constructor(code, fullname, distanceMAN, distanceLGW ){
        this._code = code
        this._fullName = fullname
        this._distanceMAN = distanceMAN
        this._distanceLGW = distanceLGW
    }
}

const aeroplanesData = readCsv('aeroplanes.csv');
if (aeroplanesData) {
    const aeroplanesInstances = aeroplanesData.map(row => {
        const [type, costPerSeat, maxFlightRange, economySeats, businessSeats, firstClassSeats] = row;
        return new aeroplanes(type, Number(costPerSeat.slice(1)), Number(maxFlightRange), Number(economySeats), Number(businessSeats), Number(firstClassSeats));
        
    });
        console.log(aeroplanesInstances)
}

const airportsData = readCsv('airports.csv');
if (airportsData) {
    const airportInstances = airportsData.map(row => {
        const [code, fullname, distanceMAN, distanceLGW] = row;
        return new airports(String(code), String(fullname), Number(distanceMAN), Number(distanceLGW))
            
    });
        // return airportInstances
        console.log(airportInstances)
}


