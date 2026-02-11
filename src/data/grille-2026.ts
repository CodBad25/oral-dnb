export type MasteryLevel = {
  name: string;
  description: string;
  points: number;
  color: "insufficient" | "fragile" | "satisfactory" | "excellent";
};

export type Criterion = {
  id: string;
  title: string;
  maxPoints: number;
  levels: MasteryLevel[];
};

export type Section = {
  id: number;
  title: string;
  maxPoints: number;
  criteria: Criterion[];
};

export type Grille = {
  session: string;
  totalPoints: number;
  sections: Section[];
};

export const grille: Grille = {
  session: "2026",
  totalPoints: 20,
  sections: [
    {
      id: 1,
      title: "Maîtrise du sujet présenté",
      maxPoints: 12,
      criteria: [
        {
          id: "1-1",
          title: "Construire un exposé de manière développée et organisée",
          maxPoints: 4,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description:
                "Développe insuffisamment son exposé : il n'est pas clair et/ou désorganisé.",
              points: 1,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description:
                "Développe un exposé parfois désorganisé qui manque aussi de clarté.",
              points: 2,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description: "Développe un exposé clair et assez bien structuré.",
              points: 3,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Développe un exposé bien structuré, clair et qui respecte la durée minimum impartie (entre 4'30 et 5').",
              points: 4,
              color: "excellent",
            },
          ],
        },
        {
          id: "1-2",
          title: "Justifier son choix d'objet d'étude (ou de stage) et sa démarche",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description: "Justifie insuffisamment ses choix.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description: "Justifie parfois ses choix.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description: "Justifie globalement ses choix.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Justifie ses choix de manière cohérente et argumentée.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "1-3",
          title: "Mettre en évidence les connaissances acquises au cours du projet",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description: "Peu de connaissances acquises sont présentées.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description: "Quelques connaissances acquises sont présentées.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description:
                "Les connaissances acquises sont globalement bien formulées et développées.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Les connaissances acquises sont clairement formulées et développées.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "1-4",
          title: "Mettre en évidence les compétences du socle commun acquises",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description: "Peu de compétences du socle sont présentées.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description: "Quelques compétences du socle sont présentées.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description:
                "Les compétences du socle sont globalement présentées et expliquées.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Les compétences du socle sont clairement présentées et expliquées.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "1-5",
          title: "Porter un regard critique sur son projet",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description: "Formule un avis personnel superficiel.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description: "Formule un avis personnel mais sans le justifier.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description: "Formule un avis personnel justifié en partie.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Formule un avis personnel justifié qui prend en compte ses sensations et ses sentiments.",
              points: 2,
              color: "excellent",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Maîtrise de l'expression orale",
      maxPoints: 8,
      criteria: [
        {
          id: "2-1",
          title: "S'exprimer de façon maîtrisée",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description:
                "S'exprime avec difficulté, pas assez audible pour que le jury puisse entendre. Gestuelle inadaptée. Ne regarde pas le jury.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description:
                "S'exprime brièvement en réussissant parfois à se faire entendre. Regarde l'auditoire de temps en temps. Gestuelle mal maîtrisée.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description:
                "S'exprime de façon audible et claire en regardant son auditoire mais avec quelques hésitations. Utilise son corps à bon escient.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "S'exprime de façon audible et claire, sans hésitation et en regardant son auditoire. Bonne gestuelle.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "2-2",
          title: "Utiliser un vocabulaire adapté et varié",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description: "Utilise un vocabulaire limité, imprécis et familier.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description: "Utilise un vocabulaire partiellement adapté.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description: "Utilise un vocabulaire adapté et relativement varié.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description: "Utilise un vocabulaire précis, riche et soutenu.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "2-3",
          title: "Maîtriser la langue orale",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description:
                "Les phrases sont trop souvent boiteuses : la compréhension est vraiment gênée.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description:
                "Les phrases présentent plusieurs erreurs syntaxiques, et/ou le propos manque de clarté dans son ensemble.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description:
                "Les phrases sont correctes, le discours reste clair dans l'ensemble.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Les phrases sont syntaxiquement correctes, le discours est clair et organisé à l'aide de connecteurs appropriés et variés.",
              points: 2,
              color: "excellent",
            },
          ],
        },
        {
          id: "2-4",
          title: "Participer de façon constructive à des échanges oraux",
          maxPoints: 2,
          levels: [
            {
              name: "Maîtrise insuffisante",
              description:
                "Ne répond pas aux questions ou y répond de manière erronée.",
              points: 0.5,
              color: "insufficient",
            },
            {
              name: "Maîtrise fragile",
              description:
                "Répond à quelques questions même si ses réponses sont parfois erronées.",
              points: 1,
              color: "fragile",
            },
            {
              name: "Maîtrise satisfaisante",
              description:
                "Répond à la plupart des questions et essaie de développer ses réponses.",
              points: 1.5,
              color: "satisfactory",
            },
            {
              name: "Très bonne maîtrise",
              description:
                "Répond aux questions de façon convaincante et avec des exemples.",
              points: 2,
              color: "excellent",
            },
          ],
        },
      ],
    },
  ],
};
