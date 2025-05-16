import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
import CurrencySelect from './CurrencySelect';

function CurrencyConverterForm() {
    const {
        currencies,
        fromCurrency, // Будет установлен AppContext'ом после загрузки currencies
        setFromCurrency,
        toCurrency,   // Будет установлен AppContext'om
        setToCurrency,
        conversionResult,
        updateConversionResult,
        updateLastRateForReverse,
        isCurrenciesLoading, // Используем это для блокировки формы
        currenciesError,
    } = useAppContext();

    const [amount, setAmount] = useState('1');
    const [formError, setFormError] = useState('');
    const [currentConversionMessage, setCurrentConversionMessage] = useState('');

    const { isLoading: isConverting, error: conversionApiError, fetchConversionRate } = useFrankfurterAPI();

    // Эффект для сброса состояния при смене валют извне (например, из AppContext)
    // или при первоначальной загрузке, когда fromCurrency/toCurrency еще могут быть не установлены
    useEffect(() => {
        updateLastRateForReverse(null);
        updateConversionResult('');
        setFormError('');
        setCurrentConversionMessage('');
    }, [fromCurrency, toCurrency, updateLastRateForReverse, updateConversionResult]);

    useEffect(() => {
        if(conversionApiError) {
            setCurrentConversionMessage('');
            setFormError(`API Error: ${conversionApiError}`);
            updateConversionResult('');
        }
    }, [conversionApiError, setFormError, updateConversionResult]);

    const handleSubmit = async (e) => {
        // ... (логика handleSubmit остается почти такой же) ...
        // Важно, что isCurrenciesLoading уже должно быть false здесь
        // и fromCurrency/toCurrency должны быть валидными
        e.preventDefault();
        setFormError('');
        updateConversionResult('');

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setFormError('Please enter a valid positive amount.');
            return;
        }
        // Проверка, что fromCurrency и toCurrency выбраны
        if (!fromCurrency || !toCurrency) {
            setFormError('Please select both "From" and "To" currencies.');
            return;
        }
        if (fromCurrency === toCurrency) {
            setFormError('Please select different currencies.');
            return;
        }

        // Эта проверка может быть уже избыточной, если AppContent блокирует рендер
        // if (isCurrenciesLoading) {
        //   setFormError('Currencies are still loading. Please wait.');
        //   return;
        // }
        if (currenciesError) {
            setFormError(`Cannot convert due to currency load error: ${currenciesError}`);
            return;
        }

        setCurrentConversionMessage('Converting...');
        try {
            const convertedValue = await fetchConversionRate(fromCurrency, toCurrency, numAmount);
            const rate = convertedValue / numAmount;

            const formattedAmount = new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numAmount);
            const formattedConverted = new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(convertedValue);

            updateConversionResult(`${formattedAmount} ${fromCurrency} = ${formattedConverted} ${toCurrency}`);
            updateLastRateForReverse(rate);
            setCurrentConversionMessage('');
        } catch (err) {
            setCurrentConversionMessage('');
            if (!conversionApiError) { // Если хук не установил ошибку
                setFormError(`Conversion failed: ${err.message}`);
            }
            updateConversionResult('');
            updateLastRateForReverse(null);
        }
    };

    // Блокируем всю форму, если основные валюты еще не загружены или есть ошибка их загрузки
    const formDisabled = isCurrenciesLoading || !!currenciesError || !fromCurrency || !toCurrency;


    return (
        <div className="converter">
            <h2>Currency Converter</h2>
            { (isCurrenciesLoading) && <p>Loading currency options...</p> }
            { currenciesError && <p className="error-message">Could not load currency options: {currenciesError}</p>}
            { !isCurrenciesLoading && !currenciesError && (
                <form onSubmit={handleSubmit} className="form">
                    <CurrencySelect
                        label="From"
                        id="from-currency"
                        value={fromCurrency} // Теперь fromCurrency будет установлен AppContext'ом
                        onChange={(e) => setFromCurrency(e.target.value)}
                        currencies={currencies}
                        disabled={formDisabled}
                    />
                    <CurrencySelect
                        label="To"
                        id="to-currency"
                        value={toCurrency} // Теперь toCurrency будет установлен AppContext'ом
                        onChange={(e) => setToCurrency(e.target.value)}
                        currencies={currencies}
                        disabled={formDisabled}
                    />
                    <div className="form-group">
                        <label htmlFor="amount">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            className="amount-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            disabled={formDisabled || isConverting}
                        />
                    </div>
                    <button type="submit" className="convert-button" disabled={formDisabled || isConverting}>
                        {isConverting ? 'Converting...' : 'Convert'}
                    </button>
                </form>
            )}
            {/* ... (отображение сообщений formError, currentConversionMessage, conversionResult) ... */}
            {formError && <p className="conversion-output error-message">{formError}</p>}
            {!formError && currentConversionMessage && <p className="conversion-output">{currentConversionMessage}</p>}
            {!formError && !currentConversionMessage && conversionResult && (
                <p className="conversion-output result">{conversionResult}</p>
            )}
            {!formError && !currentConversionMessage && !conversionResult && !currenciesError && !isCurrenciesLoading && (
                <p className="conversion-output">Enter amount and convert.</p>
            )}
        </div>
    );
}

export default CurrencyConverterForm;