import { bangActionSerialised } from '@/hooks/search/Bangs'
import { searchTypes } from '@/types/searchTypes'

const defaultBangs = {
    google: {
        searchType: searchTypes.search,
        type: 'web',
        action: 'https://www.google.com/search?q=${query}',
        alias: 'google',
        shortcut: 'g',
        description: 'Search Google',
    },
    youtube: {
        searchType: searchTypes.search,
        type: 'web',
        action: 'https://www.youtube.com/results?search_query=${query}',
        alias: 'youtube',
        shortcut: 'yt',
        description: 'Search YouTube',
    },
    tiktok: {
        searchType: searchTypes.search,
        type: 'web',
        action: 'https://www.tiktok.com/tag/${query}',
        alias: 'tiktok',
        shortcut: 'tt',
        description: 'Search TikTok',
    },
    folder: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'folder:${query}',
        alias: 'folder',
        shortcut: 'fo',
        description: 'Search Folders',
    },

    // file types
    file: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'file:${query}',
        alias: 'file',
        shortcut: 'fi',
        description: 'Search Files',
    },
    image: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:png;jpg;jpeg;bmp ${query}',
        alias: 'image',
        shortcut: 'img',
        description: 'Search Images',
    },
    video: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:mp4;avi;mov ${query}',
        alias: 'video',
        shortcut: 'vid',
        description: 'Search Videos',
    },
    audio: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:mp3;wav;flac ${query}',
        alias: 'audio',
        description: 'Search Audios',
    },
    document: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:pdf;docx;txt ${query}',
        alias: 'document',
        shortcut: 'doc',
        description: 'Search Documents',
    },
    archive: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:zip;rar;tar ${query}',
        alias: 'archive',
        description: 'Search Archives',
    },
    executable: {
        searchType: searchTypes.file,
        type: 'file',
        transformer: 'ext:exe ${query}',
        alias: 'executable',
        shortcut: 'exe',
        description: 'Search Executables',
    },
} as { [key: string]: bangActionSerialised }

const defaultBangSelector = ['!', '\\']

export { defaultBangs, defaultBangSelector }
