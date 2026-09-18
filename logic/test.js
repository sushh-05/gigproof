const { checkEligibility } = require('./rules-engine');

const sampleData = [
    { app: "Swiggy", date: "2026-04-01" },
    { app: "Swiggy", date: "2026-04-02" },
    { app: "Zomato", date: "2026-04-03" },
    // add more fake dates here to test different scenarios
];

console.log(checkEligibility(sampleData));