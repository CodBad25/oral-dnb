export type MasteryLevel = {
  name: string;
  description: string;
  points: number[];
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
  session: "2025",
  totalPoints: 100,
  sections: [
    {
      id: 1,
      title: "Maitrise du sujet presente",
      maxPoints: 50,
      criteria: [
        {
          id: "1-1",
          title: "Construire un expose de maniere developpee et organisee",
          maxPoints: 13,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Developpe insuffisamment son expose ; il n'est pas clair et/ou desorganise.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Developpe un expose parfois desorganise qui manque aussi de clarte.",
              points: [3, 4, 5],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Developpe un expose clair et assez bien structure.",
              points: [7, 8, 9, 10],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Developpe un expose bien structure, clair et respecte la duree minimum impartie.",
              points: [11, 12, 13],
              color: "excellent",
            },
          ],
        },
        {
          id: "1-2",
          title: "Justifier ses choix et sa demarche",
          maxPoints: 8,
          levels: [
            {
              name: "Maitrise insuffisante",
              description: "Justifie insuffisamment ses choix.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description: "Justifie parfois ses choix.",
              points: [3, 4, 5],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description: "Justifie globalement ses choix.",
              points: [6, 7],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Justifie ses choix de maniere coherente et argumentee.",
              points: [8],
              color: "excellent",
            },
          ],
        },
        {
          id: "1-3",
          title:
            "Mettre en evidence les connaissances acquises au cours du projet",
          maxPoints: 13,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Peu de connaissances acquises sont presentees.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Quelques connaissances acquises sont presentees.",
              points: [3, 4, 5, 6],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Les connaissances acquises sont globalement bien formulees et developpees.",
              points: [7, 8, 9, 10],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Les connaissances acquises sont clairement formulees et developpees.",
              points: [11, 12, 13],
              color: "excellent",
            },
          ],
        },
        {
          id: "1-4",
          title:
            "Mettre en evidence les competences du socle commun acquises dans les 5 domaines",
          maxPoints: 8,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Peu de competences du socle sont presentees.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Quelques competences du socle sont presentees.",
              points: [3, 4, 5],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Les competences du socle sont globalement presentees et expliquees.",
              points: [6, 7],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Les competences du socle sont clairement presentees et expliquees.",
              points: [8],
              color: "excellent",
            },
          ],
        },
        {
          id: "1-5",
          title: "Porter un regard critique sur son projet",
          maxPoints: 8,
          levels: [
            {
              name: "Maitrise insuffisante",
              description: "Formule un avis personnel superficiel.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Formule un avis personnel mais sans le justifier.",
              points: [3, 4, 5],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Formule un avis personnel justifie en partie.",
              points: [6, 7],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Formule un avis personnel justifie qui prend en compte ses sensations et ses sentiments.",
              points: [8],
              color: "excellent",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Maitrise de l'expression orale",
      maxPoints: 50,
      criteria: [
        {
          id: "2-1",
          title:
            "S'exprimer de facon maitrisee en s'adressant a un auditoire",
          maxPoints: 12,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "S'exprime avec difficulte, pas assez audible. Gestuelle inadequate. Ne regarde pas le jury.",
              points: [0, 1, 2, 3],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "S'exprime brievement en reussissant parfois a se faire entendre. Regarde l'auditoire de temps en temps.",
              points: [4, 5, 6],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "S'exprime de facon audible et claire en regardant son auditoire mais avec quelques hesitations.",
              points: [7, 8, 9, 10],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "S'exprime de facon audible et claire, sans hesitation et en regardant son auditoire. Bonne gestuelle.",
              points: [11, 12],
              color: "excellent",
            },
          ],
        },
        {
          id: "2-2",
          title: "Utiliser un vocabulaire adapte et varie",
          maxPoints: 14,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Utilise un vocabulaire limite, imprecis et familier.",
              points: [0, 1, 2, 3],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Utilise un vocabulaire partiellement adapte et varie.",
              points: [4, 5, 6, 7],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Utilise un vocabulaire adapte et relativement varie.",
              points: [8, 9, 10],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Utilise un vocabulaire precis, riche et soutenu.",
              points: [11, 12, 13, 14],
              color: "excellent",
            },
          ],
        },
        {
          id: "2-3",
          title: "Maitriser la langue orale",
          maxPoints: 12,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Phrases trop souvent boiteuses : la comprehension est vraiment genee.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Phrases presentant plusieurs erreurs syntaxiques et/ou propos manquant de clarte.",
              points: [3, 4, 5, 6],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Phrases correctes, discours clair dans l'ensemble.",
              points: [7, 8, 9],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Phrases syntaxiquement correctes, discours clair et organise avec connecteurs appropries et varies.",
              points: [10, 11, 12],
              color: "excellent",
            },
          ],
        },
        {
          id: "2-4",
          title:
            "Participer de facon constructive a des echanges oraux",
          maxPoints: 12,
          levels: [
            {
              name: "Maitrise insuffisante",
              description:
                "Ne repond pas aux questions ou de maniere erronee.",
              points: [0, 1, 2],
              color: "insufficient",
            },
            {
              name: "Maitrise fragile",
              description:
                "Repond a quelques questions meme si ses reponses sont parfois erronees.",
              points: [3, 4, 5, 6],
              color: "fragile",
            },
            {
              name: "Maitrise satisfaisante",
              description:
                "Repond a la plupart des questions et essaie de developper ses reponses.",
              points: [7, 8, 9],
              color: "satisfactory",
            },
            {
              name: "Tres bonne maitrise",
              description:
                "Repond aux questions de facon convaincante et argumentee de maniere developpee.",
              points: [10, 11, 12],
              color: "excellent",
            },
          ],
        },
      ],
    },
  ],
};
