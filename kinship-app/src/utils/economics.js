
const CPI_DATA = {
    USD: [
        { year: 1600, index: 5.0 }, // Rough estimate for colonial times
        { year: 1700, index: 6.0 },
        { year: 1774, index: 7.4 },
        { year: 1800, index: 10.2 },
        { year: 1860, index: 9.1 },
        { year: 1900, index: 9.0 },
        { year: 1920, index: 20.0 },
        { year: 1950, index: 24.1 },
        { year: 1980, index: 82.4 },
        { year: 2000, index: 172.2 },
        { year: 2024, index: 312.0 }
    ],
    GBP: [
        { year: 1600, index: 5.0 },
        { year: 1700, index: 7.0 },
        { year: 1750, index: 9.0 },
        { year: 1800, index: 16.0 },
        { year: 1850, index: 9.0 },
        { year: 1900, index: 9.5 },
        { year: 1914, index: 10.0 },
        { year: 1920, index: 25.0 },
        { year: 1950, index: 35.0 },
        { year: 1980, index: 260.0 },
        { year: 2000, index: 700.0 },
        { year: 2024, index: 1350.0 }
    ]
};

const getInterpolatedCPI = (year, currency) => {
    const data = CPI_DATA[currency] || CPI_DATA.USD;

    // Sort just in case
    data.sort((a, b) => a.year - b.year);

    if (year <= data[0].year) return data[0].index;
    if (year >= data[data.length - 1].year) return data[data.length - 1].index;

    // Find bounds
    let lower = data[0];
    let upper = data[data.length - 1];

    for (let i = 0; i < data.length - 1; i++) {
        if (year >= data[i].year && year <= data[i + 1].year) {
            lower = data[i];
            upper = data[i + 1];
            break;
        }
    }

    // Linear Interpolation
    const range = upper.year - lower.year;
    const progress = (year - lower.year) / range;
    return lower.index + (upper.index - lower.index) * progress;
};

export const calculatePurchasingPower = (amount, year, currency = 'USD') => {
    const currentCPI = getInterpolatedCPI(2024, currency);
    const historicalCPI = getInterpolatedCPI(year, currency);

    if (!historicalCPI || historicalCPI === 0) return amount;

    return amount * (currentCPI / historicalCPI);
};

export const calculateLaborValue = (amount, year, currency = 'USD') => {
    const purchasingPower = calculatePurchasingPower(amount, year, currency);

    // Real Wage / GDP per Capita Growth approximation
    // ~1.6% compounding growth per year
    const growthRate = 0.016;
    const yearsDiff = Math.max(0, 2024 - year);
    const multiplier = Math.pow(1 + growthRate, yearsDiff);

    return purchasingPower * multiplier;
};

export const formatCurrency = (amount, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    });
    return formatter.format(amount);
};
