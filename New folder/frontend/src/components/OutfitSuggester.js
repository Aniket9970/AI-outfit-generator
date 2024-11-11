import React, { useState } from 'react';
import axios from 'axios';
import './OutfitSuggester.css';

function OutfitSuggester() {
    const [occasion, setOccasion] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSuggest = async () => {
        if (!occasion) return;
        
        setLoading(true);
        try {
            const response = await axios.post('/api/suggest', { occasion });
            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            alert('Failed to get suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="outfit-suggester">
            <h2>Get Outfit Suggestions</h2>
            
            <div className="suggestion-form">
                <input 
                    type="text" 
                    value={occasion} 
                    onChange={(e) => setOccasion(e.target.value)} 
                    placeholder="Enter occasion (e.g., birthday party, formal dinner)" 
                    className="occasion-input"
                />
                <button 
                    onClick={handleSuggest} 
                    disabled={loading}
                    className="suggest-button"
                >
                    {loading ? 'Getting Suggestions...' : 'Suggest Outfit'}
                </button>
            </div>

            {suggestions.length > 0 && (
                <div className="suggestions-container">
                    {suggestions.map((outfit, index) => (
                        <div key={index} className="outfit-suggestion">
                            <h3>Outfit {index + 1}</h3>
                            <div className="outfit-items">
                                {outfit.items.map((item, i) => (
                                    <div key={i} className="outfit-item">
                                        <img src={item.image_url} alt={item.style} />
                                        <p>{item.style}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="accessories">
                                <h4>Suggested Accessories:</h4>
                                <ul>
                                    {outfit.suggested_accessories.map((acc, i) => (
                                        <li key={i}>{acc.style}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OutfitSuggester;

// ... existing code ... 