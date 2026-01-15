import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * PrintBiography - A print-optimized biography layout
 * Designed for clean PDF generation and physical printing
 */
export default function PrintBiography({ person, familyData, relationship }) {
    if (!person) return null;

    // Extract data
    const bornDate = person.vital_stats?.born_date || 'Unknown';
    const bornPlace = person.vital_stats?.born_place || '';
    const diedDate = person.vital_stats?.died_date || 'Unknown';
    const diedPlace = person.vital_stats?.died_place || '';
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

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    /* Hide everything except print content */
                    body * {
                        visibility: hidden;
                    }
                    .print-biography,
                    .print-biography * {
                        visibility: visible;
                    }
                    .print-biography {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }

                .print-biography {
                    max-width: 8.5in;
                    margin: 0 auto;
                    padding: 0.5in;
                    font-family: Georgia, serif;
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #000;
                    background: white;
                }

                .print-header {
                    text-align: center;
                    margin-bottom: 1.5em;
                    border-bottom: 2px solid #000;
                    padding-bottom: 0.5em;
                }

                .print-header h1 {
                    font-size: 24pt;
                    font-weight: bold;
                    margin: 0 0 0.25em 0;
                    color: #000;
                }

                .print-relationship {
                    font-size: 10pt;
                    font-style: italic;
                    color: #666;
                    margin: 0.25em 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .print-dates {
                    font-size: 12pt;
                    font-weight: bold;
                    margin: 0.5em 0 0 0;
                }

                .print-section {
                    margin: 1.5em 0;
                    page-break-inside: avoid;
                }

                .print-section h2 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin: 0 0 0.5em 0;
                    color: #000;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 0.25em;
                }

                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .print-table td {
                    padding: 0.25em 0.5em;
                    vertical-align: top;
                }

                .print-label {
                    font-weight: bold;
                    width: 25%;
                    color: #333;
                }

                .print-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5em;
                }

                .print-tag {
                    display: inline-block;
                    padding: 0.25em 0.75em;
                    border: 1px solid #000;
                    border-radius: 3px;
                    font-size: 9pt;
                    font-weight: bold;
                }

                .print-biography-text {
                    page-break-before: auto;
                }

                .print-markdown {
                    font-size: 11pt;
                    line-height: 1.7;
                }

                .print-markdown p {
                    margin: 0.75em 0;
                }

                .print-markdown strong {
                    font-weight: bold;
                }

                .print-markdown em {
                    font-style: italic;
                }

                .print-voyage {
                    margin: 0.75em 0;
                    padding-left: 1em;
                }

                .print-footer {
                    margin-top: 2em;
                    padding-top: 0.5em;
                    border-top: 1px solid #ccc;
                    font-size: 9pt;
                    text-align: center;
                    color: #666;
                }

                @media print {
                    .print-biography {
                        padding: 0;
                        max-width: none;
                    }

                    .print-header {
                        margin-bottom: 1em;
                    }

                    .print-section {
                        margin: 1em 0;
                    }

                    /* Prevent page breaks inside sections */
                    .print-section,
                    .print-voyage {
                        page-break-inside: avoid;
                    }

                    /* Allow page break before biography if needed */
                    .print-biography-text {
                        page-break-before: auto;
                    }
                }
            `}</style>
        </div>
    );
}
