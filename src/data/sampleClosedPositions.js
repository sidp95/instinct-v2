// Sample closed positions for testing the Closed Positions tab
export const sampleClosedPositions = [
  {
    market: {
      id: 101,
      title: "BTC above $100K by EOD?",
      category: "Crypto",
      endsIn: 0,
    },
    choice: 'yes',
    amount: 10,
    profit: '8.50',
    timestamp: Date.now() - 3600000, // 1 hour ago
    status: 'won',
  },
  {
    market: {
      id: 102,
      title: "Lakers win vs Celtics?",
      category: "Sports",
      endsIn: 0,
    },
    choice: 'no',
    amount: 5,
    profit: '6.25',
    timestamp: Date.now() - 7200000, // 2 hours ago
    status: 'lost',
  },
  {
    market: {
      id: 103,
      title: "Rain in NYC before noon?",
      category: "Weather",
      endsIn: 0,
    },
    choice: 'yes',
    amount: 2,
    profit: '3.20',
    timestamp: Date.now() - 10800000, // 3 hours ago
    status: 'won',
  },
  {
    market: {
      id: 104,
      title: "Tesla closes above $250?",
      category: "Stocks",
      endsIn: 0,
    },
    choice: 'yes',
    amount: 20,
    profit: '15.00',
    timestamp: Date.now() - 14400000, // 4 hours ago
    status: 'lost',
  },
  {
    market: {
      id: 105,
      title: "ETH flips $4K today?",
      category: "Crypto",
      endsIn: 0,
    },
    choice: 'no',
    amount: 15,
    profit: '12.75',
    timestamp: Date.now() - 18000000, // 5 hours ago
    status: 'won',
  },
  {
    market: {
      id: 106,
      title: "Chiefs beat Eagles by 7+?",
      category: "Sports",
      endsIn: 0,
    },
    choice: 'yes',
    amount: 8,
    profit: '14.40',
    timestamp: Date.now() - 21600000, // 6 hours ago
    status: 'won',
  },
];
