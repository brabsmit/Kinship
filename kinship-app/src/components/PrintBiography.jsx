import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * PrintBiography - A comprehensive print-optimized biography layout
 * Designed for complete hard copy backup of profile data
 * Includes all profile details, timeline, connections, and AI recommendations
 */
export default function PrintBiography({ person, familyData, relationship }) {
    if (!person) return null;

    // Extract vital statistics
    const bornDate = person.vital_stats?.born_date || 'Unknown';
    const bornPlace = person.vital_stats?.born_location || '';
    const diedDate = person.vital_stats?.died_date || 'Unknown';
    const diedPlace = person.vital_stats?.died_location || '';
    const notes = person.story?.notes || '';

    const bornYear = parseInt(person.vital_stats?.born_date?.match(/\d{4}/)?.[0] || 0);
    const diedYear = parseInt(person.vital_stats?.died_date?.match(/\d{4}/)?.[0] || 0);

    // Get family members
    const spouses = (person.relations?.spouses || [])
        .map(id => {
            const spouse = familyData.find(p => String(p.id) === String(id));
            return spouse ? spouse.name : null;
        })
        .filter(Boolean);

    const children = (person.relations?.children || [])
        .map(id => {
            const child = familyData.find(p => String(p.id) === String(id));
            return child ? child.name : null;
        })
        .filter(Boolean);

    const parents = (person.relations?.parents || [])
        .map(id => {
            const parent = familyData.find(p => String(p.id) === String(id));
            return parent ? parent.name : null;
        })
        .filter(Boolean);

    // Get life events
    const lifeEvents = person.story?.life_events || [];

    // Get story connections
    const storyConnections = (person.related_links || [])
        .map(link => {
            const target = familyData.find(p => p.id === link.target_id);
            return target ? { target, link } : null;
        })
        .filter(Boolean);

    // Get AI recommendations from localStorage (if they exist)
    const aiRecommendations = React.useMemo(() => {
        try {
            const cacheKey = `gemini_cache_${person.id}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                if (data.suggestions && Array.isArray(data.suggestions)) {
                    return data.suggestions;
                }
            }
        } catch (e) {
            console.warn('Failed to retrieve AI recommendations for print', e);
        }
        return null;
    }, [person.id]);

    return (
        <div className="print-biography">
            {/* Header */}
            <div className="print-header">
                <h1>{person.name}</h1>
                {relationship && <p className="print-relationship">{relationship}</p>}
                <div className="print-dates">
                    {bornDate} — {diedDate}
                </div>
            </div>

            {/* Vital Statistics */}
            <section className="print-section">
                <h2>Vital Statistics</h2>
                <table className="print-table">
                    <tbody>
                        <tr>
                            <td className="print-label">Born:</td>
                            <td>{bornDate}{bornPlace && ` in ${bornPlace}`}</td>
                        </tr>
                        <tr>
                            <td className="print-label">Died:</td>
                            <td>{diedDate}{diedPlace && ` in ${diedPlace}`}</td>
                        </tr>
                        {person.vital_stats?.married_date && (
                            <tr>
                                <td className="print-label">Married:</td>
                                <td>{person.vital_stats.married_date}</td>
                            </tr>
                        )}
                        {person.lineage && (
                            <tr>
                                <td className="print-label">Lineage:</td>
                                <td>{person.lineage}</td>
                            </tr>
                        )}
                        {person.generation && (
                            <tr>
                                <td className="print-label">Generation:</td>
                                <td>{person.generation}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Family */}
            <section className="print-section">
                <h2>Family</h2>
                <table className="print-table">
                    <tbody>
                        {parents.length > 0 && (
                            <tr>
                                <td className="print-label">Parent{parents.length > 1 ? 's' : ''}:</td>
                                <td>{parents.join(', ')}</td>
                            </tr>
                        )}
                        {spouses.length > 0 && (
                            <tr>
                                <td className="print-label">Spouse{spouses.length > 1 ? 's' : ''}:</td>
                                <td>{spouses.join(', ')}</td>
                            </tr>
                        )}
                        {children.length > 0 && (
                            <tr>
                                <td className="print-label">Children:</td>
                                <td>{children.join(', ')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Tags */}
            {person.story?.tags && person.story.tags.length > 0 && (
                <section className="print-section">
                    <h2>Notable Attributes</h2>
                    <div className="print-tags">
                        {person.story.tags.map((tag, idx) => (
                            <span key={idx} className="print-tag">{tag}</span>
                        ))}
                    </div>
                </section>
            )}

            {/* Biography */}
            {notes && (
                <section className="print-section print-biography-text">
                    <h2>Biography</h2>
                    <div className="print-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {notes}
                        </ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Life Events Timeline */}
            {lifeEvents.length > 0 && (
                <section className="print-section">
                    <h2>Life Events</h2>
                    <div className="print-timeline">
                        {lifeEvents.map((event, idx) => (
                            <div key={idx} className="print-timeline-event">
                                <div className="print-timeline-year">{event.year || event.date}</div>
                                <div className="print-timeline-details">
                                    <strong>{event.event || event.label}</strong>
                                    {event.location && ` — ${event.location}`}
                                    {event.description && (
                                        <div className="print-timeline-description">{event.description}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Voyages */}
            {person.story?.voyages && person.story.voyages.length > 0 && (
                <section className="print-section">
                    <h2>Immigration</h2>
                    {person.story.voyages.map((voyage, idx) => (
                        <div key={idx} className="print-voyage">
                            <p><strong>{voyage.ship_name}</strong></p>
                            <p>
                                {voyage.departure_port && `From: ${voyage.departure_port}`}
                                {voyage.arrival_port && ` • To: ${voyage.arrival_port}`}
                                {voyage.year && ` • Year: ${voyage.year}`}
                            </p>
                        </div>
                    ))}
                </section>
            )}

            {/* Story Connections */}
            {storyConnections.length > 0 && (
                <section className="print-section">
                    <h2>Story Connections</h2>
                    <div className="print-connections">
                        {storyConnections.map(({ target, link }, idx) => (
                            <div key={idx} className="print-connection">
                                <div className="print-connection-type">{link.relation_type}</div>
                                <div className="print-connection-name">{target.name}</div>
                                {link.source_text && (
                                    <div className="print-connection-quote">"{link.source_text}"</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* AI Research Recommendations - Only show if they exist */}
            {aiRecommendations && aiRecommendations.length > 0 && (
                <section className="print-section">
                    <h2>AI-Generated Research Recommendations</h2>
                    <div className="print-recommendations">
                        {aiRecommendations.map((suggestion, idx) => (
                            <div key={idx} className="print-recommendation">
                                <div className="print-recommendation-number">{idx + 1}.</div>
                                <div className="print-recommendation-text">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({node, ...props}) => <span {...props} />,
                                            a: ({node, ...props}) => <a {...props} />,
                                        }}
                                    >
                                        {suggestion}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Metadata */}
            {person.metadata && (
                <section className="print-section">
                    <h2>Metadata</h2>
                    <table className="print-table">
                        <tbody>
                            <tr>
                                <td className="print-label">Profile ID:</td>
                                <td>{person.id}</td>
                            </tr>
                            {person.metadata.source_ref && (
                                <tr>
                                    <td className="print-label">Source:</td>
                                    <td>{person.metadata.source_ref}</td>
                                </tr>
                            )}
                            {person.metadata.location_in_doc && (
                                <tr>
                                    <td className="print-label">Document Location:</td>
                                    <td>{person.metadata.location_in_doc}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Footer */}
            <footer className="print-footer">
                <p>Generated from Kinship Chronicles • {new Date().toLocaleDateString()}</p>
            </footer>
        </div>
    );
}
