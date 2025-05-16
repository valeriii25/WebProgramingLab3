import React, { useState, useEffect, useRef } from 'react';

const quotes = [
    "“An investment in knowledge pays the best interest.” – Benjamin Franklin",
    "“Price is what you pay. Value is what you get.” – Warren Buffett",
    "“It’s not your salary that makes you rich, it’s your spending habits.” – Charles A. Jaffe",
    "“Do not save what is left after spending, but spend what is left after saving.” – Warren Buffett",
    "“Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.” – Ayn Rand"
];

function QuoteDisplay() {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);
    const [isFading, setIsFading] = useState(false);
    const quoteElRef = useRef(null);

    useEffect(() => {
        const changeQuote = () => {
            setIsFading(true);
            setTimeout(() => {
                const idx = Math.floor(Math.random() * quotes.length);
                setCurrentQuote(quotes[idx]);
                setIsFading(false);
            }, 500);
        };

        const intervalId = setInterval(changeQuote, 10000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="quote-block">
            <p ref={quoteElRef} className={`quote ${isFading ? 'fade-out' : ''}`}>
                {currentQuote}
            </p>
        </div>
    );
}

export default QuoteDisplay;