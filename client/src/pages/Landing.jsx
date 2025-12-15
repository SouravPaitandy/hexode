import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Cpu, Users, Zap, Terminal, Globe, Layout, Shield, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ background: "#0f0f12", minHeight: "100vh", color: "white", fontFamily: "'Inter', sans-serif", overflowX: "hidden", position: "relative" }}>
      
      {/* Background Grid Pattern */}
      <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0,
          backgroundImage: "linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)",
          backgroundSize: "60px 60px", opacity: 0.15, maskImage: "linear-gradient(to bottom, white 20%, transparent 90%)"
      }}></div>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 50px", backdropFilter: "blur(12px)", background: "rgba(22, 22, 26, 0.7)", position: "fixed", top: 0, zIndex: 100, width: "100%", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1.5rem", fontWeight: "bold", zIndex: 10 }}>
          <motion.div 
            whileHover={{ rotate: 10 }}
            style={{ background: "linear-gradient(135deg, #007acc, #00d4ff)", padding: "10px", borderRadius: "10px", display: "flex", boxShadow: "0 4px 20px rgba(0, 122, 204, 0.3)" }}
          >
             <Code2 size={22} color="white" />
          </motion.div>
          <span>DevDock</span>
        </div>
        <div style={{ display: "flex", gap: "30px", alignItems: "center", fontSize: "0.95rem" }}>
           {/* Links */}
           <div style={{ display: "flex", gap: "20px" }}>
               {['Features', 'How it Works', 'Community'].map(item => (
                   <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ color: "#8892b0", textDecoration: "none", fontWeight: "500", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "white"} onMouseOut={e => e.target.style.color = "#8892b0"}>{item}</a>
               ))}
           </div>
           
           <div style={{ width: "1px", height: "24px", background: "#333" }}></div>

           <a href="https://github.com" target="_blank" style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", textDecoration: "none" }}>
               <Github size={20} />
               <span style={{ fontSize: "0.9rem", color: "#8892b0" }}>Star on GitHub</span>
           </a>

           <Link to="/dashboard" style={{ padding: "10px 24px", background: "#007acc", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "600", transition: "all 0.2s", boxShadow: "0 0 15px rgba(0, 122, 204, 0.2)" }} onMouseOver={e => e.target.style.transform = "translateY(-1px)"} onMouseOut={e => e.target.style.transform = "translateY(0)"}>
               Launch IDE
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "140px 50px 80px", textAlign: "center", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
                <span style={{ padding: "8px 16px", background: "rgba(0, 122, 204, 0.08)", color: "#00d4ff", borderRadius: "30px", fontSize: "0.9rem", fontWeight: "600", border: "1px solid rgba(0, 122, 204, 0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "block", width: "8px", height: "8px", background: "#00d4ff", borderRadius: "50%", boxShadow: "0 0 10px #00d4ff" }}></span> 
                    V1.0 Public Beta is Live
                </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} style={{ fontSize: "5rem", fontWeight: "800", lineHeight: "1.1", marginBottom: "30px", letterSpacing: "-2px" }}>
              Code Together. <br />
              <span style={{ background: "linear-gradient(90deg, #fff 20%, #8892b0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ship Automatically.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} style={{ fontSize: "1.3rem", color: "#8892b0", maxWidth: "650px", margin: "0 auto 40px", lineHeight: "1.6" }}>
              The collaborative cloud IDE that feels local. Spin up ephemeral environments in <span style={{color: "white"}}>milliseconds</span>.
            </motion.p>
    
            <motion.div variants={itemVariants} style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                 <Link to="/dashboard" style={{ padding: "18px 48px", background: "white", color: "black", textDecoration: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem", border: "1px solid white", transition: "all 0.2s", boxShadow: "0 0 40px rgba(255,255,255,0.1)" }}>Start Coding Free</Link>
                 <a href="https://github.com" target="_blank" style={{ padding: "18px 48px", background: "transparent", border: "1px solid #333", color: "white", textDecoration: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem", backdropFilter: "blur(5px)" }}>View Documentation</a>
            </motion.div>
        </motion.div>
      </section>

      {/* Trusted By Strip */}
      <section style={{ padding: "40px 0", borderTop: "1px solid #222", borderBottom: "1px solid #222", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(5px)", marginBottom: "80px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
              <p style={{ color: "#666", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "25px" }}>Trusted by developers from</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "60px", color: "#444", fontWeight: "bold", fontSize: "1.5rem", flexWrap: "wrap", opacity: 0.7 }}>
                  {['ACME Corp', 'Globex', 'Soylent', 'Umbrella', 'Stark Ind'].map(name => (
                      <span key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                         <Globe size={20} /> {name}
                      </span>
                  ))}
              </div>
          </div>
      </section>

      {/* Mock IDE Visual */}
      <section style={{ maxWidth: "1000px", margin: "0 auto 100px", padding: "0 20px" }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ borderRadius: "15px", border: "1px solid #333", overflow: "hidden", boxShadow: "0 20px 80px rgba(0,0,0,0.5)", background: "#1e1e1e" }}
          >
              <div style={{ height: "40px", background: "#252526", display: "flex", alignItems: "center", gap: "8px", padding: "0 15px", borderBottom: "1px solid #333" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }}></div>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }}></div>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }}></div>
                  <div style={{ marginLeft: "20px", color: "#8892b0", fontSize: "0.8rem", fontFamily: "monospace" }}>main.py - DevDock</div>
              </div>
              <div style={{ padding: "30px", fontFamily: "'Fira Code', monospace", fontSize: "1.1rem", color: "#e0e0e0", display: "flex" }}>
                  <div style={{ color: "#444", userSelect: "none", marginRight: "20px" }}>
                      1<br/>2<br/>3<br/>4<br/>5
                  </div>
                  <div>
                      <span style={{ color: "#c586c0" }}>def</span> <span style={{ color: "#dcdcaa" }}>fibonacci</span>(n):<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#c586c0" }}>if</span> n {"<="} 1: <span style={{ color: "#c586c0" }}>return</span> n<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#c586c0" }}>return</span> <span style={{ color: "#dcdcaa" }}>fibonacci</span>(n-1) + <span style={{ color: "#dcdcaa" }}>fibonacci</span>(n-2)<br/>
                      <br/>
                      <span style={{ color: "#6a9955" }}># Your code runs instantly here 🚀</span>
                  </div>
              </div>
          </motion.div>
      </section>

      {/* Stats/Badges */}
      <section style={{ borderTop: "1px solid #222", borderBottom: "1px solid #222", padding: "40px 0", background: "#16161a" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "40px", textAlign: "center" }}>
              <div><h3 style={{ fontSize: "2.5rem", fontWeight: "800", color: "white" }}>0ms</h3><p style={{ color: "#8892b0" }}>Typing Latency</p></div>
              <div><h3 style={{ fontSize: "2.5rem", fontWeight: "800", color: "white" }}>4+</h3><p style={{ color: "#8892b0" }}>Languages Supported</p></div>
              <div><h3 style={{ fontSize: "2.5rem", fontWeight: "800", color: "white" }}>100%</h3><p style={{ color: "#8892b0" }}>Browser Based</p></div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: "100px 50px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px" }}>Everything you need.</h2>
            <p style={{ color: "#8892b0", fontSize: "1.2rem" }}>Not just an editor. A complete platform.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            {[
                { icon: <Users size={40} color="#007acc" />, title: "Real-Time Collab", desc: "Code with your team as if you're on the same computer. See cursors and edits live." },
                { icon: <Globe size={40} color="#ffaa00" />, title: "Cloud Execution", desc: "Run heavy computations in the cloud. No need to install Python or Java locally." },
                { icon: <Shield size={40} color="#ff00ff" />, title: "Secure Sandboxes", desc: "Each project runs in an isolated ephemeral environment. Safe and disposable." },
                { icon: <Terminal size={40} color="#00ff00" />, title: "Integrated Terminal", desc: "Get instant feedback from your code execution. Full standardized output." },
                { icon: <Layout size={40} color="#00d4ff" />, title: "Project Management", desc: "Organize your work into projects. Persisted locally for your convenience." },
                { icon: <Code2 size={40} color="#ff5f56" />, title: "Intelligent Editor", desc: "Powered by Monaco (VS Code). Syntax highlighting, formatting, and more." },
            ].map((feature, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ y: -5, borderColor: "#333" }}
                    style={{ padding: "40px", background: "#111", borderRadius: "16px", border: "1px solid #222", transition: "all 0.2s" }}
                >
                    <div style={{ marginBottom: "25px", background: "rgba(255,255,255,0.03)", width: "fit-content", padding: "15px", borderRadius: "12px" }}>{feature.icon}</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px" }}>{feature.title}</h3>
                    <p style={{ color: "#8892b0", lineHeight: "1.6", fontSize: "1.05rem" }}>{feature.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: "100px 20px", textAlign: "center", background: "linear-gradient(180deg, #0f0f12 0%, #001e3c 100%)" }}>
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
              <h2 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "30px" }}>Ready to ship?</h2>
              <Link to="/dashboard" style={{ padding: "20px 60px", background: "#007acc", color: "white", textDecoration: "none", borderRadius: "50px", fontWeight: "bold", fontSize: "1.3rem", boxShadow: "0 10px 40px rgba(0, 122, 204, 0.5)" }}>
                  Start Building Now
              </Link>
          </motion.div>
      </section>

      {/* Multi-Column Footer */}
      <footer style={{ padding: "80px 50px 40px", borderTop: "1px solid #222", background: "#0d0d10", fontSize: "0.9rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "60px", marginBottom: "60px" }}>
              
              {/* Brand Column */}
              <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "20px" }}>
                      <div style={{ background: "linear-gradient(135deg, #007acc, #00d4ff)", padding: "8px", borderRadius: "8px" }}>
                         <Code2 size={24} color="white" />
                      </div>
                      <span>DevDock</span>
                  </div>
                  <p style={{ color: "#8892b0", lineHeight: "1.6", maxWidth: "300px" }}>
                      The world's most advanced cloud development environment. Built for teams who ship fast.
                  </p>
                  <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                      <a href="#" style={{ color: "#666", transition: "color 0.2s" }}><Twitter size={20} /></a>
                      <a href="#" style={{ color: "#666", transition: "color 0.2s" }}><Github size={20} /></a>
                      <a href="#" style={{ color: "#666", transition: "color 0.2s" }}><Linkedin size={20} /></a>
                  </div>
              </div>

              {/* Links Column 1 */}
              <div>
                  <h4 style={{ color: "white", marginBottom: "20px", fontSize: "1rem" }}>Product</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#8892b0" }}>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Features</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Integrations</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Changelog</a></li>
                  </ul>
              </div>

              {/* Links Column 2 */}
              <div>
                  <h4 style={{ color: "white", marginBottom: "20px", fontSize: "1rem" }}>Resources</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#8892b0" }}>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Documentation</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>API Reference</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Community</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Blog</a></li>
                  </ul>
              </div>

              {/* Links Column 3 */}
              <div>
                  <h4 style={{ color: "white", marginBottom: "20px", fontSize: "1rem" }}>Company</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#8892b0" }}>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>About</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Careers</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Legal</a></li>
                      <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Contact</a></li>
                  </ul>
              </div>
          </div>

          <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "30px", borderTop: "1px solid #222", display: "flex", justifyContent: "space-between", color: "#444" }}>
              <div>© 2024 DevDock Inc. All rights reserved.</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>Made with <Heart size={14} fill="#ae1f1f" color="#ae1f1f" /> by Sourabh</div>
          </div>
      </footer>
    </div>
  );
};

export default Landing;
