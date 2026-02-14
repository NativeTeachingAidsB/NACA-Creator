import type { NACACommunity, NACACommunityProfile, NACADictionary, NACAMediaFile, NACAFolderNode, NACADropboxBrowseResponse } from './naca-api';

export const MOCK_COMMUNITIES: NACACommunity[] = [
  {
    id: '76ef3e19-69d6-44ea-8163-1c7d653e0181',
    name: 'Piegan Institute',
    slug: 'piegan',
    description: 'Blackfoot language preservation and revitalization',
    logoUrl: '/api/naca-media/communities/piegan/logo.png'
  },
  {
    id: '94267867-1987-45ab-a2a3-1d97daa53006',
    name: 'Little Bird Press',
    slug: 'littlebird',
    description: 'Indigenous language learning resources and publications',
    logoUrl: '/api/naca-media/communities/littlebird/logo.png'
  },
  {
    id: 'haida',
    name: 'Haida Nation',
    slug: 'haida',
    description: 'X̲aad Kíl - Language of the Haida people',
    logoUrl: '/api/naca-media/communities/haida/logo.png'
  },
  {
    id: 'tlingit',
    name: 'Tlingit',
    slug: 'tlingit',
    description: 'Lingít Yoo X̱ʼatángi - Tlingit language resources',
    logoUrl: '/api/naca-media/communities/tlingit/logo.png'
  },
  {
    id: 'tsimshian',
    name: 'Tsimshian',
    slug: 'tsimshian',
    description: 'Sm\'algyax - Tsimshian language materials',
    logoUrl: '/api/naca-media/communities/tsimshian/logo.png'
  },
  {
    id: 'demo',
    name: 'Demo Community',
    slug: 'demo',
    description: 'Sample community for testing and development',
    logoUrl: undefined
  }
];

export const MOCK_DICTIONARIES: Record<string, NACADictionary[]> = {
  '76ef3e19-69d6-44ea-8163-1c7d653e0181': [
    {
      id: 'piegan-basic',
      communityId: '76ef3e19-69d6-44ea-8163-1c7d653e0181',
      name: 'Blackfoot Basics',
      description: 'Common Blackfoot words and phrases',
      entries: [
        { id: 'p1', indigenousWord: "Oki", englishTranslation: 'Hello', category: 'greetings' },
        { id: 'p2', indigenousWord: "Áísttamaapi", englishTranslation: 'Thank you', category: 'greetings' },
        { id: 'p3', indigenousWord: 'Sokápi', englishTranslation: 'Good/Fine', category: 'phrases' },
        { id: 'p4', indigenousWord: 'Niitáítapiiysin', englishTranslation: 'I am Blackfoot', category: 'identity' },
        { id: 'p5', indigenousWord: 'Ponoká', englishTranslation: 'Horse', category: 'animals' },
      ]
    }
  ],
  '94267867-1987-45ab-a2a3-1d97daa53006': [
    {
      id: 'littlebird-vocab',
      communityId: '94267867-1987-45ab-a2a3-1d97daa53006',
      name: 'Little Bird Vocabulary',
      description: 'Language learning vocabulary from Little Bird Press',
      entries: [
        { id: 'lb1', indigenousWord: "Wóčheyakiya", englishTranslation: 'Teacher', category: 'education' },
        { id: 'lb2', indigenousWord: 'Wówapi', englishTranslation: 'Book', category: 'education' },
        { id: 'lb3', indigenousWord: 'Wóonspe', englishTranslation: 'Lesson', category: 'education' },
      ]
    }
  ],
  'haida': [
    {
      id: 'haida-basic',
      communityId: 'haida',
      name: 'Basic Vocabulary',
      description: 'Common words and phrases',
      entries: [
        { id: '1', indigenousWord: "Háw'aa", englishTranslation: 'Thank you', category: 'greetings' },
        { id: '2', indigenousWord: 'Dang gyáa.gang', englishTranslation: 'Hello', category: 'greetings' },
        { id: '3', indigenousWord: 'Kúunaas', englishTranslation: 'Goodbye', category: 'greetings' },
        { id: '4', indigenousWord: "Ts'aanu", englishTranslation: 'Moon', category: 'nature' },
        { id: '5', indigenousWord: 'Gangaang', englishTranslation: 'Sun', category: 'nature' },
      ]
    },
    {
      id: 'haida-animals',
      communityId: 'haida',
      name: 'Animals',
      description: 'Names of animals in Haida',
      entries: [
        { id: '6', indigenousWord: 'Ts\'ak', englishTranslation: 'Eagle', category: 'birds' },
        { id: '7', indigenousWord: 'X̲uuya', englishTranslation: 'Raven', category: 'birds' },
        { id: '8', indigenousWord: 'Skaana', englishTranslation: 'Orca', category: 'marine' },
        { id: '9', indigenousWord: 'Cháanuud', englishTranslation: 'Salmon', category: 'fish' },
      ]
    }
  ],
  'tlingit': [
    {
      id: 'tlingit-basic',
      communityId: 'tlingit',
      name: 'Basic Tlingit',
      description: 'Essential Tlingit vocabulary',
      entries: [
        { id: '10', indigenousWord: 'Gunalchéesh', englishTranslation: 'Thank you', category: 'greetings' },
        { id: '11', indigenousWord: 'Yak\'éi', englishTranslation: 'Good/It is good', category: 'phrases' },
        { id: '12', indigenousWord: 'Ax̱ éesh', englishTranslation: 'My father', category: 'family' },
      ]
    }
  ],
  'demo': [
    {
      id: 'demo-words',
      communityId: 'demo',
      name: 'Demo Dictionary',
      description: 'Sample vocabulary for testing',
      entries: [
        { id: '20', indigenousWord: 'sample_word', englishTranslation: 'Sample translation', category: 'test' },
        { id: '21', indigenousWord: 'test_entry', englishTranslation: 'Test entry translation', category: 'test' },
      ]
    }
  ]
};

