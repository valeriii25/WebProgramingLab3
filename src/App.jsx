import './App.css'
import React, { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { useFrankfurterAPI } from './hooks/useFrankfurterAPI';

import Header from './components/Header';
import CurrencyConverterForm from './components/CurrencyConverterForm';
import PopularRatesDisplay from './components/PopularRatesDisplay';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import ReverseConverter from './components/ReverseConverter';
import QuoteDisplay from './components/QuoteDisplay';

function AppContent() {
    const {
        setCurrencies,
        setIsCurrenciesLoading,
        setCurrenciesError,
        isCurrenciesLoading, // Используется для условного рендеринга
        currenciesError,   // Используется для условного рендеринга
        currencies,        // Используется для проверки, что валюты действительно загружены
    } = useAppContext();
    const { fetchCurrencies: apiFetchCurrencies } = useFrankfurterAPI();

    useEffect(() => {
        const loadInitialData = async () => {
            //setIsCurrenciesLoading(true); // Уже true по умолчанию
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
    }
    //, [apiFetchCurrencies, setCurrencies, setIsCurrenciesLoading, setCurrenciesError]
    );

    // Главный гейткипер: не рендерим ничего, пока валюты не загрузятся
    if (isCurrenciesLoading) {
        return (
            <>
                {/* ThemeProvider нужен для Header даже при загрузке */}
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

    // Дополнительная проверка: убедимся, что объект currencies не пуст,
    // прежде чем рендерить компоненты, которые от него зависят.
    // Это может быть излишним, если isCurrenciesLoading = false всегда означает, что currencies засетано (успешно или с ошибкой).
    // Но для надежности, особенно если setCurrencies может быть вызван с пустым объектом при некоторых ошибках API.
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


    // Если все проверки пройдены, рендерим основной контент
    return (
        <>
            <Header />
            <main className="general-column">
                <QuoteDisplay />
                <div className="row">
                    <div className="column">
                        {/* Передаем isReady чтобы компоненты знали когда можно работать */}
                        <CurrencyConverterForm />
                        <ReverseConverter />
                    </div>
                    <div className="column">
                        <PopularRatesDisplay />
                        <HistoricalTrendChart />
                    </div>
                </div>
            </main>
            <footer className="footer">
                <p>Currency Converter App - React Version</p>
            </footer>
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