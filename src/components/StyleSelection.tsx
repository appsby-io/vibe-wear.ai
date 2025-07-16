import React from 'react';
import StyleHalftoneBrutalism from '../assets/style_halftone_brutalism.jpg';
import StyleComic from '../assets/style_comic copy.jpg';
import StyleWatercolor from '../assets/style_watercolor copy.jpg';
import StyleBlackAndWhite from '../assets/style_black_and_white.jpg';
// import StyleBotanical from '../assets/style_botanical.jpg';
import StyleVintageStamp from '../assets/style_stemp.jpg';
import StyleCartoonAvatar from '../assets/style_cartoon_avatar.jpg';
import StyleChildrensBook from '../assets/style_childrens_book.jpg';
import StyleGrunge from '../assets/style_grunge.jpg';
import StyleRealistic from '../assets/style_realistic.jpg';
import StyleStencil from '../assets/style_stencil.jpg';
import StyleY2KChrome from '../assets/style_y2k-chrome.jpg';
import StyleGraffiti from '../assets/style_graffiti.jpg';
import StyleGraffiti2 from '../assets/style_graffiti_2.jpg';
import StyleInspirationalQuote from '../assets/style_inspirational_quote.jpg';
import StyleKawaii from '../assets/style_kawaii.jpg';

interface Style {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
}

interface StyleSelectionProps {
  selectedStyle: string | null;
  onStyleSelect: (styleId: string) => void;
}

export const StyleSelection: React.FC<StyleSelectionProps> = ({
  selectedStyle,
  onStyleSelect,
}) => {
  const styles: Style[] = [
    // New order as specified
    {
      id: 'graffiti',
      name: 'Graffiti',
      description: 'Bold street art vibes',
      previewUrl: StyleGraffiti,
    },
    {
      id: 'graffiti-2',
      name: 'Graffiti 2',
      description: 'Tag-style electric blue script',
      previewUrl: StyleGraffiti2,
    },
    {
      id: 'y2k-chrome',
      name: 'Y2K Chrome',
      description: 'Chrome liquid bubble letters',
      previewUrl: StyleY2KChrome,
    },
    {
      id: 'inspirational-quote',
      name: 'Inspirational Quote',
      description: 'Hand-lettered typography',
      previewUrl: StyleInspirationalQuote,
    },
    {
      id: 'kawaii-skull',
      name: 'Kawaii Skull',
      description: 'Cute skull with sprinkles',
      previewUrl: StyleKawaii,
    },
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Photorealistic style',
      previewUrl: StyleRealistic,
    },
    {
      id: 'black-and-white',
      name: 'Black & White',
      description: 'Classic monochrome style',
      previewUrl: StyleBlackAndWhite,
    },
    {
      id: 'halftone-brutalism',
      name: 'Halftone Brutalism',
      description: 'Black & yellow editorial style',
      previewUrl: StyleHalftoneBrutalism,
    },
    {
      id: 'vector-stencil',
      name: 'Vector Stencil',
      description: 'High contrast stencil art',
      previewUrl: StyleStencil,
    },
    {
      id: 'grunge',
      name: 'Grunge',
      description: 'Raw rock poster style',
      previewUrl: StyleGrunge,
    },
    // {
    //   id: 'botanical',
    //   name: 'Botanical',
    //   description: 'Hand-drawn botanical art',
    //   previewUrl: StyleBotanical,
    // },
    {
      id: 'vintage-stamp',
      name: 'Vintage Stamp',
      description: 'Retro 70s badge style',
      previewUrl: StyleVintageStamp,
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      description: 'Soft artistic watercolor style',
      previewUrl: StyleWatercolor,
    },
    {
      id: 'comic',
      name: 'Comic',
      description: 'Pop art comic book style',
      previewUrl: StyleComic,
    },
    {
      id: 'cartoon-avatar',
      name: 'Cartoon Avatar',
      description: '3D cartoon character style',
      previewUrl: StyleCartoonAvatar,
    },
    {
      id: 'childrens-book',
      name: "Children's Book",
      description: 'Whimsical storybook style',
      previewUrl: StyleChildrensBook,
    },
  ];

  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-source-sans">
            Choose from prebuilt styles
          </h2>
        </div>

        {/* Centered container with max width for the cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 max-w-4xl" style={{ gap: '16px 16px', rowGap: '24px' }}>
            {styles.map((style) => (
              <div key={style.id} className="flex flex-col items-center">
                <button
                  onClick={() => onStyleSelect(style.id)}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                    selectedStyle === style.id
                      ? 'ring-4 ring-vibrant-pink shadow-xl'
                      : ''
                  }`}
                  style={{ width: '116px', height: '116px' }}
                >
                  <img
                    src={style.previewUrl}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-vibrant-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <div className="mt-3 text-center">
                  <h3 className="font-bold text-sm text-black font-source-sans">{style.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};