export const MOCK_MEDIA: Record<string, NACAMediaFile[]> = {
  '76ef3e19-69d6-44ea-8163-1c7d653e0181': [
    { id: 'pm1', url: '/assets/piegan/audio/oki.mp3', filename: 'oki.mp3', type: 'audio', communityId: '76ef3e19-69d6-44ea-8163-1c7d653e0181' },
    { id: 'pm2', url: '/assets/piegan/images/blackfoot_art.jpg', filename: 'blackfoot_art.jpg', type: 'image', communityId: '76ef3e19-69d6-44ea-8163-1c7d653e0181' },
    { id: 'pm3', url: '/assets/piegan/images/buffalo.jpg', filename: 'buffalo.jpg', type: 'image', communityId: '76ef3e19-69d6-44ea-8163-1c7d653e0181' },
  ],
  '94267867-1987-45ab-a2a3-1d97daa53006': [
    { id: 'lm1', url: '/assets/littlebird/audio/lesson1.mp3', filename: 'lesson1.mp3', type: 'audio', communityId: '94267867-1987-45ab-a2a3-1d97daa53006' },
    { id: 'lm2', url: '/assets/littlebird/images/book_cover.jpg', filename: 'book_cover.jpg', type: 'image', communityId: '94267867-1987-45ab-a2a3-1d97daa53006' },
  ],
  'haida': [
    { id: 'm1', url: '/assets/haida/audio/thank_you.mp3', filename: 'thank_you.mp3', type: 'audio', communityId: 'haida' },
    { id: 'm2', url: '/assets/haida/images/eagle.jpg', filename: 'eagle.jpg', type: 'image', communityId: 'haida' },
    { id: 'm3', url: '/assets/haida/images/raven.jpg', filename: 'raven.jpg', type: 'image', communityId: 'haida' },
    { id: 'm4', url: '/assets/haida/audio/hello.mp3', filename: 'hello.mp3', type: 'audio', communityId: 'haida' },
    { id: 'm5', url: '/assets/haida/video/intro.mp4', filename: 'intro.mp4', type: 'video', communityId: 'haida' },
  ],
  'tlingit': [
    { id: 'm10', url: '/assets/tlingit/audio/greeting.mp3', filename: 'greeting.mp3', type: 'audio', communityId: 'tlingit' },
    { id: 'm11', url: '/assets/tlingit/images/totem.jpg', filename: 'totem.jpg', type: 'image', communityId: 'tlingit' },
  ],
  'demo': [
    { id: 'm20', url: '/assets/demo/sample.mp3', filename: 'sample.mp3', type: 'audio', communityId: 'demo' },
    { id: 'm21', url: '/assets/demo/sample.jpg', filename: 'sample.jpg', type: 'image', communityId: 'demo' },
  ]
};

