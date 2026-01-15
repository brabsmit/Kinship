import React from 'react';
import { X, Heart, BookOpen, Users, Sparkles, Code } from 'lucide-react';

/**
 * AboutPage - Dedication and project information
 * A beautiful overlay that honors the original researcher and tells the story
 */
export default function AboutPage({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <h1 className="text-3xl font-display font-bold">About This Project</h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-all"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm italic">
                        Transforming genealogy into living history
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    {/* Dedication Section */}
                    <section className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl p-6 border border-rose-100">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-rose-100 p-3 rounded-full shrink-0">
                                <Heart size={24} className="text-rose-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                    Dedicated to [Researcher Name]
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    This project is built upon the tireless work of <strong>[Researcher Name]</strong>,
                                    who spent [X years] meticulously researching, documenting, and preserving our family's
                                    history. Their dedication to uncovering the stories of our ancestors has created
                                    a treasure trove of knowledge that connects us across generations.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16">
                            <p className="text-gray-600 text-sm italic">
                                "Every name represents a life lived, a story told, and a legacy passed down.
                                This work ensures that none of them are forgotten."
                            </p>
                        </div>
                    </section>

                    {/* The Story Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-display font-bold text-gray-900">The Story</h2>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                            <p>
                                Genealogy research often lives in Word documents and spreadsheets—valuable data,
                                but disconnected from the rich context of history. This project transforms that
                                research into an <strong>immersive, narrative experience</strong>.
                            </p>
                            <p>
                                Rather than just seeing "John Smith, b. 1823, d. 1891," you can now explore:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>What presidents were in office during their lifetime</li>
                                <li>What technologies were invented while they lived</li>
                                <li>What historical events shaped their world</li>
                                <li>How they connected to larger historical narratives</li>
                                <li>Where they lived and traveled on interactive maps</li>
                            </ul>
                            <p>
                                This platform bridges the gap between <em>data</em> and <em>story</em>, turning
                                genealogy from a record-keeping exercise into a journey through time.
                            </p>
                        </div>
                    </section>

                    {/* The Vision Section */}
                    <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Sparkles size={20} className="text-purple-600" />
                            </div>
                            <h2 className="text-xl font-display font-bold text-gray-900">The Vision</h2>
                        </div>
                        <div className="text-gray-700 space-y-3">
                            <p>
                                This project aims to create a <strong>family legacy system</strong>—not just
                                software, but a living, breathing record of who we are and where we came from.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-2">For the Researcher</h3>
                                    <p className="text-sm text-gray-600">
                                        A richer canvas to present discoveries, with AI-assisted research
                                        suggestions and data quality tools.
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-2">For the Family</h3>
                                    <p className="text-sm text-gray-600">
                                        An accessible, engaging way to explore heritage, discover connections,
                                        and share stories across generations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Highlight */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <Sparkles size={20} className="text-amber-600" />
                            </div>
                            <h2 className="text-xl font-display font-bold text-gray-900">Key Features</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { title: "Immersive Profiles", desc: "Magazine-style biographies with historical context" },
                                { title: "Narrative Threads", desc: "Explore themes: Mayflower Pilgrims, Westward Pioneers, etc." },
                                { title: "Interactive Maps", desc: "See where ancestors lived, traveled, and immigrated" },
                                { title: "Timeline Integration", desc: "Personal events merged with world history" },
                                { title: "AI Research Assistant", desc: "Suggestions for next steps in genealogy research" },
                                { title: "Shareable Links", desc: "Share specific ancestors or stories with family" }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <h3 className="font-bold text-sm text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-xs text-gray-600">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Credits Section */}
                    <section className="border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <Code size={20} className="text-slate-600" />
                            </div>
                            <h2 className="text-xl font-display font-bold text-gray-900">Credits & Acknowledgments</h2>
                        </div>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>
                                <strong>Research:</strong> [Researcher Name] — Original genealogy research and documentation
                            </p>
                            <p>
                                <strong>Development:</strong> Built with React, Vite, Tailwind CSS, React Flow, and Leaflet
                            </p>
                            <p>
                                <strong>Historical Data:</strong> Presidential timeline, technology context, and historical events
                            </p>
                            <p>
                                <strong>Map Images:</strong> Wikimedia Commons historical maps
                            </p>
                            <p>
                                <strong>AI Features:</strong> Google Gemini API for research suggestions
                            </p>
                            <p className="pt-2 italic text-gray-500">
                                This is a personal family project, created with love to preserve and celebrate our shared heritage.
                            </p>
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] rounded-xl p-6 text-white text-center">
                        <h2 className="text-2xl font-display font-bold mb-2">Explore Your Heritage</h2>
                        <p className="text-white/80 mb-4">
                            Dive into the stories, discover connections, and celebrate the lives that led to yours.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-white text-[#2C3E50] px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                            Start Exploring
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
