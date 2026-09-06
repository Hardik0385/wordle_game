export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  { id: 'robot-1', name: 'Cyber Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber' },
  { id: 'robot-2', name: 'Volt', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Volt' },
  { id: 'robot-3', name: 'Spark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark' },
  { id: 'robot-4', name: 'Glitch', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Glitch' },
  { id: 'adv-1', name: 'Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 'adv-2', name: 'Luna', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna' },
  { id: 'adv-3', name: 'Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
  { id: 'adv-4', name: 'Maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya' },
  { id: 'lore-1', name: 'Sage', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sage' },
  { id: 'lore-2', name: 'Robin', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Robin' },
  { id: 'pixel-1', name: 'Pixel Knight', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Knight' },
  { id: 'pixel-2', name: 'Pixel Mage', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Mage' },
];

export function getDefaultAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}
