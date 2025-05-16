import React, { useState, useEffect } from 'react';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';

import {useAppContext} from "../hooks/useAppContext.js";

const popularPairs = [
    ['EUR', 'USD'],
    ['USD', 'JPY'],
    ['GBP', 'EUR'],
    ['USD', 'CAD'],
];

function PopularRatesDisplay() {
    const [rates, setRates] = useState([]);
    const { isLoading, error, fetchPopularRates } = useFrankfurterAPI();
    const { isCurrenciesLoading, currenciesError } = useAppContext();

    useEffect(() => {
        const loadRates = async () => {
            try {
                const fetchedRates = await fetchPopularRates(popularPairs);
                setRates(fetchedRates);
            } catch (err) {
                console.error("Popular rates fetch error in component:", err);
            }
        };
        loadRates();
    }, [])

    return (
        <div className="popular-rates">
            <h2>Popular Rates</h2>
            {isCurrenciesLoading && <p>Waiting for main currency data...</p>}
            {currenciesError && !isCurrenciesLoading && <p className="error-message">Cannot load popular rates due to: {currenciesError}</p>}

            {!isCurrenciesLoading && !currenciesError && (
                <>
                    {isLoading && <p>Loading popular rates...</p>}
                    {error && !isLoading && <p className="error-message">Error loading popular rates: {error}</p>}
                    {!isLoading && !error && rates.length > 0 && (
                        <div className="rates-table">
                            {rates.map(({ pair, rate }) => (
                                <div key={pair}>
                                    {pair} = {rate}
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && !error && rates.length === 0 && !isLoading && <p>No popular rates to display.</p>}
                </>
            )}
        </div>
    );
}

export default PopularRatesDisplay;