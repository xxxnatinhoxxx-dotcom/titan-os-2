import { MuscleGroup } from './types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
    {id: 'chest', name: 'Peito'}, 
    {id: 'back', name: 'Costas'}, 
    {id: 'legs', name: 'Pernas'}, 
    {id: 'shoulders', name: 'Ombros'}, 
    {id: 'arms', name: 'Braços'}, 
    {id: 'abs', name: 'Abdômen'}
];

export const IMAGES: Record<string, string> = {
    'chest': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    'back': 'https://images.unsplash.com/photo-1603287681836-e56c31752c91?auto=format&fit=crop&w=800&q=80', 
    'legs': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80', 
    'shoulders': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80', 
    'arms': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', 
    'abs': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80', 
    'cardio': 'https://images.unsplash.com/photo-1538805060512-e24a42531538?auto=format&fit=crop&w=800&q=80', 
    'default': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
};

export function getImageForFocus(focus: string): string {
    if(!focus) return IMAGES.default;
    const lower = focus.toLowerCase();
    if(lower.includes('peito')) return IMAGES.chest;
    if(lower.includes('costas') || lower.includes('dorsal')) return IMAGES.back;
    if(lower.includes('perna') || lower.includes('agacha')) return IMAGES.legs;
    if(lower.includes('ombro') || lower.includes('deltoide')) return IMAGES.shoulders;
    if(lower.includes('braco') || lower.includes('biceps') || lower.includes('triceps')) return IMAGES.arms;
    if(lower.includes('abdom')) return IMAGES.abs;
    if(lower.includes('cardio')) return IMAGES.cardio;
    return IMAGES.default;
}