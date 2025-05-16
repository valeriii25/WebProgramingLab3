import React from 'react';

function CurrencySelect({ label, id, value, onChange, currencies, disabled = false }) {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}:</label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="currency-select"
                disabled={disabled || Object.keys(currencies).length === 0}
            >
                {Object.keys(currencies).length === 0 ? (
                    <option>Loading...</option>
                ) : (
                    Object.entries(currencies).map(([code, name]) => (
                        <option key={code} value={code}>
                            {code} — {name}
                        </option>
                    ))
                )}
            </select>
        </div>
    );
}

export default CurrencySelect;