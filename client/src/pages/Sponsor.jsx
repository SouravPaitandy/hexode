import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coffee, Heart, CheckCircle } from "lucide-react";
import SEO from "../components/SEO";
import ThemeToggle from "../components/ThemeToggle";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";

const Sponsor = () => {
  const { isSignedIn } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground font-sans relative flex flex-col overflow-x-hidden">
      <SEO
        title="Sponsor Hexode"
        description="Support the open-source development of Hexode IDE."
        noindex={true}
      />

      {/* Futuristic Background Gradients (matching Dashboard) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        {/* Additional amber glow for Sponsor page */}
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* Header (matching Dashboard) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-b border-border flex justify-between items-center glass-panel shadow-md">
        <a href="/">
          <div className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <img src="logo.png" alt="</>" className="w-9 h-9" />
            Hexode
          </div>
        </a>
        <div className="flex gap-5 items-center">
          <Link
            to="/docs"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden md:block"
          >
            Docs
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-sm cursor-pointer font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            <span className="hidden md:inline">Back</span>
          </button>
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-32 pb-20">
        <div className="max-w-2xl w-full flex flex-col items-center text-center mb-16">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-8 ring-1 ring-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Heart size={40} className="animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Support{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500">
              Hexode
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto leading-relaxed">
            Hexode is an open-source project. Your sponsorship pays for the
            servers, AI limits, and keeps the platform free for developers
            worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* UPI Section */}
          <div className="glass-panel p-8 md:p-10 rounded-3xl border border-border/50 relative overflow-hidden group hover:border-amber-500/30 transition-colors shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3 relative z-10">
              <Coffee size={28} className="text-amber-500" />
              UPI Payment
            </h2>
            <p className="text-muted mb-10 relative z-10">
              Scan the QR code with any UPI app (GPay, PhonePe, Paytm, Navi
              etc.)
            </p>

            <div className="flex flex-col items-center justify-center relative z-10">
              {/* QR Code */}
              <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl ring-4 ring-amber-500/10 p-3 transform transition-transform hover:scale-105 duration-300">
                <img
                  src="/NaviQR_SOURAV PAITANDY_Kotak_Mahindra.png"
                  alt="UPI QR Code"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="w-full max-w-[280px] bg-surface/80 backdrop-blur border border-border rounded-2xl p-5 text-center shadow-inner">
                <p className="text-xs text-muted mb-2 uppercase tracking-widest font-semibold">
                  UPI ID
                </p>
                <p className="font-mono text-xl font-medium tracking-wide text-foreground select-all cursor-text">
                  paitandysourav@nyes
                </p>
              </div>
            </div>
          </div>

          {/* Why Sponsor Section */}
          <div className="flex flex-col justify-center gap-8 p-6 md:p-10 glass-panel rounded-3xl border border-border/50">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                Why your support matters
              </h3>
              <ul className="space-y-6">
                {[
                  "Keeps the Playground environment fast and highly available",
                  "Increases the daily AI execution limits for all users",
                  "Pays for database and cloud execution engine hosting",
                  "Supports the continued development of new Hexode features",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-muted group/item"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500/20 transition-colors">
                      <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                    <span className="leading-relaxed text-base group-hover/item:text-foreground transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-6 bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[50px] -mr-16 -mt-16"></div>
              <p className="text-base text-blue-800/90 dark:text-blue-200/90 italic relative z-10 leading-relaxed font-medium">
                "Every contribution, no matter how small, makes a huge
                difference in keeping open-source projects alive and accessible.
                Thank you!"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sponsor;
