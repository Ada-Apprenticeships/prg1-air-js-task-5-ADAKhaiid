const {
  Airport,
  Aeroplane,
  readCsv,
  createAirports,
  calculateIncome,
  calculateCost,
  displayFlightDetails,
  deleteExistingOutputFile,
} = require('./planning.js'); 

const fs = require('fs');

describe("Flight Details Module Tests", () => {
  
  // Test readCsv function
  test("readCsv reads file and skips the header row", () => {
      const testFile = 'test.csv';
      fs.writeFileSync(testFile, 'header1,header2\nvalue1,value2\nvalue3,value4', 'utf-8');
      const data = readCsv(testFile);
      expect(data.length).toBe(2);  // Header skipped, so only two rows
      fs.unlinkSync(testFile); // Clean up after test
  });
  
  // Test Airport class instantiation
  test("Airport class stores values correctly", () => {
      const airport = new Airport("Test Airport", "TST", 100, 200);
      expect(airport.name).toBe("Test Airport");
      expect(airport.code).toBe("TST");
      expect(airport.distanceFromMAN).toBe(100);
      expect(airport.distanceFromLGW).toBe(200);
  });
  
  // Test Aeroplane class instantiation
  test("Aeroplane class stores values and parses costs correctly", () => {
      const aeroplane = new Aeroplane("TestModel", "£150.00", 1000, 150, 20, 5);
      expect(aeroplane.model).toBe("TestModel");
      expect(aeroplane.costPerSeat).toBe(150.00);
      expect(aeroplane.maxFlightRange).toBe(1000);
      expect(aeroplane.economySeats).toBe(150);
  });

  // Test createAirports function
  test("createAirports converts data rows to Airport objects", () => {
      const testData = [
          ["TST", "Test Airport", "100", "200"]
      ];
      const airports = createAirports(testData);
      expect(airports[0]).toBeInstanceOf(Airport);
      expect(airports[0].code).toBe("TST");
  });
  
  // Test calculateIncome function
  test("calculateIncome returns correct income", () => {
      const bookings = { economy: 100, business: 20, firstClass: 5 };
      const prices = { economy: 50, business: 200, firstClass: 500 };
      const income = calculateIncome(bookings, prices);
      expect(income).toBe(100 * 50 + 20 * 200 + 5 * 500);
  });
  
  // Test calculateCost function
  test("calculateCost calculates based on distance and seats", () => {
      const aeroplane = new Aeroplane("TestModel", "£150.00", 1000, 150, 20, 5);
      const distance = 500;
      const totalSeats = 10;
      const cost = calculateCost(aeroplane, distance, totalSeats);
      const expectedCost = ((150 * (distance / 100)) * totalSeats).toFixed(2);
      expect(cost).toBe(expectedCost);
  });

  // Test displayFlightDetails function for output format
  test("displayFlightDetails returns formatted flight information", () => {
      const airport = new Airport("Test Airport", "TST", 500, 600);
      const aeroplane = new Aeroplane("TestModel", "£150.00", 1000, 150, 20, 5);
      const bookings = { economy: 50, business: 10, firstClass: 2 };
      const prices = { economy: 80, business: 200, firstClass: 500 };
      const flight = { airport, aeroplane, bookings, prices };
      const result = displayFlightDetails(flight);
      expect(result).toContain("Flight to Test Airport (TST)");
      expect(result).toContain("Aeroplane Model: TestModel");
      expect(result).toContain("Total Income: £" + (calculateIncome(bookings, prices)).toFixed(2));
  });
  
  // Test deleteExistingOutputFile function
  test("deleteExistingOutputFile deletes an existing file", () => {
      const testFile = "test_output.txt";
      fs.writeFileSync(testFile, "Temporary content", "utf-8");
      deleteExistingOutputFile(testFile);
      expect(fs.existsSync(testFile)).toBe(false);
  });
});
