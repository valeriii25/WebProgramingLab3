import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

function ReverseConverter() {
    const { fromCurrency, toCurrency, lastRateForReverse } = useAppContext();
    const [targetAmount, setTargetAmount] = useState('');
    const [resultText, setResultText] = useState('Convert currencies first to get rate.');

    useEffect(() => {
        if (!lastRateForReverse) {
            setResultText('Convert currencies first to get rate.');
            setTargetAmount(''); // Clear input if rate is not available
            return;
        }

        const numTargetAmount = parseFloat(targetAmount);
        if (isNaN(numTargetAmount) || numTargetAmount <= 0) {
            setResultText('Enter a valid amount to receive.');
            return;
        }

        const neededAmount = numTargetAmount / lastRateForReverse;
        const formattedNeeded = new Intl.NumberFormat(undefined, {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(neededAmount);

        setResultText(`You'll need ≈ ${formattedNeeded} ${fromCurrency}`);
    }, [targetAmount, lastRateForReverse, fromCurrency]);

    const handleInputChange = (e) => {
        setTargetAmount(e.target.value);
    };

    return (
        <div className="reverse-converter">
            <h2>Reverse Converter</h2>
            <form className="reverse-form" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="number"
                    className="reverse-amount"
                    placeholder={lastRateForReverse ? `I want to receive... ${toCurrency}` : 'Rate unavailable'}
                    value={targetAmount}
                    onChange={handleInputChange}
                    disabled={!lastRateForReverse}
                    min="0.01"
                    step="0.01"
                />
                <p className="reverse-result">{resultText}</p>
            </form>
        </div>
    );
}

export default ReverseConverter;