export const MOCK_FOLDERS: Record<string, NACAFolderNode[]> = {
  '76ef3e19-69d6-44ea-8163-1c7d653e0181': [
    {
      id: 'pf1',
      name: 'Activities',
      type: 'folder',
      path: '/Activities',
      children: [
        { id: 'pa1', name: 'Blackfoot Greetings', type: 'activity', path: '/Activities/Blackfoot Greetings' },
        { id: 'pa2', name: 'Animal Names', type: 'activity', path: '/Activities/Animal Names' },
      ]
    },
  ],
  '94267867-1987-45ab-a2a3-1d97daa53006': [
    {
      id: 'lf1',
      name: 'Activities',
      type: 'folder',
      path: '/Activities',
      children: [
        { id: 'la1', name: 'Lesson 1: Introduction', type: 'activity', path: '/Activities/Lesson 1' },
        { id: 'la2', name: 'Lesson 2: Vocabulary', type: 'activity', path: '/Activities/Lesson 2' },
      ]
    },
  ],
  'haida': [
    {
      id: 'f1',
      name: 'Activities',
      type: 'folder',
      path: '/Activities',
      children: [
        { id: 'a1', name: 'Greetings Lesson', type: 'activity', path: '/Activities/Greetings Lesson' },
        { id: 'a2', name: 'Animal Names', type: 'activity', path: '/Activities/Animal Names' },
        { id: 'a3', name: 'Numbers 1-10', type: 'activity', path: '/Activities/Numbers 1-10' },
      ]
    },
    {
      id: 'f2',
      name: 'Media',
      type: 'folder',
      path: '/Media',
      children: [
        { 
          id: 'f2a', 
          name: 'Audio', 
          type: 'folder', 
          path: '/Media/Audio',
          children: [
            { id: 'af1', name: 'greetings.mp3', type: 'file', path: '/Media/Audio/greetings.mp3' },
            { id: 'af2', name: 'animals.mp3', type: 'file', path: '/Media/Audio/animals.mp3' },
          ]
        },
        { 
          id: 'f2b', 
          name: 'Images', 
          type: 'folder', 
          path: '/Media/Images',
          children: [
            { id: 'if1', name: 'eagle.jpg', type: 'file', path: '/Media/Images/eagle.jpg' },
            { id: 'if2', name: 'raven.jpg', type: 'file', path: '/Media/Images/raven.jpg' },
          ]
        },
      ]
    },
    {
      id: 'f3',
      name: 'Dictionaries',
      type: 'folder',
      path: '/Dictionaries',
      children: [
        { id: 'd1', name: 'Basic Vocabulary.csv', type: 'file', path: '/Dictionaries/Basic Vocabulary.csv' },
        { id: 'd2', name: 'Animals.csv', type: 'file', path: '/Dictionaries/Animals.csv' },
      ]
    },
  ],
  'demo': [
    {
      id: 'demo-f1',
      name: 'Sample Activities',
      type: 'folder',
      path: '/Sample Activities',
      children: [
        { id: 'demo-a1', name: 'Demo Activity 1', type: 'activity', path: '/Sample Activities/Demo Activity 1' },
        { id: 'demo-a2', name: 'Demo Activity 2', type: 'activity', path: '/Sample Activities/Demo Activity 2' },
      ]
    },
    {
      id: 'demo-f2',
      name: 'Demo Media',
      type: 'folder',
      path: '/Demo Media',
      children: [
        { id: 'demo-m1', name: 'sample.jpg', type: 'file', path: '/Demo Media/sample.jpg' },
        { id: 'demo-m2', name: 'sample.mp3', type: 'file', path: '/Demo Media/sample.mp3' },
      ]
    },
  ]
};

export function getMockCommunities(): NACACommunity[] {
  return MOCK_COMMUNITIES;
}

export function getMockCommunityProfile(communityId: string): NACACommunityProfile | null {
  const community = MOCK_COMMUNITIES.find(c => c.id === communityId);
  if (!community) return null;
  
  return {
    ...community,
    dictionaries: MOCK_DICTIONARIES[communityId] || [],
    folders: MOCK_FOLDERS[communityId] || []
  };
}

export function getMockDictionaries(communityId: string): NACADictionary[] {
  return MOCK_DICTIONARIES[communityId] || [];
}

export function getMockMedia(communityId: string, type?: 'image' | 'audio' | 'video'): NACAMediaFile[] {
  const media = MOCK_MEDIA[communityId] || [];
  if (type) {
    return media.filter(m => m.type === type);
  }
  return media;
}

export function getMockDropboxBrowse(communityId: string, path: string): NACADropboxBrowseResponse {
  const folders = MOCK_FOLDERS[communityId] || [];
  
  if (path === '/' || path === '') {
    return {
      entries: folders,
      hasMore: false
    };
  }
  
  function findFolder(nodes: NACAFolderNode[], targetPath: string): NACAFolderNode[] {
    for (const node of nodes) {
      if (node.path === targetPath && node.children) {
        return node.children;
      }
      if (node.children) {
        const found = findFolder(node.children, targetPath);
        if (found.length > 0) return found;
      }
    }
    return [];
  }
  
  return {
    entries: findFolder(folders, path),
    hasMore: false
  };
}
