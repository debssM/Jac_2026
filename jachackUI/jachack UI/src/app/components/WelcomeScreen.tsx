import { useNavigate } from "react-router";
import { Scale, Sparkles, FileSearch, Target, TrendingUp, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SignInModal } from "./SignInModal";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0a1628] flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between text-white">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Scale className="w-6 h-6" />
            <span className="font-semibold text-lg">Proximate AI</span>
          </button>
          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="text-sm hover:text-gray-300 transition-colors"
          >
            Sign In
          </button>
        </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Legal Intelligence
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Proximate AI
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your intelligent copilot for analyzing False Claims Act cases. Upload your evidence,
              and let AI help you build a stronger case.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white">
              <div className="bg-teal-500/20 rounded-lg p-3 w-fit mb-4">
                <FileSearch className="w-6 h-6 text-teal-300" />
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Analysis</h3>
              <p className="text-gray-300 text-sm">
                AI examines your evidence and identifies key FCA elements automatically
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white">
              <div className="bg-purple-500/20 rounded-lg p-3 w-fit mb-4">
                <Target className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="font-bold text-lg mb-2">Gap Detection</h3>
              <p className="text-gray-300 text-sm">
                Discover weaknesses in your case and get actionable recommendations
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white">
              <div className="bg-blue-500/20 rounded-lg p-3 w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="font-bold text-lg mb-2">Case Strength</h3>
              <p className="text-gray-300 text-sm">
                Get a comprehensive assessment with damage calculations and evidence mapping
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mx-auto mb-3">
                  1
                </div>
                <p className="text-gray-300 text-sm">Upload your case documents & evidence</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mx-auto mb-3">
                  2
                </div>
                <p className="text-gray-300 text-sm">AI analyzes FCA elements & damages</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mx-auto mb-3">
                  3
                </div>
                <p className="text-gray-300 text-sm">Review evidence heatmaps & gaps</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mx-auto mb-3">
                  4
                </div>
                <p className="text-gray-300 text-sm">Generate comprehensive case memo</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => navigate("/upload")}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-3 shadow-lg"
            >
              Get Started — Upload Evidence
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-400 text-sm mt-4">
              No credit card required • Secure & confidential
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-6">
        © 2026 Proximate AI. Built for legal professionals who value precision.
      </footer>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
