import { GuessItem } from '@/types/guess';

export interface LibraryPack {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  items: Omit<GuessItem, 'id' | 'revealed'>[];
}

export const GUESS_LIBRARIES: LibraryPack[] = [
  {
    id: 'tech-giants',
    name: 'Tech & Apps',
    icon: '💻',
    category: 'Technology',
    description: 'Iconic technology companies, social networks, and software apps.',
    items: [
      {
        name: 'Apple',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        hint: 'Founded by Steve Jobs & Steve Wozniak in Cupertino, California',
        category: 'Tech & Apps',
      },
      {
        name: 'Google',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        hint: 'World\'s most used search engine and creator of Android',
        category: 'Tech & Apps',
      },
      {
        name: 'Microsoft',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
        hint: 'Creators of Windows OS, Xbox, and Office',
        category: 'Tech & Apps',
      },
      {
        name: 'Spotify',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
        hint: 'Swedish music and podcast audio streaming platform',
        category: 'Tech & Apps',
      },
      {
        name: 'Netflix',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_N_logo.svg',
        hint: 'Iconic red "N" streaming giant with "Tudum" sound',
        category: 'Tech & Apps',
      },
      {
        name: 'Instagram',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
        hint: 'Photo & Reel sharing app with a camera gradient icon',
        category: 'Tech & Apps',
      },
      {
        name: 'YouTube',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
        hint: 'Red play button video platform',
        category: 'Tech & Apps',
      },
      {
        name: 'Amazon',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        hint: 'From A to Z with an orange smile arrow',
        category: 'Tech & Apps',
      },
      {
        name: 'GitHub',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
        hint: 'The beloved Octocat home for developers and code',
        category: 'Tech & Apps',
      },
      {
        name: 'Discord',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Discord_Logo_2021.svg',
        hint: 'Clyde mascot chat platform popular among gamers and communities',
        category: 'Tech & Apps',
      },
    ],
  },
  {
    id: 'global-brands',
    name: 'Global Mega Brands',
    icon: '🌐',
    category: 'Brands',
    description: 'Instantly recognizable consumer brands, snacks, and retail.',
    items: [
      {
        name: 'Nike',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
        hint: '"Just Do It" swoosh athletic footwear and apparel',
        category: 'Global Brands',
      },
      {
        name: 'McDonald\'s',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg',
        hint: 'The iconic Golden Arches fast-food franchise',
        category: 'Global Brands',
      },
      {
        name: 'Coca-Cola',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
        hint: 'Classic script red soda brand created in 1886',
        category: 'Global Brands',
      },
      {
        name: 'Starbucks',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
        hint: 'Twin-tailed Siren mermaid green coffee logo',
        category: 'Global Brands',
      },
      {
        name: 'Pepsi',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Pepsi_logo_2014.svg',
        hint: 'Red, white, and blue globe wave soda',
        category: 'Global Brands',
      },
      {
        name: 'Adidas',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
        hint: 'Three stripes German sportswear company',
        category: 'Global Brands',
      },
      {
        name: 'Target',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg',
        hint: 'Red bullseye retail department store chain',
        category: 'Global Brands',
      },
      {
        name: 'LEGO',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg',
        hint: 'Danish colorful interlocking plastic toy bricks',
        category: 'Global Brands',
      },
      {
        name: 'IKEA',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg',
        hint: 'Swedish blue and yellow ready-to-assemble furniture brand',
        category: 'Global Brands',
      },
      {
        name: 'Red Bull',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/RedBullEnergyDrink.svg',
        hint: '"Gives You Wings" energy drink with two charging red bulls',
        category: 'Global Brands',
      },
    ],
  },
  {
    id: 'automotive',
    name: 'Car & Auto Emblems',
    icon: '🏎️',
    category: 'Automotive',
    description: 'Prestige car makers, supercars, and automotive crests.',
    items: [
      {
        name: 'Tesla',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
        hint: 'Futuristic cross-section of an electric motor "T"',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Ferrari',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d1/Ferrari-Logo.svg',
        hint: 'The Prancing Horse (Cavallino Rampante) from Maranello, Italy',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Mercedes-Benz',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
        hint: 'Three-pointed star representing land, sea, and air mobility',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'BMW',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
        hint: 'Bavarian blue and white roundel propeller design',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Porsche',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Porsche_logo.svg',
        hint: 'Stuttgart coat-of-arms crest with black horse and antlers',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Audi',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
        hint: 'Four interlocking rings representing Auto Union merger',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Lamborghini',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg',
        hint: 'Golden charging bull on black shield',
        category: 'Car & Auto Emblems',
      },
      {
        name: 'Toyota',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Toyota.svg',
        hint: 'Three overlapping ovals forming a "T" and steering wheel',
        category: 'Car & Auto Emblems',
      },
    ],
  },
  {
    id: 'gaming-consoles',
    name: 'Gaming & Entertainment',
    icon: '🎮',
    category: 'Gaming',
    description: 'Gaming titans, consoles, and beloved game studios.',
    items: [
      {
        name: 'PlayStation',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg',
        hint: 'Sony\'s upright P with rainbow shadow S',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Xbox',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_%282019%29.svg',
        hint: 'Glowing green circular "X" sphere console',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Nintendo',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg',
        hint: 'Racetrack capsule logo of Mario and Zelda creators',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Steam',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
        hint: 'Valve\'s digital PC gaming locomotive piston logo',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Twitch',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg',
        hint: 'Purple chat bubble with robotic eyes mascot',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Epic Games',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg',
        hint: 'Creators of Fortnite and Unreal Engine',
        category: 'Gaming & Entertainment',
      },
      {
        name: 'Pokémon',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg',
        hint: '"Gotta Catch \'Em All!" worldwide monster franchise',
        category: 'Gaming & Entertainment',
      },
    ],
  },
  {
    id: 'famous-landmarks',
    name: 'Famous World Landmarks',
    icon: '🏛️',
    category: 'Pictures & Landmarks',
    description: 'Iconic world wonders and historical monuments to guess from photos.',
    items: [
      {
        name: 'Eiffel Tower',
        imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
        hint: 'Wrought-iron lattice tower on the Champ de Mars in Paris, France',
        category: 'Landmarks',
      },
      {
        name: 'Statue of Liberty',
        imageUrl: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=800&q=80',
        hint: 'Neoclassical copper statue on Liberty Island in New York Harbor',
        category: 'Landmarks',
      },
      {
        name: 'Taj Mahal',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        hint: 'Ivory-white marble mausoleum on the Yamuna river in Agra, India',
        category: 'Landmarks',
      },
      {
        name: 'Colosseum',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
        hint: 'Ancient amphitheatre in the centre of Rome, Italy',
        category: 'Landmarks',
      },
      {
        name: 'Great Pyramids of Giza',
        imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
        hint: 'Oldest of the Seven Wonders of the Ancient World in Egypt',
        category: 'Landmarks',
      },
      {
        name: 'Big Ben',
        imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80',
        hint: 'Great Bell of the Great Clock of Westminster in London, UK',
        category: 'Landmarks',
      },
    ],
  },
];
