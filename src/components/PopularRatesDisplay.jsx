// import React, { useState, useEffect } from 'react';
// import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
//
// const popularPairs = [
//     ['EUR', 'USD'],
//     ['USD', 'JPY'],
//     ['GBP', 'EUR'],
//     ['USD', 'CAD'],
// ];
//
// function PopularRatesDisplay() {
//     const [rates, setRates] = useState([]);
//     const { isLoading, error, fetchPopularRates } = useFrankfurterAPI();
//
//     useEffect(() => {
//         const loadRates = async () => {
//             try {
//                 const fetchedRates = await fetchPopularRates(popularPairs);
//                 setRates(fetchedRates);
//             } catch (err) {
//                 // Error is handled by the hook's error state
//                 console.error("Popular rates fetch error in component:", err)
//             }
//         };
//         loadRates();
//     }, [fetchPopularRates]);
//
//     return (
//         <div className="popular-rates">
//             <h2>Popular Rates</h2>
//             {isLoading && <p>Loading popular rates...</p>}
//             {error && !isLoading && <p>Error loading popular rates: {error}</p>}
//             {!isLoading && !error && rates.length > 0 && (
//                 <div className="rates-table">
//                     {rates.map(({ pair, rate }) => (
//                         <div key={pair}>
//                             {pair} = {rate}
//                         </div>
//                     ))}
//                 </div>
//             )}
//             {!isLoading && !error && rates.length === 0 && <p>No popular rates to display.</p>}
//         </div>
//     );
// }
//
// export default PopularRatesDisplay;

import React, { useState, useEffect } from 'react';
import { useFrankfurterAPI } from '../hooks/useFrankfurterAPI';
import { useAppContext } from '../contexts/AppContext'; // Импортируем

const popularPairs = [
    ['EUR', 'USD'],
    ['USD', 'JPY'],
    ['GBP', 'EUR'],
    ['USD', 'CAD'],
];

function PopularRatesDisplay() {
    const [rates, setRates] = useState([]);
    const { isLoading, error, fetchPopularRates } = useFrankfurterAPI();
    const { isCurrenciesLoading, currenciesError } = useAppContext(); // Получаем состояние загрузки основных валют

    useEffect(() => {
        // Не загружаем популярные курсы, пока основные валюты не загружены
        if (isCurrenciesLoading || currenciesError) {
            setRates([]); // Очищаем, если были предыдущие данные
            return;
        }

        const loadRates = async () => {
            try {
                const fetchedRates = await fetchPopularRates(popularPairs);
                setRates(fetchedRates);
            } catch (err) {
                console.error("Popular rates fetch error in component:", err);
                // Ошибка также будет в хуке error
            }
        };
        loadRates();
    }, [fetchPopularRates, isCurrenciesLoading, currenciesError]); // Добавляем зависимости

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