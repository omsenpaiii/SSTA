// Replace the legacy catalogue photographs while allowing later admin image changes.
const updates: Record<string, { previous: string; image: string }> = {
  "certificate-iii-carpentry": {
    "previous": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    "image": "/images/courses/carpentry.png"
  },
  "certificate-iii-individual-support": {
    "previous": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    "image": "/images/courses/individual-support.png"
  },
  "certificate-iv-disability": {
    "previous": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    "image": "/images/courses/disability-support.png"
  },
  "diploma-community-services": {
    "previous": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    "image": "/images/courses/community-services.png"
  },
  "fire-extinguisher-warden-training": {
    "previous": "https://images.unsplash.com/photo-1505489304219-85ce17010209?auto=format&fit=crop&w=900&q=80",
    "image": "/images/courses/fire-warden.png"
  }
};

export function resolveCourseImage(slug: string, current: string | null | undefined, fallback: string) {
  const update = updates[slug];
  if (update && (!current || current.split("?")[0] === update.previous.split("?")[0])) return update.image;
  return current || fallback;
}
