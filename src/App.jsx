import './App.css'
import React, { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useFrankfurterAPI } from './hooks/useFrankfurterAPI';

import Header from './components/Header';
import CurrencyConverterForm from './components/CurrencyConverterForm';
import PopularRatesDisplay from './components/PopularRatesDisplay';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import ReverseConverter from './components/ReverseConverter';
import QuoteDisplay from './components/QuoteDisplay';
import {useAppContext} from "./hooks/useAppContext.js";
import {AppProvider} from "./contexts/AppProvider.jsx";

function AppContent() {
    const {
        setCurrencies,
        setIsCurrenciesLoading,
        setCurrenciesError,
        isCurrenciesLoading,
        currenciesError,
        currencies,
    } = useAppContext();
    const { fetchCurrencies: apiFetchCurrencies } = useFrankfurterAPI();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const currencyData = await apiFetchCurrencies();
                setCurrencies(currencyData);
                setCurrenciesError(null);
            } catch (error) {
                console.error("Failed to load currencies in App:", error);
                setCurrenciesError(error.message || "Failed to load initial currency data.");
            } finally {
                setIsCurrenciesLoading(false);
            }
        };
        loadInitialData();
    }, []);

    if (isCurrenciesLoading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
                    Loading essential currency data...
                </div>
            </>
        );
    }

    if (currenciesError) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: 'red' }}>
                    Error loading application: {currenciesError} <br/> Please try refreshing the page.
                </div>
            </>
        );
    }

    if (Object.keys(currencies).length === 0 && !currenciesError) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: 'orange' }}>
                    No currencies loaded. The API might have returned an empty list.
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="general-column">
                <QuoteDisplay />
                <div className="row">
                    <div className="column">
                        <CurrencyConverterForm />
                        <ReverseConverter />
                    </div>
                    <div className="column">
                        <PopularRatesDisplay />
                        <HistoricalTrendChart />
                    </div>
                </div>
            </main>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </ThemeProvider>
    );
}

export default App;