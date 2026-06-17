import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Share, PlusSquare, ArrowBigDownDash, Monitor, CheckCircle, Apple, Chrome } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstall: () => Promise<boolean>;
}

export default function InstallPromptModal({ isOpen, onClose, isInstallable, onInstall }: InstallPromptModalProps) {
  const [activePlatform, setActivePlatform] = React.useState<'android' | 'ios' | 'desktop'>('ios');
  const [testingInstall, setTestingInstall] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Auto-detect user agent on load to switch to their platform
  React.useEffect(() => {
    if (isOpen) {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActivePlatform('ios');
      } else if (/android/.test(ua)) {
        setActivePlatform('android');
      } else {
        setActivePlatform('desktop');
      }
    }
  }, [isOpen]);

  const handleNativeInstall = async () => {
    setTestingInstall(true);
    const result = await onInstall();
    setTestingInstall(false);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-450">
                <ArrowBigDownDash className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                  Download Mobile & Desktop App
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Access the club portal directly from your home screen
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5">
            {isInstallable ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 mb-5">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">
                  Your device supports direct installation!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                  Add the Web and App Development Club portal as an installable standalone application instantly.
                </p>
                <button
                  onClick={handleNativeInstall}
                  disabled={testingInstall || success}
                  className="bg-black hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-5 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  {success ? 'Installed!' : testingInstall ? 'Installing...' : 'Install App Now'}
                </button>
              </div>
            ) : null}

            {/* Platform selection Tabs */}
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 font-mono">
              Setup Guide By Platform
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl mb-5">
              <button
                onClick={() => setActivePlatform('ios')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                iOS (Apple)
              </button>
              <button
                onClick={() => setActivePlatform('android')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'android'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Android
              </button>
              <button
                onClick={() => setActivePlatform('desktop')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'desktop'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
            </div>

            {/* Tab contents */}
            <div className="space-y-4">
              {activePlatform === 'ios' && (
                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">1</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Open this website in your standard <strong className="font-semibold text-slate-800 dark:text-white">Safari Browser</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                      <Share className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Tap the <strong className="font-semibold text-slate-800 dark:text-white">Share</strong> button at the bottom navigation panel.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Scroll down of the option menu and select <strong className="font-semibold text-slate-800 dark:text-white">Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activePlatform === 'android' && (
                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">1</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Open this page on your Android using <strong className="font-semibold text-slate-800 dark:text-white">Google Chrome</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">2</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Tap Chrome's menu icon (<strong className="font-semibold text-slate-800 dark:text-white">three dots ⋮</strong>) at the top right header.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">3</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Select <strong className="font-semibold text-slate-800 dark:text-white">Add to Home screen</strong> or <strong className="font-semibold text-slate-800 dark:text-white">Install app</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activePlatform === 'desktop' && (
                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">1</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      On your browser's address bar (Chrome, Edge or Brave), look at the right side.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                      <Chrome className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Click the <strong className="font-semibold text-slate-800 dark:text-white">Install Icon</strong> (represented as a computer screen with dynamic down-arrow).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">3</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      Confirm the dialog to place a beautiful standalone app link in your applications dock.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer branding */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider">
              PWA STANDARD TECHNOLOGY • OFFLINE CAPABLE
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
