import { Scale, ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { SignInModal } from "./SignInModal";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Define navigation history
  const navigationMap: Record<string, string> = {
    '/upload': '/',
    '/analyze': '/upload',
    '/results': '/upload',
    '/heatmap': '/results',
    '/gaps': '/results',
    '/memo': '/gaps',
  };

  const showBackButton = location.pathname in navigationMap;
  const showAddFilesButton = location.pathname !== '/' && location.pathname !== '/upload';

  const handleBack = () => {
    const previousPath = navigationMap[location.pathname];
    if (previousPath) {
      navigate(previousPath);
    }
  };

  const handleAddFiles = () => {
    navigate('/upload');
  };

  return (
    <>
      <header className="bg-[#0a1628] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Scale className="w-6 h-6" />
            <span className="font-semibold text-lg">Proximate AI</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {showAddFilesButton && (
            <button
              onClick={handleAddFiles}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              aria-label="Add more files"
            >
              <Plus className="w-4 h-4" />
              Add Files
            </button>
          )}
          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="text-sm hover:text-gray-300 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
