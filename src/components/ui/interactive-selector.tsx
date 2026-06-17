import React, { useState, useEffect } from 'react';
import { Tent, Flame, Droplet, Bath, Compass } from 'lucide-react';

const InteractiveSelector = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);
  
  const options = [
    {
      title: "Luxury Tent",
      description: "Cozy glamping under the stars",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      icon: <Tent className="h-5 w-5 text-white" />
    },
    {
      title: "Campfire Feast",
      description: "Gourmet s'mores & stories",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      icon: <Flame className="h-5 w-5 text-white" />
    },
    {
      title: "Lakeside Retreat",
      description: "Private dock & canoe rides",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      icon: <Droplet className="h-5 w-5 text-white" />
    },
    {
      title: "Mountain Spa",
      description: "Outdoor sauna & hot tub",
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
      icon: <Bath className="h-5 w-5 text-white" />
    },
    {
      title: "Guided Adventure",
      description: "Expert-led nature tours",
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
      icon: <Compass className="h-5 w-5 text-white" />
    }
  ];

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] bg-slate-950 rounded-3xl p-6 font-sans text-white border border-slate-800 overflow-hidden"> 
      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mt-4 mb-2 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg animate-fadeInTop">Escape in Style</h1>
        <p className="text-sm md:text-base text-gray-300 font-medium max-w-xl mx-auto">Discover luxurious camping experiences in nature’s most breathtaking spots.</p>
      </div>

      <div className="h-6"></div>

      {/* Options Container */}
      <div className="options flex w-full max-w-[900px] h-[380px] mx-0 items-stretch overflow-hidden relative">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '60px',
              minHeight: '100px',
              margin: 0,
              borderRadius: '16px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? '#10b981' : 'transparent',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index 
                ? '0 20px 60px rgba(0,0,0,0.50)' 
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '5 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              willChange: 'flex-grow, box-shadow'
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Shadow effect */}
            <div 
              className="shadow absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out bg-gradient-to-t from-black/90 via-black/30 to-transparent"
              style={{
                opacity: activeIndex === index ? 1 : 0.4
              }}
            ></div>
            
            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-4 flex items-center justify-start h-12 z-20 pointer-events-none px-3 gap-2 w-full">
              <div className="icon min-w-[36px] max-w-[36px] h-[36px] flex items-center justify-center rounded-full bg-black/70 backdrop-blur-md shadow-md border border-white/20 flex-shrink-0 flex-grow-0">
                {option.icon}
              </div>
              <div className="info text-white whitespace-nowrap overflow-hidden">
                <div 
                  className="main font-bold text-sm transition-all duration-75 ease-in-out"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(15px)'
                  }}
                >
                  {option.title}
                </div>
                <div 
                  className="sub text-[11px] text-gray-300 transition-all duration-75 ease-in-out truncate"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(15px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveSelector;
