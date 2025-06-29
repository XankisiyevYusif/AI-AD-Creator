import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Download, 
  Copy, 
  Maximize, 
  Zap, 
  Check, 
  Palette, 
  Type, 
  Ratio, 
  Wand2,
  Lightbulb,
  Sliders,
  Layers,
  Bookmark,
  Star,
  ArrowRight,
  Trash2,
  Save
} from 'lucide-react';
import { fal } from './utils/fal';

// Define aspect ratio options
const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)", description: "Perfect for profile pictures and Instagram posts" },
  { value: "16:9", label: "Landscape (16:9)", description: "Ideal for YouTube thumbnails and banners" },
  { value: "9:16", label: "Portrait (9:16)", description: "Great for Stories and TikTok" },
  { value: "4:3", label: "Standard (4:3)", description: "Classic format for presentations" },
  { value: "3:2", label: "Photo (3:2)", description: "Traditional photography ratio" },
  { value: "2:3", label: "Tall (2:3)", description: "Good for Pinterest and posters" },
  { value: "16:10", label: "Widescreen (16:10)", description: "Common laptop screen ratio" },
  { value: "3:1", label: "Panorama (3:1)", description: "Wide banner for websites" },
  { value: "1:3", label: "Vertical (1:3)", description: "Tall format for side banners" },
];

// Define style options
const STYLE_OPTIONS = [
  { value: "auto", label: "Auto", description: "Let AI choose the best style", icon: <Sparkles className="w-3 h-3" /> },
  { value: "general", label: "General", description: "Balanced, versatile style", icon: <Star className="w-3 h-3" /> },
  { value: "realistic", label: "Realistic", description: "Photorealistic imagery", icon: <ImageIcon className="w-3 h-3" /> },
  { value: "design", label: "Design", description: "Graphic design aesthetic", icon: <Layers className="w-3 h-3" /> },
  { value: "render_3D", label: "3D Render", description: "3D rendered visuals", icon: <Sliders className="w-3 h-3" /> },
  { value: "anime", label: "Anime", description: "Japanese anime style", icon: <Bookmark className="w-3 h-3" /> },
];

// Example prompts for inspiration
const EXAMPLE_PROMPTS = [
  "A sleek smartphone floating in a minimalist living room, soft lighting, product advertisement",
  "Vibrant fitness tracker on a wrist during a morning jog, sunrise background, lifestyle ad",
  "Elegant perfume bottle on a marble surface with soft pink roses, luxury brand advertisement",
  "Eco-friendly reusable coffee cup with a modern design, held by a hand in a busy cafe",
  "Futuristic electric car on a coastal highway at sunset, dramatic lighting, automotive ad",
  "Stylish headphones with vibrant colors against a geometric background, youth-oriented ad",
  "Organic skincare products arranged with natural elements like leaves and flowers, wellness ad",
  "Modern smartwatch displaying fitness stats, worn by athlete in motion, dynamic lighting",
];

