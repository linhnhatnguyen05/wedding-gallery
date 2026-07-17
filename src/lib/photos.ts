import { photoPaths, videoPaths } from './mediaFiles';

export interface Photo {
  id: number;
  src: string;
  alt: string;
  caption: string;
  category: string;
  width: number;
  height: number;
}

export interface AlbumPage {
  pageNumber: number;
  layout: 'full' | 'video' | 'editorial' | 'single-large' | 'duo' | 'trio';
  photos: Photo[];
  videos?: string[];
  title?: string;
  quote?: string;
}

// Generate the 150 photos list using actual paths
export const photos: Photo[] = photoPaths.map((path, i) => {
  const num = String(i + 1).padStart(3, '0');
  return {
    id: i + 1,
    src: path,
    alt: `Portfolio Artwork ${i + 1}`,
    caption: `Artwork ${num}`,
    category: 'gallery',
    width: 3,
    height: 4};
});

// Generate the 48 videos list using actual paths
export const videos: string[] = videoPaths;

// Generate 198 combined album pages
export const albumPages: AlbumPage[] = (() => {
  const pages: AlbumPage[] = [];
  let videoIndex = 0;

  for (let i = 0; i < photos.length; i++) {
    // Add photo page
    pages.push({
      pageNumber: pages.length + 1,
      layout: 'full',
      photos: [photos[i]],
      title: `HỒNG`,
      quote: undefined});

    // Every 3 photos, insert a video page (if we have videos left)
    if ((i + 1) % 3 === 0 && videoIndex < videos.length) {
      pages.push({
        pageNumber: pages.length + 1,
        layout: 'video',
        photos: [],
        videos: [videos[videoIndex]],
        title: `HỒNG`,
        quote: undefined});
      videoIndex++;
    }
  }

  // Push remaining videos
  while (videoIndex < videos.length) {
    pages.push({
      pageNumber: pages.length + 1,
      layout: 'video',
      photos: [],
      videos: [videos[videoIndex]],
      title: `Cinematic Moment ${String(videoIndex + 1).padStart(2, '0')}`,
      quote: '"Every love story is beautiful, but ours is my favorite."'});
    videoIndex++;
  }

  return pages;
})();

export const COUPLE_NAMES = {
  bride: 'Hồng',
  groom: '',
  combined: 'Nguyễn Thị Hồng',
  monogram: 'H',
  date: 'Ngày 14 tháng 6 năm 2025',
  venue: 'Đám Cưới Tuyệt Vời'
};

