import {useState} from 'react';

const CURRENCY_LIST_URL = 'https://api.frankfurter.dev/v1/currencies';
const HISTORICAL_BASE_URL = 'https://api.frankfurter.dev/v1/';
const LATEST_BASE_URL = 'https://api.frankfurter.dev/v1/latest';

export const useFrankfurterAPI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchCurrencies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(CURRENCY_LIST_URL);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (err) {
            setError(err.message || "Failed to load currencies.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConversionRate = async (from, to, amount) => {
        setIsLoading(true);
        setError(null);
        try {
            const convertUrl = `${LATEST_BASE_URL}?amount=${amount}&from=${from}&to=${to}`;
            const res = await fetch(convertUrl);
            if (!res.ok) {
                if (res.status === 422 || res.status === 404) {
                    throw new Error(`Could not find rates for ${from} to ${to}. Check currencies or API availability.`);
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            return data.rates[to];
        } catch (err) {
            setError(err.message || "Conversion error.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPopularRates = async (popularPairs) => {
        setIsLoading(true);
        setError(null);
        try {
            const ratePromises = popularPairs.map(async ([from, to]) => {
                try {
                    const res = await fetch(`${LATEST_BASE_URL}?from=${from}&to=${to}`);
                    if (!res.ok) return { pair: `${from}/${to}`, rate: 'Error' };
                    const data = await res.json();
                    return { pair: `${from}/${to}`, rate: data.rates[to].toFixed(4) };
                } catch {
                    return { pair: `${from}/${to}`, rate: 'Error' };
                }
            });
            return await Promise.all(ratePromises);
        } catch (err) {
            setError(err.message || "Failed to load popular rates.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistoricalData = async (baseCurrency, targetCurrency) => {
        setIsLoading(true);
        setError(null);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        const apiUrl = `${HISTORICAL_BASE_URL}${formattedStartDate}..${formattedEndDate}?from=${baseCurrency}&to=${targetCurrency}`;

        try {
            const res = await fetch(apiUrl);
            if (!res.ok) {
                if (res.status === 422 || res.status === 404) {
                    throw new Error(`Historical data unavailable for ${baseCurrency}/${targetCurrency}.`);
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (!data.rates || Object.keys(data.rates).length === 0) {
                throw new Error(`No historical rates found for ${baseCurrency}/${targetCurrency} in the selected period.`);
            }
            return data;
        } catch (err) {
            setError(err.message || "Failed to load historical data.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, fetchCurrencies, fetchConversionRate, fetchPopularRates, fetchHistoricalData, formatDate };
};