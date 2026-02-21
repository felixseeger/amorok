import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPosts, getPageBySlug } from '../lib/wp';

interface DynamicContentProps {
    slug?: string; // If provided, fetches specific page. Otherwise lists recent posts.
}

export const DynamicContent: React.FC<DynamicContentProps> = ({ slug }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (slug) {
                    const page = await getPageBySlug(slug);
                    setData(page);
                } else {
                    const posts = await getPosts();
                    setData(posts);
                }
            } catch (err) {
                setError('Failed to load content');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) return <div className="text-center py-20 opacity-50">Loading content...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!data) return null;

    // Single Page View
    if (slug && !Array.isArray(data)) {
        return (
            <section className="py-20 px-12 md:px-24 bg-white text-black">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: data.title.rendered }} />
                    <div className="prose prose-lg prose-headings:font-bold prose-headings:uppercase prose-p:font-light prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: data.content.rendered }} />
                </motion.div>
            </section>
        );
    }

    // List View (Posts)
    return (
        <section className="py-20 px-12 md:px-24 bg-[#111] text-white">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold mb-12 uppercase tracking-[0.3em] border-b border-white/20 pb-4">Latest Updates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {Array.isArray(data) && data.map((post: any) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <h4 className="text-xl font-bold mb-4 group-hover:text-white/70 transition-colors uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                            <div className="text-white/40 text-sm line-clamp-3 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
