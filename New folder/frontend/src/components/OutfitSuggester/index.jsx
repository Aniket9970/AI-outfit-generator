import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function OutfitSuggester() {
    const [occasion, setOccasion] = useState('');
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);

    const getSuggestions = async () => {
        if (!occasion) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/suggest', {
                occasion: occasion
            });
            setSuggestions(response.data);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            alert('Failed to get suggestions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="outfit-suggester">
            <h2>Get Outfit Suggestions</h2>
            <div className="input-group">
                <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="Enter occasion (e.g., party, work)"
                    className="occasion-input"
                />
                <button
                    onClick={getSuggestions}
                    disabled={!occasion || loading}
                    className="suggest-button"
                >
                    {loading ? 'Getting suggestions...' : 'Get Suggestions'}
                </button>
            </div>
            {suggestions && (
                <div className="suggestions">
                    <h3>Suggested Outfit:</h3>
                    <pre>{JSON.stringify(suggestions, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default OutfitSuggester; 