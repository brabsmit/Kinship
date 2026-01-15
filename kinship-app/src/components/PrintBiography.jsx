import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * PrintBiography - A print-optimized biography layout
 * Designed for clean PDF generation and physical printing
 */
export default function PrintBiography({ person, familyData, relationship }) {
    if (!person) return null;

    // Extract data - using correct field names
    const bornDate = person.vital_stats?.born_date || 'Unknown';
    const bornPlace = person.vital_stats?.born_location || '';
    const diedDate = person.vital_stats?.died_date || 'Unknown';
    const diedPlace = person.vital_stats?.died_location || '';
    const notes = person.story?.notes || '';

    // Get spouse names
    const spouses = (person.relations?.spouses || [])
        .map(id => {
            const spouse = familyData.find(p => String(p.id) === String(id));
            return spouse ? spouse.name : null;
        })
        .filter(Boolean);

    // Get children names
    const children = (person.relations?.children || [])
        .map(id => {
            const child = familyData.find(p => String(p.id) === String(id));
            return child ? child.name : null;
        })
        .filter(Boolean);

    // Get parents
    const father = person.relations?.father
        ? familyData.find(p => String(p.id) === String(person.relations.father))
        : null;
    const mother = person.relations?.mother
        ? familyData.find(p => String(p.id) === String(person.relations.mother))
        : null;

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
                    </tbody>
                </table>
            </section>

            {/* Family */}
            <section className="print-section">
                <h2>Family</h2>
                <table className="print-table">
                    <tbody>
                        {father && (
                            <tr>
                                <td className="print-label">Father:</td>
                                <td>{father.name}</td>
                            </tr>
                        )}
                        {mother && (
                            <tr>
                                <td className="print-label">Mother:</td>
                                <td>{mother.name}</td>
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

            {/* Footer */}
            <footer className="print-footer">
                <p>Generated from Kinship Chronicles • {new Date().toLocaleDateString()}</p>
            </footer>
        </div>
    );
}
