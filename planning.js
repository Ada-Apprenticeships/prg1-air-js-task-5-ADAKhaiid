const fs = require('fs'); // Import the file system module
const outputfile = "flight_details.txt"; // Define the output file name

// Check for and delete the output file if it exists, to ensure fresh data each run
function deleteExistingOutputFile(outdata) {
    if (fs.existsSync(outdata)) {
        fs.unlinkSync(outdata);
    }
}

// Reads a CSV file and converts each line into an array of values, skipping the header
function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        // Start from index 1 to skip the header
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns); // Add each parsed row to data array
            }
        }

        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

class Airport {  // Create a class to store the Airports
    constructor(airportName, codeName, distanceFromMAN, distanceFromLGW) {
        this.name = airportName;
        this.code = codeName;
        this.distanceFromMAN = distanceFromMAN;
        this.distanceFromLGW = distanceFromLGW;
    }
}

class Aeroplane { // Create a class to store the Areoplanes
    constructor(model, runningCostPerSeat, maxFlightRange, economySeats, businessSeats, firstClassSeats) {
        this.model = model;
        this.costPerSeat = parseFloat(runningCostPerSeat.replace('£', '').replace(',', ''));
        this.maxFlightRange = maxFlightRange;
        this.economySeats = economySeats;
        this.businessSeats = businessSeats;
        this.firstClassSeats = firstClassSeats;
    }
}

function createAirports(data) { // Function will receive the Airport data add it to the class
    return data.map(function(row) {
        // Each row array is mapped to a new Airport object
        return new Airport(row[1], row[0], parseFloat(row[2]), parseFloat(row[3]));
    });
}

function createAeroplanes(data) { // Function will receive the Aeroplane Data and add it to the class
    return data.map(function(row) {
        return new Aeroplane(row[0], row[1], parseFloat(row[2]), parseInt(row[3]), parseInt(row[4]), parseInt(row[5]));
    });
}

function calculateIncome(bookings, prices) { // Calculates the income based on seat bookings and prices per seat class
    // Multiplies each class booking by its price to get income from each class, then sums them
    const economyIncome = bookings.economy * prices.economy;
    const businessIncome = bookings.business * prices.business;
    const firstClassIncome = bookings.firstClass * prices.firstClass;
    return economyIncome + businessIncome + firstClassIncome;
}


function calculateCost(aeroplane, distance, totalSeats) { // Calculates the flight cost by scaling the seat cost based on distance and total seats
    // Distance-based adjustment to cost-per-seat, then multiply by total seats booked
    const costPerSeat = (aeroplane.costPerSeat * (distance / 100)).toFixed(2);
    return (costPerSeat * totalSeats).toFixed(2);
}

// Generates a formatted string of flight details, including income, cost, and profit/loss
function displayFlightDetails(flight) {
    const { airport, aeroplane, bookings, prices } = flight;

    // Total income from seat bookings
    const totalIncome = (calculateIncome(bookings, prices)).toFixed(2);

    // Sum of all the seat types booked 
    const totalSeats = bookings.economy + bookings.business + bookings.firstClass;

    // Calculate flight cost based on distance and total booked seats
    const totalCost = calculateCost(aeroplane, airport.distanceFromMAN, totalSeats);

    // Profit or loss based on difference between income and cost
    const profitOrLoss = (totalIncome - totalCost).toFixed(2);
    
    return `
Flight to ${airport.name} (${airport.code})
Aeroplane Model: ${aeroplane.model}
Bookings: Economy: ${bookings.economy}, Business: ${bookings.business}, First Class: ${bookings.firstClass}
Total Income: £${totalIncome}
Total Cost: £${totalCost}
Expected Profit/Loss: £${profitOrLoss}
`;
}

// Main function to read the CSV files
function main() {
    const airportData = readCsv("airports.csv");
    const aeroplaneData = readCsv("aeroplanes.csv");
    const validFlightData = readCsv("valid_flight_data.csv");
    const invalidFlightData =readCsv("invalid_flight_data.csv")

    const airports = createAirports(airportData); // Will add to class Airports
    const aeroplanes = createAeroplanes(aeroplaneData); // Will add to class Aeroplanes

    let outputLine = "";

    validFlightData.forEach(row => {
        const airport = airports.find(a => a.code === row[1]); // Finds the Airport 
        const aeroplane = aeroplanes.find(a => a.model === row[2]); // Finds the Aeroplane 

        // Extract the booking and pricing information from the current row
        const bookings = {
            economy: parseInt(row[3]),
            business: parseInt(row[4]),
            firstClass: parseInt(row[5])
        };

        const prices = {
            economy: parseFloat(row[6]),
            business: parseFloat(row[7]),
            firstClass: parseFloat(row[8])
        };

        const flight = { airport, aeroplane, bookings, prices }; // Creates an object with all the data
        outputLine += displayFlightDetails(flight) + '\n'; // Appends the flight details to the output string
    });

    // Write all accumulated flight details to the output file in one go
    console.log('Flight details written to flight_details.txt');
    fs.writeFileSync("flight_details.txt", outputLine, "utf-8");

    // Iterate through each row in the invalid flight data
    invalidFlightData.forEach(row => {
    const airport = airports.find(a => a.code === row[1]);
    const aeroplane = aeroplanes.find(a => a.model === row[2]);

    // If the airport code is invalid, log an error and skip this row
    if (!airport) { 
        console.error(`Error: Invalid airport code '${row[1]}'`);
        return;
    }
    
    // If the aeroplane model is invalid, log an error and skip this row
    if (!aeroplane) {
        console.error(`Error: Invalid aeroplane model '${row[2]}'`);
        return;
    }

    // Check if the distance to the destination exceeds the aeroplane's max flight range
    const flightDistance = airport.distanceFromMAN;
    if (flightDistance > aeroplane.maxFlightRange) {
        console.error(`Error: Flight distance to ${airport.name} (${flightDistance} km) exceeds ${aeroplane.model}'s max range (${aeroplane.maxFlightRange} km)`);
        return;
    }

    // Parses seat bookings from the row data
    const bookings = {
        economy: parseInt(row[3]),
        business: parseInt(row[4]),
        firstClass: parseInt(row[5])
    };

    // Parses ticket prices from the row data
    const prices = {
        economy: parseFloat(row[6]),
        business: parseFloat(row[7]),
        firstClass: parseFloat(row[8])
    };

    // Check for overbooking in each class, logging an error and skipping if overbooked
    if (bookings.economy > aeroplane.economySeats) {
        console.error(`Error: Overbooking in economy class. Booked: ${bookings.economy}, Available: ${aeroplane.economySeats}`);
        return;
    }

    if (bookings.business > aeroplane.businessSeats) {
        console.error(`Error: Overbooking in business class. Booked: ${bookings.business}, Available: ${aeroplane.businessSeats}`);
        return;
    }
    
    if (bookings.firstClass > aeroplane.firstClassSeats) {
        console.error(`Error: Overbooking in first class. Booked: ${bookings.firstClass}, Available: ${aeroplane.firstClassSeats}`);
        return;
    }

    // If all checks pass, add the flight details to output
    const flight = { airport, aeroplane, bookings, prices };
    outputLine += displayFlightDetails(flight) + '\n';
});
}

// Clear any old output file before generating a new one
deleteExistingOutputFile(outputfile);
main();
