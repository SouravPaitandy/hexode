import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Code2, Users, Terminal, Globe, Layout, Github,
    ArrowRight, Sparkles, ChevronRight, Zap, Cloud, Cpu, Server, CheckCircle,
    Star
} from 'lucide-react';

// ... imports
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 700], [0, 100]);
    const opacity = useTransform(scrollY, [0, 350, 700], [0.3, 1, 0]);

    const [typedText, setTypedText] = useState("");
    const fullText = "print('Hello, Reviewer!')";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.slice(0, i + 1));
            i++;
            if (i > fullText.length) {
                i = 0; 
                setTimeout(() => setTypedText(""), 2000); 
            }
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-blue-500/30">
            
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-surface/70 backdrop-blur-xl supports-backdrop-filter:bg-surface/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <Code2 size={20} className="text-gray-200" />
                        </div>
                        <span>Hexode</span>
                    </div>
                    
                    <div className="hidden md:flex gap-8 text-sm font-medium text-muted">
                        {['Architecture', 'Features', 'Source'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="hover:text-foreground transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/dashboard" className="bg-white dark:bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 hidden md:block">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border mb-8 text-xs font-medium text-muted hover:bg-card transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        v1.0 Public Beta
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.1]">
                        <span className="inline-block bg-clip-text text-transparent bg-linear-to-b from-[#0f172a] via-[#0f172a] to-[#64748b] dark:from-white dark:via-white dark:to-white/50 pb-2">
                            Collaborative IDE
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                             Hexode
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        A high-performance cloud code editor featuring <span className="text-foreground font-medium">real-time sync</span>, 
                        virtual file systems, and instant <span className="text-foreground font-medium">polyglot execution</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
                        <Link to="/dashboard" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-gray-300 rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                            Start Coding Now
                        </Link>
                        <a href="https://github.com/souravpaitandy/dev-dock" target="_blank" className="px-8 py-3.5 bg-surface border border-border text-muted hover:text-foreground hover:bg-card rounded-xl font-medium text-base shadow-lg shadow-black/5 dark:shadow-black/50 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                            <Star size={18} fill='yellow' className="text-yellow-500"/> Star us on <Github size={18} />
                        </a>
                    </div>
                </motion.div>

                {/* Mock IDE Interface */}
                <motion.div 
                    style={{ y: y1, opacity }}
                    className="relative max-w-5xl mx-auto rounded-xl border border-border bg-surface/50 backdrop-blur-sm shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden"
                >
                    {/* Window Controls */}
                    <div className="h-10 bg-surface/80 border-b border-border flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="flex-1 text-center text-xs text-muted font-mono">Hexode - Untitled Project</div>
                    </div>

                    <div className="flex h-[400px] md:h-[500px] text-left">
                        {/* Mock Sidebar */}
                        <div className="hidden md:block w-64 border-r border-border p-4 space-y-3 bg-card/30">
                            <div className="flex items-center gap-2 text-muted text-sm">
                                <Terminal size={14} /> <span>index.js</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted text-sm">
                                <Layout size={14} /> <span>style.css</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-2 py-1.5 rounded text-sm border border-emerald-500/20">
                                <Code2 size={14} /> <span>demo.py</span>
                            </div>
                        </div>

                        {/* Code Area */}
                        <div className="flex-1 p-6 font-mono text-sm md:text-base text-foreground bg-background/50">
                            <div className="text-purple-400">def <span className="text-yellow-200">main</span>():</div>
                            <div className="pl-6 text-emerald-600/80 italic"># Your code runs instantly</div>
                            <div className="pl-6">{typedText}<span className="animate-pulse text-blue-400">|</span></div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Architecture / Tech Stack */}
            <section id="architecture" className="py-20 border-y border-border bg-surface/30">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-sm font-bold tracking-widest text-muted uppercase mb-10">Powered by Modern Primitives</p>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10 opacity-70">
                        {['React 18+', 'Node.js', 'Y.js CRDT', 'Vite', 'Monaco', 'MongoDB'].map((tech) => (
                            <div key={tech} className="flex items-center gap-2 text-muted font-medium">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></div>
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Code Like a <span className="text-blue-500">Pro</span>.</h2>
                    <p className="text-muted text-lg">Engineering excellence built into every pixel.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Collab (Large) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 p-8 rounded-3xl bg-card/30 border border-border hover:border-blue-500/30 transition-colors relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                                <Users size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">CRDT Multi-User Sync</h3>
                            <p className="text-muted max-w-md leading-relaxed">
                                State synchronization powered by <strong>Y.js</strong> and WebSockets. 
                                Millisecond-latency updates ensuring every keystroke is shared instantly without conflicts.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 2: Polyglot (Vertical) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:row-span-2 p-8 rounded-3xl bg-card/30 border border-border hover:border-emerald-500/30 transition-colors relative overflow-hidden group"
                    >
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                                <Terminal size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Polyglot Sandbox</h3>
                            <p className="text-muted mb-8 flex-1">
                                Secure remote code execution supporting standard input/output.
                            </p>
                            <div className="space-y-3">
                                {[
                                    { l: 'Python 3', c: 'text-yellow-400', bg: 'bg-yellow-400/10' }, 
                                    { l: 'Node.js', c: 'text-green-400', bg: 'bg-green-400/10' }, 
                                    { l: 'C++', c: 'text-blue-400', bg: 'bg-blue-400/10' }, 
                                    { l: 'Java', c: 'text-red-400', bg: 'bg-red-400/10' }
                                ].map((fw) => (
                                    <div key={fw.l} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className={`w-2 h-2 rounded-full ${fw.c} ${fw.bg} shadow-[0_0_8px_currentColor]`}></div>
                                        <span className="font-mono text-sm">{fw.l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: File System */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-card/30 border border-border hover:border-pink-500/30 transition-colors"
                    >
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 text-pink-400">
                            <Layout size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Virtual File System</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            In-memory file tree synced across all connected clients. Create, edit, and reorganize files on the fly.
                        </p>
                    </motion.div>

                    {/* Card 4: Architecture */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-card/30 border border-border hover:border-amber-500/30 transition-colors"
                    >
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 text-amber-400">
                            <Cloud size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Edge Ready</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Designed to be lightweight. The heavy lifting happens in the browser, while the server coordinates the dance.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/10 via-transparent to-transparent"></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to build something?</h2>
                    <p className="text-xl text-muted mb-10">
                        Join the session and experience the future of collaborative coding.
                    </p>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-foreground text-background rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                        Launch Editor
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="rounded-t-[2.5rem] md:rounded-none border-t border-border bg-surface md:bg-background text-muted text-sm -mt-8 md:mt-0 relative z-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-foreground font-semibold">Hexode</span>
                            <span>© {new Date().getFullYear()}</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="https://github.com/souravpaitandy/" className="hover:text-foreground transition-colors">GitHub</a>
                            <a href="https://x.com/PaitandySourav" className="hover:text-foreground transition-colors">Twitter</a>
                            <a href="https://github.com/souravpaitandy/dev-dock/blob/main/LICENSE" className="hover:text-foreground transition-colors">License</a>
                        </div>
                    </div>
                    
                    <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
                        <p>An open-source project. Contributions are welcome!</p>
                        <p>
                            Developed by <a href="https://www.souravpaitandy.me" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">Sourav Paitandy</a> with Grit and Passion for developers
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
