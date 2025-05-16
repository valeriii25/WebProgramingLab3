import React, {useEffect, useState} from "react";
import {AppContext} from "./AppContext.jsx";

export const AppProvider = ({children}) => {
    const [currencies, setCurrencies] = useState({});
    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [conversionResult, setConversionResult] = useState('');
    const [lastRateForReverse, setLastRateForReverse] = useState(null);
    const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(true);
    const [currenciesError, setCurrenciesError] = useState(null);

    useEffect(() => {
        setConversionResult('');
        setLastRateForReverse(null);
    }, [fromCurrency, toCurrency]);

    useEffect(() => {
        if (!isCurrenciesLoading && Object.keys(currencies).length > 0) {
            if (currencies['EUR']) {
                setFromCurrency('EUR');
            } else if (Object.keys(currencies).length > 0) {
                setFromCurrency(Object.keys(currencies)[0]);
            }

            if (currencies['USD']) {
                setToCurrency('USD');
            } else if (Object.keys(currencies).length > 0) {
                setToCurrency(Object.keys(currencies)[0]);
            }
        }
    }, [isCurrenciesLoading, currencies]);

    const updateConversionResult = (result) => {
        setConversionResult(result);
    };

    const updateLastRateForReverse = (rate) => {
        setLastRateForReverse(rate);
    };

    return (
        <AppContext.Provider
            value={{
                currencies,
                setCurrencies,
                fromCurrency,
                setFromCurrency,
                toCurrency,
                setToCurrency,
                conversionResult,
                updateConversionResult,
                lastRateForReverse,
                updateLastRateForReverse,
                isCurrenciesLoading,
                setIsCurrenciesLoading,
                currenciesError,
                setCurrenciesError,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};