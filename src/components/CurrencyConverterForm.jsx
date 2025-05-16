import React, { useState, useEffect } from 'react';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
import CurrencySelect from './CurrencySelect';
import {useAppContext} from "../hooks/useAppContext.js";

function CurrencyConverterForm() {
    const {
        currencies,
        fromCurrency,
        setFromCurrency,
        toCurrency,
        setToCurrency,
        conversionResult,
        updateConversionResult,
        updateLastRateForReverse,
        isCurrenciesLoading,
        currenciesError,
    } = useAppContext();

    const [amount, setAmount] = useState('1');
    const [formError, setFormError] = useState('');
    const [currentConversionMessage, setCurrentConversionMessage] = useState('');

    const { isLoading: isConverting, error: conversionApiError, fetchConversionRate } = useFrankfurterAPI();

    useEffect(() => {
        if (conversionResult === '') {
            setFormError('');
            setCurrentConversionMessage('');
        }
    }, [conversionResult]);


    useEffect(() => {
        if(conversionApiError) {
            setCurrentConversionMessage('');
            setFormError(`API Error: ${conversionApiError}`);
            updateConversionResult('');
        }
    }, [conversionApiError, setFormError, updateConversionResult]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        updateConversionResult('');

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setFormError('Please enter a valid positive amount.');
            return;
        }
        if (!fromCurrency || !toCurrency) {
            setFormError('Please select both "From" and "To" currencies.');
            return;
        }
        if (fromCurrency === toCurrency) {
            setFormError('Please select different currencies.');
            return;
        }
        if (currenciesError) {
            setFormError(`Cannot convert due to currency load error: ${currenciesError}`);
            return;
        }

        setCurrentConversionMessage('Converting...');
        try {
            const convertedValue = await fetchConversionRate(fromCurrency, toCurrency, numAmount);
            const rate = convertedValue / numAmount;

            updateConversionResult(`${numAmount} ${fromCurrency} = ${convertedValue} ${toCurrency}`);
            updateLastRateForReverse(rate);
            setCurrentConversionMessage('');
        } catch (err) {
            setCurrentConversionMessage('');
            if (!conversionApiError) {
                setFormError(`Conversion failed: ${err.message}`);
            }
            updateConversionResult('');
            updateLastRateForReverse(null);
        }
    };

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
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        currencies={currencies}
                        disabled={formDisabled}
                    />
                    <CurrencySelect
                        label="To"
                        id="to-currency"
                        value={toCurrency}
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