// Common negative prompts
const COMMON_NEGATIVE_PROMPTS = [
  "blurry, low quality, distorted text, pixelated",
  "watermarks, signatures, ugly, deformed, mutated",
  "oversaturated, overexposed, bad anatomy, disfigured",
  "low resolution, poorly rendered text, amateur",
  "cropped image, bad framing, out of frame elements",
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('auto');
  const [expandPrompt, setExpandPrompt] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string[]>([]);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showNegativePrompts, setShowNegativePrompts] = useState(false);
  const [savedImages, setSavedImages] = useState<{url: string, prompt: string, aspectRatio: string, style: string}[]>([]);
  const [showSavedImages, setShowSavedImages] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);
    setRequestId(null);
    setGenerationProgress([]);
    
    try {
      console.log("Generating image with Ideogram v2...");
      console.log("Prompt:", prompt);
      console.log("Aspect Ratio:", aspectRatio);
      console.log("Style:", style);
      
      const result = await fal.subscribe("fal-ai/ideogram/v2", {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          style: style,
          expand_prompt: expandPrompt,
          negative_prompt: negativePrompt || undefined,
          seed: seed || undefined
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            const messages = update.logs.map(log => log.message);
            console.log("Progress:", messages);
            setGenerationProgress(messages);
          }
        },
      });
      
      console.log("Generation complete:", result);
      
      if (result.images && result.images.length > 0) {
        setGeneratedImage(result.images[0].url);
        setRequestId(result.requestId);
      } else {
        throw new Error("No images were generated");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError('Failed to generate image. Please try again with a different prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setNegativePrompt('');
    setAspectRatio('1:1');
    setStyle('auto');
    setExpandPrompt(true);
    setSeed(null);
    setGeneratedImage(null);
    setError('');
    setRequestId(null);
    setGenerationProgress([]);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handleClearSeed = () => {
    setSeed(null);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ad-creative-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFullSize = () => {
    if (generatedImage) {
      window.open(generatedImage, '_blank');
    }
  };

  const handleUseExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  };

  const handleUseNegativePrompt = (negPrompt: string) => {
    setNegativePrompt(negPrompt);
    setShowNegativePrompts(false);
  };

  const handleSaveImage = () => {
    if (generatedImage) {
      const newSavedImage = {
        url: generatedImage,
        prompt: prompt,
        aspectRatio: aspectRatio,
        style: style
      };
      setSavedImages([...savedImages, newSavedImage]);
    }
  };

  const handleDeleteSavedImage = (index: number) => {
    const updatedSavedImages = [...savedImages];
    updatedSavedImages.splice(index, 1);
    setSavedImages(updatedSavedImages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/70 border-b border-purple-500/20 shadow-lg">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                VisualForge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowSavedImages(!showSavedImages)}
                className="flex items-center text-sm bg-slate-800/70 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
              >
                <Bookmark className="w-4 h-4 mr-1.5" />
                {savedImages.length > 0 ? `Saved (${savedImages.length})` : "Saved"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Saved Images Panel */}
        {showSavedImages && savedImages.length > 0 && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Bookmark className="w-5 h-5 mr-2 text-purple-400" />
                Saved Creatives
              </h2>
              <button 
                onClick={() => setShowSavedImages(false)}
                className="text-sm text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {savedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img.url} 
                    alt={`Saved creative ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
                    <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-300">{img.aspectRatio}</span>
                      <button 
                        onClick={() => handleDeleteSavedImage(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Panel - Takes 2 columns */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Type className="w-5 h-5 mr-2 text-blue-400" />
              Create Your Ad
            </h2>
            
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                <span>Describe your ad creative</span>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {showExamples ? 'Hide examples' : 'Show examples'}
                </button>
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700/70 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="E.g., A sleek smartphone floating in a minimalist living room, soft lighting, product advertisement"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  onClick={handleCopyPrompt}
                  className="absolute bottom-2 right-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  title="Copy prompt"
                >
                  {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-400">
                  {prompt.length} characters
                </span>
              </div>
              
              {/* Example Prompts */}
              {showExamples && (
                <div className="mt-3 bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                  <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1 text-yellow-400" />
                    Example Prompts
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {EXAMPLE_PROMPTS.map((example, index) => (
                      <div 
                        key={index}
                        className="text-xs bg-slate-700/70 p-2 rounded-md cursor-pointer hover:bg-slate-600/70 transition-colors flex items-center"
                        onClick={() => handleUseExample(example)}
                      >
                        <span className="flex-1">{example}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400 flex-shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Negative Prompt */}
            <div className="mb-6">
              <label htmlFor="negativePrompt" className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                <span>Negative Prompt (Optional)</span>
                <button
                  onClick={() => setShowNegativePrompts(!showNegativePrompts)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {showNegativePrompts ? 'Hide suggestions' : 'Show suggestions'}
                </button>
              </label>
              <textarea
                id="negativePrompt"
                rows={2}
                className="w-full px-3 py-2 bg-slate-700/70 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Elements you want to avoid in the image"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Specify elements you don't want in your image
              </p>
              
              {/* Negative Prompt Suggestions */}
              {showNegativePrompts && (
                <div className="mt-3 bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Common Negative Prompts</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {COMMON_NEGATIVE_PROMPTS.map((negPrompt, index) => (
                      <div 
                        key={index}
                        className="text-xs bg-slate-700/70 p-2 rounded-md cursor-pointer hover:bg-slate-600/70 transition-colors flex items-center"
                        onClick={() => handleUseNegativePrompt(negPrompt)}
                      >
                        <span className="flex-1">{negPrompt}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400 flex-shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Options Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-slate-300 flex items-center">
                  <Wand2 className="w-4 h-4 mr-2 text-purple-400" />
                  Generation Options
                </h3>
                <div className="flex items-center">
                  <input
                    id="expandPrompt"
                    type="checkbox"
                    checked={expandPrompt}
                    onChange={(e) => setExpandPrompt(e.target.checked)}
                    className="w-4 h-4 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="expandPrompt" className="ml-2 text-xs text-slate-300">
                    Enhance prompt with AI
                  </label>
                </div>
              </div>
              
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Ratio className="w-4 h-4 mr-1 text-blue-400" />
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.slice(0, 6).map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                        aspectRatio === ratio.value
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
                      }`}
                      title={ratio.description}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Palette className="w-4 h-4 mr-1 text-pink-400" />
                  Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_OPTIONS.map((styleOption) => (
                    <button
                      key={styleOption.value}
                      onClick={() => setStyle(styleOption.value)}
                      className={`py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center ${
                        style === styleOption.value
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
                      }`}
                      title={styleOption.description}
                    >
                      <span className="mr-1">{styleOption.icon}</span>
                      {styleOption.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Seed Control */}
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                <div className="flex items-center">
                  <label htmlFor="seed" className="text-sm text-slate-300 mr-2 flex items-center">
                    <Sliders className="w-3 h-3 mr-1" />
                    Seed:
                  </label>
                  <input
                    id="seed"
                    type="number"
                    value={seed === null ? '' : seed}
                    onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Random"
                    className="w-24 px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleRandomSeed}
                    className="ml-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded transition-colors"
                    title="Generate random seed"
                  >
                    Random
                  </button>
                  <button
                    onClick={handleClearSeed}
                    className="ml-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded transition-colors"
                    title="Clear seed (use AI-selected seed)"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Use the same seed to create variations with consistent elements
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Ad Creative
                  </>
                )}
              </button>
              
              <button
                onClick={resetForm}
                disabled={isGenerating}
                className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Reset all settings"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm mt-4 p-3 bg-red-900/30 rounded-lg border border-red-800/50">
                {error}
              </div>
            )}
          </div>
          
          {/* Output Panel - Takes 3 columns */}
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-green-400" />
                Generated Ad Creative
              </h2>
              
              {generatedImage && (
                <button
                  onClick={handleSaveImage}
                  className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Save className="w-4 h-4 mr-1.5 text-purple-400" />
                  Save Creative
                </button>
              )}
            </div>
            
            <div className="bg-slate-900/70 rounded-xl overflow-hidden border border-slate-700/50">
              {generatedImage ? (
                <div className="relative group">
                  <img 
                    ref={imageRef}
                    src={generatedImage} 
                    alt="Generated ad creative" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={handleOpenFullSize}
                        className="bg-slate-800/90 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors backdrop-blur-sm"
                      >
                        <Maximize className="w-4 h-4 mr-2" />
                        View Full Size
                      </button>
                      <button
                        onClick={handleDownloadImage}
                        className="bg-purple-600/90 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-16">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-blue-500 animate-spin animation-delay-150"></div>
                        <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin animation-delay-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <p className="text-slate-300 font-medium">Creating your ad...</p>
                      {generationProgress.length > 0 && (
                        <div className="mt-4 max-w-xs mx-auto">
                          <div className="text-xs text-slate-400 text-left bg-slate-800/70 p-3 rounded-lg max-h-24 overflow-y-auto custom-scrollbar border border-slate-700/50">
                            {generationProgress.map((message, index) => (
                              <p key={index} className="mb-1 flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-1.5 flex-shrink-0"></span>
                                {message}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">Your ad creative will appear here</p>
                      <p className="text-slate-500 text-sm mt-2">Enter a prompt and click Generate</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {generatedImage && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
                    <Type className="w-4 h-4 mr-1.5 text-purple-400" />
                    Prompt Used
                  </h3>
                  <p className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded max-h-20 overflow-y-auto custom-scrollbar">
                    {prompt}
                  </p>
                </div>
                
                <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
                    <Sliders className="w-4 h-4 mr-1.5 text-blue-400" />
                    Generation Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="text-slate-400">Aspect Ratio:</div>
                    <div className="text-slate-300 font-medium">{aspectRatio}</div>
                    <div className="text-slate-400">Style:</div>
                    <div className="text-slate-300 font-medium">{style}</div>
                    <div className="text-slate-400">Seed:</div>
                    <div className="text-slate-300 font-medium">{seed === null ? 'Auto-generated' : seed}</div>
                    <div className="text-slate-400">AI Enhancement:</div>
                    <div className="text-slate-300 font-medium">{expandPrompt ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-800/20">
              <h3 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1.5 text-yellow-400" />
                Pro Tips
              </h3>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>Be specific about the product, setting, lighting, and mood in your prompt</li>
                <li>Use style options to match your brand's aesthetic</li>
                <li>Save the seed number when you get a result you like to create variations</li>
                <li>Use negative prompts to avoid unwanted elements in your image</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-8 px-4 text-center text-slate-500 border-t border-slate-800 mt-8">
        <p className="text-sm">VisualForge © 2025 - Professional AI-powered advertising image generator</p>
      </footer>
      
      {/* Custom Scrollbar Styles */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}

export default App;