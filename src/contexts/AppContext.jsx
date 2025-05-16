import React, { createContext, useState, useContext, useEffect } from 'react'; // Добавлен useEffect

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [currencies, setCurrencies] = useState({});
    // Изначально не устанавливаем, чтобы избежать гонки состояний
    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [conversionResult, setConversionResult] = useState('');
    const [lastRateForReverse, setLastRateForReverse] = useState(null);
    const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(true); // По умолчанию true
    const [currenciesError, setCurrenciesError] = useState(null);

    // Устанавливаем значения по умолчанию ПОСЛЕ загрузки списка валют
    useEffect(() => {
        if (!isCurrenciesLoading && Object.keys(currencies).length > 0) {
            if (currencies['EUR']) { // Проверяем наличие EUR
                setFromCurrency('EUR');
            } else if (Object.keys(currencies).length > 0) { // Если нет EUR, берем первую доступную
                setFromCurrency(Object.keys(currencies)[0]);
            }

            if (currencies['USD']) { // Проверяем наличие USD
                setToCurrency('USD');
            } else if (Object.keys(currencies).length > 1) { // Если нет USD, берем вторую доступную (если есть)
                const currencyKeys = Object.keys(currencies);
                // Убедимся, что не совпадает с fromCurrency
                const defaultTo = currencyKeys.find(key => key !== fromCurrency) || currencyKeys[0];
                setToCurrency(defaultTo);
            } else if (Object.keys(currencies).length > 0) { // Если только одна валюта
                setToCurrency(Object.keys(currencies)[0]);
            }
        }
    }, [isCurrenciesLoading, currencies, fromCurrency]); // Зависимости: isCurrenciesLoading и currencies

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