import { Injectable } from '@angular/core';
import { Question } from '../models/question.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
private questions: Question[] = [
  new Question(
    1,
    "Sur une échelle de 1 à 10, à quel point avez-vous trouvé facile l’utilisation quotidienne de l’appareil dans votre routine ?",
    'texte',
    [],
    1
  ),
  new Question(
    2,
    "Quelles situations ou habitudes quotidiennes vous ont empêché d’utiliser l’appareil ?",
    'texte',
    [],
    1
  ),
  new Question(
    3,
    "Avez-vous dû ajuster votre emploi du temps pour faire de la place à l’utilisation de l’appareil ?",
    'texte',
    [],
    1
  ),
  new Question(
    4,
    "Avez-vous trouvé que l’utilisation quotidienne devenait une habitude facile à adopter ?",
    'texte',
    [],
    1
  ),
  new Question(
    5,
    "À quelle fréquence avez-vous omis d’utiliser l’appareil pour cause d’inconfort (oubli, manque de temps, emploi du temps chargé) ?",
    'texte',
    [],
    1
  ),

  // → Sous-thématique 2 (Délai de réponse) ← correspond à "Fréquence de traitement" dans l’Excel
  new Question(
    6,
    "Avez-vous réussi à porter l’appareil tous les jours pendant 30 minutes ? (oui/non) Si non, combien de jours avez-vous manqué ?",
    'texte',
    [],
    2
  ),
  new Question(
    40,
    "Si vous n'avez pas suivi la fréquence d'utilisation recommandée, qu’est-ce qui vous a poussé à réduire ou à arrêter l’utilisation ?",
    'texte',
    [],
    2
  ),
  new Question(
    41,
    "Sur une échelle de 1 à 10, à quel point la durée du traitement quotidien (30 minutes) vous semble-t-elle raisonnable ?",
    'texte',
    [],
    2
  ),

  // → Sous-thématique 3 (Accessibilité du site) ← correspond à "Durée du traitement" dans l’Excel
  new Question(
    42,
    "Sur une échelle de 1 à 10, trouvez-vous la durée quotidienne de 30 minutes adaptée à vos besoins ?",
    'texte',
    [],
    3
  ),
  new Question(
    43,
    "Avez-vous ressenti le besoin d’augmenter ou de diminuer la durée d’utilisation quotidienne ? (oui/non)",
    'texte',
    [],
    3
  ),
  new Question(
    7,
    "Sur une échelle de 1 à 10, comment évalueriez-vous l’amélioration de vos douleurs après l’utilisation de l’appareil ?",
    'texte',
    [],
    4
  ),
  new Question(
    8,
    "Sur une échelle de 1 à 10, à quelle vitesse avez-vous ressenti un soulagement après utilisation ?",
    'texte',
    [],
    4
  ),
  new Question(
    9,
    "Quelles améliorations ou changements avez-vous remarqués dans vos symptômes (menstruels, prémenstruels, préménopause) après l’utilisation de l’appareil ?",
    'texte',
    [],
    4
  ),
  new Question(
    10,
    "Avez-vous observé des effets secondaires ou des inconforts inattendus liés à l’utilisation de l’appareil ?",
    'texte',
    [],
    4
  ),
  new Question(
    11,
    "Avez-vous ressenti des variations d’efficacité du traitement au cours de vos cycles (menstruels, prémenstruels, préménopause) ?",
    'texte',
    [],
    4
  ),
  new Question(
    12,
    "Avez-vous noté une diminution progressive de la douleur à mesure que les jours passaient ?",
    'texte',
    [],
    4
  ),
  new Question(
    13,
    "Avez-vous observé une différence d’efficacité entre différents moments de la journée ?",
    'texte',
    [],
    4
  ),
  new Question(
    14,
    "Avez-vous observé une différence d’efficacité entre les moments de douleurs versus les moments sans douleur ?",
    'texte',
    [],
    4
  ),
  new Question(
    15,
    "Avez-vous utilisé l’appareil lors des périodes de douleurs vives ?",
    'texte',
    [],
    4
  ),
  new Question(
    16,
    "Avez-vous ressenti des bienfaits lorsque vous avez utilisé l’appareil lors des périodes de douleurs vives ?",
    'texte',
    [],
    4
  ),
  new Question(
    17,
    "À quelle vitesse avez-vous ressenti des bienfaits lorsque vous avez utilisé l’appareil lors des périodes de douleurs vives ?",
    'texte',
    [],
    4
  ),
  new Question(
    18,
    "Comment comparez-vous les résultats du traitement avec vos attentes initiales ?",
    'texte',
    [],
    4
  ),
  new Question(
    19,
    "Avez-vous remarqué d’autres bienfaits pour la santé que vous n’avez pas anticipés en utilisant l’appareil ? (santé mentale, habitudes de vie, autre)",
    'texte',
    [],
    4
  ),

  // ─── Sous-thématique 5 (Impact psychologique et émotionnel) ─────────────────────────────
  new Question(
    20,
    "Sur une échelle de 1 à 10, à quel point l’utilisation de l’appareil vous a-t-elle apporté un sentiment de contrôle sur vos douleurs ?",
    'texte',
    [],
    5
  ),
  new Question(
    21,
    "Ressentez-vous un impact psychologique ou émotionnel positif en utilisant cet appareil pour gérer vos douleurs ? (oui/non)",
    'texte',
    [],
    5
  ),
  new Question(
    22,
    "Comment l’appareil a-t-il influencé votre bien-être émotionnel ou votre perception de vos douleurs ?",
    'texte',
    [],
    5
  ),
  new Question(
    23,
    "Y a-t-il des aspects psychologiques ou émotionnels qui n’ont pas été pris en compte par l’appareil mais qui sont importants pour votre bien-être global ?",
    'texte',
    [],
    5
  ),
  new Question(
    24,
    "Avez-vous ressenti un soulagement émotionnel ou psychologique lors de l’utilisation de l’appareil ?",
    'texte',
    [],
    5
  ),
  new Question(
    25,
    "Avez-vous observé des changements dans votre niveau de stress ou d’anxiété en lien avec l’utilisation de l’appareil ?",
    'texte',
    [],
    5
  ),
  new Question(
    26,
    "L’appareil vous a-t-il aidé(e) à mieux gérer ou accepter vos symptômes ?",
    'texte',
    [],
    5
  ),
  new Question(
    27,
    "Avez-vous constaté une amélioration de votre sommeil ou de votre humeur pendant l’utilisation de l’appareil ?",
    'texte',
    [],
    5
  ),
  new Question(
    28,
    "Sur une échelle de 1 à 10, à quel point l’appareil vous apporte-t-il une tranquillité d’esprit dans la gestion de vos douleurs ?",
    'texte',
    [],
    5
  ),

  // ─── Sous-thématique 6 (Comparaison avec d’autres traitements) ──────────────────────────
  new Question(
    29,
    "Sur une échelle de 1 à 10, comment compareriez-vous l’efficacité de cet appareil aux autres traitements que vous avez essayés pour les mêmes symptômes ?",
    'texte',
    [],
    6
  ),
  new Question(
    30,
    "Seriez-vous prêt(e) à abandonner d’autres traitements en faveur de cet appareil à long terme ? (oui/non)",
    'texte',
    [],
    6
  ),
  new Question(
    31,
    "Quels aspects de l’appareil le distinguent des autres solutions que vous avez essayées (médicaments, thérapies alternatives, etc.) ?",
    'texte',
    [],
    6
  ),
  new Question(
    32,
    "Quelles améliorations, par rapport à d’autres traitements, pourriez-vous suggérer pour rendre cet appareil plus attractif ou efficace ?",
    'texte',
    [],
    6
  ),
  new Question(
    33,
    "Sur une échelle de 1 à 10, à quel point trouvez-vous cet appareil plus pratique que d’autres traitements ?",
    'texte',
    [],
    6
  ),
  new Question(
    34,
    "Avez-vous préféré cet appareil aux médicaments ou à d’autres thérapies pour des raisons de praticité ?",
    'texte',
    [],
    6
  ),
  new Question(
    35,
    "Avez-vous constaté des effets secondaires moins nombreux ou moins graves par rapport à d’autres traitements ?",
    'texte',
    [],
    6
  ),
  new Question(
    36,
    "Pensez-vous que cet appareil pourrait remplacer ou compléter vos traitements actuels ?",
    'texte',
    [],
    6
  ),
  new Question(
    37,
    "Sur une échelle de 1 à 10, à quel point le coût potentiel de l’appareil est-il un facteur déterminant par rapport aux autres traitements ?",
    'texte',
    [],
    6
  )
];

  constructor() { }

  /** GET /questions (en mémoire) */
  getAll(): Observable<Question[]> {
    return of(this.questions.map(q => Object.assign(
      new Question(0, '', '', [], 0),
      q
    )));
  }

  /** GET /questions/:id */
  getById(id: number): Observable<Question | undefined> {
    const found = this.questions.find(q => q.id === id);
    return of(
      found 
        ? Object.assign(new Question(0, '', '', [], 0), found) 
        : undefined
    );
  }

  /** GET /questions?sousThematiqueId=XX */
  getBySousThematique(sousThId: number): Observable<Question[]> {
    const filtered = this.questions.filter(q => q.sousThematiqueId === sousThId);
    return of(filtered.map(q => Object.assign(
      new Question(0, '', '', [], 0),
      q
    )));
  }

  /** CREATE /questions (en mémoire) */
  create(question: Question): Observable<Question> {
    const newId = this.questions.length > 0
      ? Math.max(...this.questions.map(q => q.id)) + 1
      : 1;
    const nouvelle = new Question(
      newId,
      question.question,
      question.typeQuestion,
      question.options,
      question.sousThematiqueId
    );
    this.questions.push(nouvelle);
    return of(nouvelle);
  }

  /** UPDATE /questions/:id (en mémoire) */
  update(question: Question): Observable<Question | undefined> {
    const index = this.questions.findIndex(q => q.id === question.id);
    if (index === -1) {
      return of(undefined);
    }
    this.questions[index] = Object.assign(new Question(0, '', '', [], 0), question);
    return of(this.questions[index]);
  }

  /** DELETE /questions/:id (en mémoire) */
  delete(id: number): Observable<boolean> {
    const index = this.questions.findIndex(q => q.id === id);
    if (index === -1) {
      return of(false);
    }
    this.questions.splice(index, 1);
    return of(true);
  }
}
