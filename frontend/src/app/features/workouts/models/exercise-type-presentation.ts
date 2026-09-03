export interface ExerciseTypePresentation {
  label: string;
  imageUrl: string;
  imageAlt: string;
  accentClass: string;
  badgeClass: string;
}

const presentations: Record<string, ExerciseTypePresentation> = {
  cardio: {
    label: 'Kardio',
    imageUrl: '/images/exercise-types/cardio.jpg',
    imageAlt: 'Osoba trči tokom kardio treninga',
    accentClass: 'from-orange-500/55',
    badgeClass: 'bg-orange-500/15 text-orange-300 ring-orange-500/20',
  },
  strength: {
    label: 'Trening snage',
    imageUrl: '/images/exercise-types/strength.jpg',
    imageAlt: 'Tegovi za trening snage',
    accentClass: 'from-rose-500/50',
    badgeClass: 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
  },
  flexibility: {
    label: 'Fleksibilnost',
    imageUrl: '/images/exercise-types/flexibility.jpg',
    imageAlt: 'Grupa izvodi vežbe fleksibilnosti',
    accentClass: 'from-emerald-500/45',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
  },
};

const fallbackPresentation: ExerciseTypePresentation = {
  label: 'Trening',
  imageUrl: '/images/exercise-types/cardio.jpg',
  imageAlt: 'Trening',
  accentClass: 'from-slate-500/50',
  badgeClass: 'bg-slate-500/15 text-slate-300 ring-slate-500/20',
};

export function getExerciseTypePresentation(name: string): ExerciseTypePresentation {
  return presentations[name.trim().toLowerCase()] ?? {
    ...fallbackPresentation,
    label: name,
  };
}
