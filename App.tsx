
import React, { useState, useCallback, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { WandIcon, DownloadIcon } from './components/icons';
import { analyzeAssets, generateCompositeImage } from './services/geminiService';
import { translations } from './utils/translations';
import type { ImageFile, Language, AssetType, AssetMap, AspectRatio } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ru'); // Default to RU as per persona
  const t = translations[lang];

  // State for all uploaded assets
  const [assets, setAssets] = useState<AssetMap>({});
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(t.statusIdle);
  const [error, setError] = useState<string | null>(null);
  
  // New Aspect Ratio State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'ru' : 'en');

  // Generic handler for any asset upload
  const handleAssetUpload = useCallback((type: AssetType, image: ImageFile) => {
    setAssets(prev => ({ ...prev, [type]: image }));
    setGeneratedImage(null);
    setError(null);
    setStatus(t.statusReadyToAnalyze);
  }, [t]);

  const handleAssetRemove = useCallback((type: AssetType) => {
    setAssets(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
    });
    // If we removed the last asset/face, reset status
    setError(null);
  }, []);

  // Check if we have minimum requirements (Face + at least one other asset)
  const canAnalyze = useMemo(() => {
    const hasFace = !!assets.face;
    const hasOtherAsset = Object.keys(assets).some(k => k !== 'face' && assets[k as AssetType]);
    return hasFace && hasOtherAsset;
  }, [assets]);

  const canGenerate = useMemo(() => {
    return !!assets.face && !!extractedPrompt && !isProcessing;
  }, [assets.face, extractedPrompt, isProcessing]);

  // Step 1: Analyze inputs to create prompt
  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    
    setIsProcessing(true);
    setStatus(t.statusAnalyzing);
    setError(null);

    try {
      const prompt = await analyzeAssets(assets, lang);
      setExtractedPrompt(prompt);
      setStatus(t.statusAnalyzed);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`${t.errorAnalyze}: ${msg}`);
      setStatus(t.systemStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Render final image
  const handleGenerate = async () => {
    if (!canGenerate || !assets.face) return;

    setIsProcessing(true);
    setGeneratedImage(null);
    setStatus(t.statusRendering);
    setError(null);

    try {
      // Pass ALL assets to the generation service for high fidelity
      const compositeImage = await generateCompositeImage(assets, extractedPrompt, aspectRatio);
      setGeneratedImage(`data:image/jpeg;base64,${compositeImage}`);
      setStatus(t.statusSuccess);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`${t.errorRender}: ${msg}`);
      setStatus(t.systemStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedPrompt(e.target.value);
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `valhalla-fusion-${aspectRatio}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to render asset slots
  const renderAssetSlot = (type: AssetType) => (
    <ImageUploader 
      key={type}
      title={t.assetLabels[type]} 
      labels={t.uploader} 
      onImageUpload={(img) => handleAssetUpload(type, img)}
      onRemove={assets[type] ? () => handleAssetRemove(type) : undefined}
      className={type === 'face' ? 'border-indigo-500/50 bg-indigo-900/10' : ''}
    />
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 mb-2">
              {t.title}
            </h1>
            <p className="text-md text-slate-400 tracking-wide">
              {t.subtitle}
            </p>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-500 transition-colors text-sm font-semibold"
          >
            <span className={lang === 'en' ? 'text-cyan-400' : 'text-slate-500'}>EN</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className={lang === 'ru' ? 'text-cyan-400' : 'text-slate-500'}>RU</span>
          </button>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Primary Input: Face */}
            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 ml-1 tracking-wider">Step 1: Identity</h3>
               <div className="grid grid-cols-1 gap-4">
                  {renderAssetSlot('face')}
               </div>
            </div>

            {/* Secondary Inputs: Assets Grid */}
            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 ml-1 tracking-wider">Step 2: Scene & Assets (Fill any)</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {renderAssetSlot('style')}
                  {renderAssetSlot('clothing')}
                  {renderAssetSlot('shoes')}
                  {renderAssetSlot('accessories')}
                  {renderAssetSlot('hairstyle')}
               </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 shadow-lg">
                <div className="flex-1 text-center sm:text-left">
                   <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1">{t.systemStatus}</p>
                   <p className={`text-md font-medium ${error ? 'text-red-400' : 'text-slate-200'}`}>
                     {error || status}
                   </p>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isProcessing}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                >
                  {t.analyzeBtn}
                </button>
            </div>

            {/* Prompt Editor */}
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 relative">
                <label htmlFor="prompt-editor" className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">
                  {t.promptLabel}
                </label>
                <textarea
                  id="prompt-editor"
                  value={extractedPrompt}
                  onChange={handlePromptChange}
                  placeholder={lang === 'en' ? "Prompt will appear here after analysis..." : "Здесь появится описание после анализа..."}
                  className="w-full h-32 bg-slate-900/80 rounded-lg p-3 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none border border-slate-700 font-mono leading-relaxed"
                />
            </div>
          </div>

          {/* RIGHT COLUMN: Output */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 h-full flex flex-col">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 ml-1 tracking-wider">Step 3: Render</h3>
               
               {/* Aspect Ratio Selector */}
               <div className="mb-4">
                 <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 block">
                    {t.ratioLabel}
                 </label>
                 <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    disabled={isProcessing}
                 >
                    <option value="9:16">{t.aspectRatios['9:16']}</option>
                    <option value="1:1">{t.aspectRatios['1:1']}</option>
                    <option value="16:9">{t.aspectRatios['16:9']}</option>
                    <option value="3:4">{t.aspectRatios['3:4']}</option>
                    <option value="4:3">{t.aspectRatios['4:3']}</option>
                 </select>
               </div>

               <div className="flex-grow flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-700 p-4 relative overflow-hidden min-h-[400px]">
                {isProcessing && !generatedImage ? (
                   <div className="flex flex-col items-center text-center z-10 animate-pulse">
                      <Spinner />
                      <p className="mt-4 text-cyan-400 font-medium">{status}</p>
                   </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full group flex items-center justify-center">
                      <img src={generatedImage} alt="Generated composite" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                      <button
                          onClick={handleDownload}
                          className="absolute top-4 right-4 bg-slate-900/90 p-3 rounded-full text-white hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-xl"
                          title={t.download}
                      >
                          <DownloadIcon className="w-6 h-6" />
                      </button>
                  </div>
                ) : (
                  <div className="text-center z-10 opacity-50">
                    <WandIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">{t.resultPlaceholder}</p>
                  </div>
                )}
              </div>

              <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
               >
                  {t.renderBtn}
               </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;
