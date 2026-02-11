import { grille } from '@/data/grille-2026';
import type { EvaluationState } from '@/hooks/useEvaluation';

const PRENOMS = ['Emma', 'Lucas', 'Jade', 'Noah', 'Louise', 'Raphaël', 'Ambre', 'Gabriel', 'Léa', 'Arthur', 'Manon', 'Liam'];
const NOMS = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Richard', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent'];
const CLASSES = ['3A', '3B', '3C', '3D'];
const SUJETS = [
  'Le développement durable dans ma commune',
  'Stage en entreprise : découverte du métier de vétérinaire',
  'Les réseaux sociaux et leur impact sur les adolescents',
  'Mon EPI Arts et Sciences',
  'Le parcours Avenir : mon projet professionnel',
  'L\'intelligence artificielle au quotidien',
  'Histoire des Arts : Guernica de Picasso',
  'Stage d\'observation en pharmacie',
];
const HORAIRES = ['08h00', '08h20', '08h40', '09h00', '09h20', '09h40', '10h00', '10h20', '10h40', '11h00', '11h20', '11h40'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomScore = (levels: { points: number }[]): number => {
  // Weighted: better scores more likely (realistic distribution)
  const weights = [1, 2, 4, 3]; // insuffisant rare, fragile peu, satisfaisant fréquent, très bon assez fréquent
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < levels.length; i++) {
    r -= weights[i];
    if (r <= 0) return levels[i].points;
  }
  return levels[levels.length - 1].points;
};

export const generateDemoData = (count = 8): EvaluationState[] => {
  const usedNames = new Set<string>();
  const candidates: EvaluationState[] = [];

  for (let i = 0; i < count; i++) {
    let prenom: string, nom: string, key: string;
    do {
      prenom = pick(PRENOMS);
      nom = pick(NOMS);
      key = `${prenom}-${nom}`;
    } while (usedNames.has(key));
    usedNames.add(key);

    const scores: Record<string, number> = {};
    for (const section of grille.sections) {
      for (const criterion of section.criteria) {
        // 5% chance of 0 (oubli/absence)
        if (Math.random() < 0.05) {
          scores[criterion.id] = 0;
        } else {
          scores[criterion.id] = randomScore(criterion.levels);
        }
      }
    }

    const exposeDuration = 270 + Math.floor(Math.random() * 90); // 4:30 à 6:00
    const entretienDuration = 540 + Math.floor(Math.random() * 180); // 9:00 à 12:00

    candidates.push({
      currentStep: 6,
      jury: {
        prof1Nom: 'Dupont',
        prof1Prenom: 'Marie',
        prof2Nom: 'Lefèvre',
        prof2Prenom: 'Pierre',
        juryNumber: '1',
        date: '2026-06-15',
        salle: 'A102',
      },
      candidate: {
        prenom,
        nom,
        classe: pick(CLASSES),
        horaire: HORAIRES[i % HORAIRES.length],
        sujet: SUJETS[i % SUJETS.length],
      },
      scores,
      comments: '',
      timers: {
        expose: { expectedSeconds: 300, actualSeconds: exposeDuration },
        entretien: { expectedSeconds: 600, actualSeconds: entretienDuration },
      },
    });
  }

  return candidates;
};
