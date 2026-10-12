import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand

from accounts.models import User
from academic.models import Department, Program, AcademicYear
from courses.models import UE, Session, Chapter, Quiz, QuizQuestion, UserUEAccess
from forms_builder.models import DynamicForm
from monetization.models import PaymentMethod, PlatformConfig, PromoCode
from ads.models import PopupCampaign
from referrals.models import ReferralCode


def gen_id(prefix):
    return f"{prefix}_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"


DEPARTMENTS = [
    {
        'code': 'FASEG',
        'name': 'Faculté des Sciences Économiques et de Gestion',
        'faculty': 'Université de Lomé',
        'description': "Sciences économiques, gestion et commerce.",
        'programs': [
            {'code': 'ECO', 'name': 'Sciences Économiques', 'description': 'Analyse économique et politiques publiques.'},
            {'code': 'GEST', 'name': 'Sciences de Gestion', 'description': 'Management, comptabilité et finance.'},
        ],
    },
    {
        'code': 'FDS',
        'name': 'Faculté des Sciences',
        'faculty': 'Université de Lomé',
        'description': "Sciences exactes, informatique et mathématiques.",
        'programs': [
            {'code': 'INFO', 'name': 'Informatique & Systèmes', 'description': 'Développement, réseaux et bases de données.'},
            {'code': 'MATH', 'name': 'Mathématiques Appliquées', 'description': 'Analyse, algèbre et modélisation.'},
        ],
    },
    {
        'code': 'FDD',
        'name': 'Faculté de Droit',
        'faculty': 'Université de Lomé',
        'description': "Droit privé, public et sciences politiques.",
        'programs': [
            {'code': 'DPRI', 'name': 'Droit Privé', 'description': 'Droit civil, commercial et des affaires.'},
            {'code': 'DPUB', 'name': 'Droit Public', 'description': 'Droit constitutionnel et administratif.'},
        ],
    },
    {
        'code': 'FLLA',
        'name': 'Faculté des Lettres, Langues et Arts',
        'faculty': 'Université de Lomé',
        'description': "Langues, littérature et communication.",
        'programs': [
            {'code': 'ANG', 'name': 'Études Anglophones', 'description': 'Langue, littérature et civilisation anglaises.'},
            {'code': 'LIN', 'name': 'Linguistique & Communication', 'description': 'Sciences du langage et communication.'},
        ],
    },
]


UES = [
    # ===== FASEG — Sciences Économiques =====
    {
        'code': 'ECO-101', 'title': 'Microéconomie I', 'level': 'L1', 'department': 'FASEG', 'program': 'ECO',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser les fondamentaux de la microéconomie : choix du consommateur, marché, équilibre.",
        'description': "Introduction à l'analyse microéconomique : préférences, utilité, contrainte budgétaire, offre et demande.",
        'sessions': [
            {'title': "Introduction à la microéconomie", 'num': 1, 'minutes': 45,
             'objective': "Comprendre l'objet de la microéconomie et ses outils.",
             'description': "Présentation du raisonnement marginaliste et des agents économiques.",
             'chapters': [
                 {'title': "Objet et méthodes de la microéconomie", 'num': 1, 'objectives': "Distinguer micro et macro ; identifier les agents.",
                  'summary': "### 1. Définition\nLa microéconomie étudie le comportement des agents individuels : consommateurs, producteurs, État.\n\n### 2. Les 3 questions fondamentales\n- Que produire ?\n- Comment produire ?\n- Pour qui produire ?\n\n### 3. Raisonnement marginal\nOn compare le coût marginal au bénéfice marginal pour décider.",
                  'quiz': [
                      {'text': "Quel est l'objet principal de la microéconomie ?", 'options': ['Les agrégats nationaux', 'Les agents individuels', 'Le commerce international', 'La monnaie'], 'answer': 'Les agents individuels', 'explanation': "La microéconomie étudie les comportements individuels."},
                  ]},
                 {'title': "Les agents et le circuit économique", 'num': 2, 'objectives': "Identifier les 3 agents principaux et leurs interactions.",
                  'summary': "### Les agents\n- **Ménages** : offrent le travail, consomment.\n- **Entreprises** : produisent, embauchent.\n- **État** : prélève des impôts, fournit des biens publics.\n\n### Le circuit\nLes flux réels et monétaires circulent entre ces agents.",
                  'quiz': [
                      {'text': "Quel agent offre le travail ?", 'options': ['Les ménages', 'Les entreprises', 'L\'État', 'Les banques'], 'answer': 'Les ménages', 'explanation': "Les ménages offrent leur force de travail."},
                  ]},
             ]},
            {'title': "Théorie du consommateur", 'num': 2, 'minutes': 50,
             'objective': "Maîtriser les courbes d'indifférence, TMS, contrainte budgétaire.",
             'description': "Analyse des préférences et de l'équilibre du consommateur.",
             'chapters': [
                 {'title': "Préférences et utilité", 'num': 1, 'objectives': "Définir l'utilité totale et marginale.",
                  'summary': "### Utilité totale vs marginale\nUtilité totale = satisfaction globale. Utilité marginale = satisfaction du dernier bien consommé.\n\n### Loi de Gossen\nL'utilité marginale est décroissante : plus on consomme, moins on est satisfait par une unité supplémentaire.",
                  'quiz': [
                      {'text': "La loi de Gossen énonce que :", 'options': ['Um est croissante', 'Um est constante', 'Um est décroissante', 'Um est nulle'], 'answer': 'Um est décroissante', 'explanation': "L'utilité marginale décroît avec la quantité consommée."},
                  ]},
                 {'title': "Courbes d'indifférence et TMS", 'num': 2, 'objectives': "Calculer le TMS et interpréter les courbes.",
                  'summary': "### Courbe d'indifférence\nEnsemble des paniers donnant le même niveau d'utilité.\n\n### TMS\nTMS = -ΔY/ΔX. Il mesure combien on est prêt à sacrifier de Y pour 1 unité de X.\n\n### Propriétés\n- Décroissantes\n- Convexes\n- Ne se croisent jamais",
                  'quiz': [
                      {'text': "Le TMS mesure :", 'options': ['Le coût de production', 'Le sacrifice de Y pour 1 X de plus', 'Le prix du marché', 'L\'utilité totale'], 'answer': 'Le sacrifice de Y pour 1 X de plus', 'explanation': "Le TMS mesure la substitution entre deux biens."},
                  ]},
                 {'title': "Contrainte budgétaire et optimum", 'num': 3, 'objectives': "Déterminer l'équilibre du consommateur.",
                  'summary': "### Contrainte budgétaire\nR = Px·X + Py·Y → droite de budget.\n\n### Optimum\nAu point de tangence : TMS = Px/Py.\nLe consommateur maximise U sous sa contrainte de revenu.",
                  'quiz': [
                      {'text': "L'équilibre du consommateur est atteint quand :", 'options': ['U = 0', 'TMS = Px/Py', 'Um = 0', 'X = Y'], 'answer': 'TMS = Px/Py', 'explanation': "Au point de tangence, TMS égale le rapport des prix."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'ECO-102', 'title': 'Macroéconomie I', 'level': 'L1', 'department': 'FASEG', 'program': 'ECO',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Comprendre les agrégats macroéconomiques et le circuit keynésien.",
        'description': "PIB, inflation, chômage, politiques budgétaire et monétaire.",
        'sessions': [
            {'title': "Les agrégats macroéconomiques", 'num': 1, 'minutes': 45,
             'objective': "Définir PIB, PNB, inflation, chômage.",
             'description': "Introduction aux grands indicateurs économiques.",
             'chapters': [
                 {'title': "Le PIB et sa mesure", 'num': 1, 'objectives': "Calculer le PIB par les 3 approches.",
                  'summary': "### PIB\nValeur des biens et services produits sur le territoire pendant 1 an.\n\n### 3 approches\n- **Production** : somme des VA\n- **Dépense** : C + I + G + (X - M)\n- **Revenu** : somme des revenus distribués",
                  'quiz': [
                      {'text': "Le PIB par les dépenses est :", 'options': ['C + I + G + (X - M)', 'C + I + G', 'X - M', 'Somme des revenus'], 'answer': 'C + I + G + (X - M)', 'explanation': "Formule classique du PIB par la demande agrégée."},
                  ]},
             ]},
            {'title': "Le circuit keynésien", 'num': 2, 'minutes': 50,
             'objective': "Comprendre la relation revenu-consommation et l'effet multiplicateur.",
             'description': "Analyse keynésienne du revenu national.",
             'chapters': [
                 {'title': "Fonction de consommation", 'num': 1, 'objectives': "Maîtriser la PMC et la PMS.",
                  'summary': "### Fonction keynésienne\nC = c₀ + c·Y\n- c = propension marginale à consommer (0 < c < 1)\n- c₀ = consommation incompressible\n\n### PMC + PMS = 1",
                  'quiz': [
                      {'text': "La PMC est comprise entre :", 'options': ['-1 et 0', '0 et 1', '1 et 2', 'Au-delà de 2'], 'answer': '0 et 1', 'explanation': "La propension marginale à consommer est toujours entre 0 et 1."},
                  ]},
                 {'title': "Le multiplicateur keynésien", 'num': 2, 'objectives': "Calculer l'effet d'une injection sur le revenu.",
                  'summary': "### Multiplicateur\nk = 1 / (1 - c) = 1 / s\n\n### Interprétation\nUne injection de 100 F augmente le revenu de 100 × k F.\nPlus la PMC est élevée, plus le multiplicateur est grand.",
                  'quiz': [
                      {'text': "Si PMC = 0,8, le multiplicateur est :", 'options': ['2', '3', '5', '10'], 'answer': '5', 'explanation': "k = 1/(1-0,8) = 1/0,2 = 5."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'ECO-201', 'title': 'Économie du Développement', 'level': 'L2', 'department': 'FASEG', 'program': 'ECO',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Analyser les théories du développement et les cas africains.",
        'description': "Théories, indicateurs et politiques de développement en Afrique subsaharienne.",
        'sessions': [
            {'title': "Théories du développement", 'num': 1, 'minutes': 45,
             'objective': "Comparer croissance et développement.",
             'description': "Des classiques aux théories contemporaines.",
             'chapters': [
                 {'title': "Croissance vs Développement", 'num': 1, 'objectives': "Distinguer les deux notions.",
                  'summary': "### Croissance\nAugmentation soutenue du PIB sur longue période.\n\n### Développement\nAmélioration durable du bien-être : santé, éducation, égalité.\n\n### Indicateurs\n- PIB/hab (croissance)\n- IDH (développement)\n- IPH, coefficient de Gini",
                  'quiz': [
                      {'text': "L'IDH mesure :", 'options': ['Le PIB', 'Le développement humain', 'Le chômage', 'L\'inflation'], 'answer': 'Le développement humain', 'explanation': "L'IDH combine santé, éducation et niveau de vie."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'GEST-101', 'title': 'Comptabilité Générale', 'level': 'L1', 'department': 'FASEG', 'program': 'GEST',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser le système comptable SYSCOHADA révisé.",
        'description': "Enregistrement des opérations, bilan et compte de résultat.",
        'sessions': [
            {'title': "Les principes comptables", 'num': 1, 'minutes': 45,
             'objective': "Connaître les principes fondamentaux.",
             'description': "Introduction au SYSCOHADA révisé.",
             'chapters': [
                 {'title': "Principes et plan comptable", 'num': 1, 'objectives': "Mémoriser les 9 principes et les classes de comptes.",
                  'summary': "### Principes\n- Prudence\n- Permanence des méthodes\n- Coût historique\n- Continuité d'exploitation\n- Spécialisation des exercices\n- Intangibilité du bilan\n- Non-compensation\n- Transparence\n- Importance significative\n\n### 9 classes de comptes\nClasse 1 à 9 (capitaux, immobilisations, stocks, tiers, financiers, charges, produits, autres, analytique).",
                  'quiz': [
                      {'text': "La comptabilité SYSCOHADA est utilisée en :", 'options': ['Europe', 'Afrique francophone', 'Asie', 'Amérique'], 'answer': 'Afrique francophone', 'explanation': "Le SYSCOHADA est le référentiel comptable OHADA."},
                  ]},
             ]},
            {'title': "Le bilan comptable", 'num': 2, 'minutes': 45,
             'objective': "Lire et construire un bilan.",
             'description': "Actif, passif et équilibre du bilan.",
             'chapters': [
                 {'title': "Structure de l'actif et du passif", 'num': 1, 'objectives': "Classer les postes du bilan.",
                  'summary': "### Actif (emplois)\n- Actif immobilisé (classe 2)\n- Actif circulant (classes 3, 4, 5)\n- Trésorerie-actif (classe 5)\n\n### Passif (ressources)\n- Capitaux propres (classe 1)\n- Dettes financières (classe 1)\n- Passif circulant (classes 4)\n- Trésorerie-passif (classe 5)\n\n### Équilibre\nActif = Passif",
                  'quiz': [
                      {'text': "L'actif immobilisé correspond à :", 'options': ['Classe 2', 'Classe 3', 'Classe 5', 'Classe 6'], 'answer': 'Classe 2', 'explanation': "Les immobilisations sont en classe 2."},
                  ]},
             ]},
        ],
    },

    # ===== FDS — Informatique =====
    {
        'code': 'INF-101', 'title': 'Algorithmique et Programmation', 'level': 'L1', 'department': 'FDS', 'program': 'INFO',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser la logique algorithmique et les structures de base.",
        'description': "Algorithmes, structures de contrôle, tableaux et fonctions.",
        'sessions': [
            {'title': "Introduction aux algorithmes", 'num': 1, 'minutes': 45,
             'objective': "Définir un algorithme et ses propriétés.",
             'description': "Notion d'algorithme et représentation.",
             'chapters': [
                 {'title': "Définitions et propriétés", 'num': 1, 'objectives': "Reconnaître un algorithme valide.",
                  'summary': "### Algorithme\nSuite finie d'instructions permettant de résoudre un problème.\n\n### Propriétés\n- **Finitude** : se termine en un nombre fini d'étapes\n- **Déterminisme** : mêmes entrées → mêmes sorties\n- **Généralité** : résout une classe de problèmes\n- **Efficacité** : ressources raisonnables",
                  'quiz': [
                      {'text': "Un algorithme doit être :", 'options': ['Infini', 'Fini et déterministe', 'Aléatoire', 'Récursif'], 'answer': 'Fini et déterministe', 'explanation': "Finitude et déterminisme sont des propriétés essentielles."},
                  ]},
                 {'title': "Structures de contrôle", 'num': 2, 'objectives': "Utiliser si/sinon, tant que, pour.",
                  'summary': "### Condition\nSi condition alors ... Sinon ... FinSi\n\n### Boucle tant que\nTantQue condition Faire ... FinTantQue\n\n### Boucle pour\nPour i de 1 à n Faire ... FinPour",
                  'quiz': [
                      {'text': "Quelle boucle s'exécute au moins une fois ?", 'options': ['TantQue', 'Pour', 'Répéter...Jusqu\'à', 'Aucune'], 'answer': 'Répéter...Jusqu\'à', 'explanation': "La boucle Répéter teste la condition à la fin."},
                  ]},
             ]},
            {'title': "Tableaux et fonctions", 'num': 2, 'minutes': 45,
             'objective': "Manipuler tableaux et procédures.",
             'description': "Structures de données de base.",
             'chapters': [
                 {'title': "Tableaux à une dimension", 'num': 1, 'objectives': "Déclarer, remplir, parcourir un tableau.",
                  'summary': "### Déclaration\nTableau T[1..N] de type\n\n### Accès\nT[i] pour i de 1 à N\n\n### Parcours\nPour i de 1 à N Faire ... FinPour",
                  'quiz': [
                      {'text': "L'accès au i-ème élément d'un tableau T se fait par :", 'options': ['T[i]', 'T.i', 'T->i', 'T(i)'], 'answer': 'T[i]', 'explanation': "La notation T[i] est standard en algorithmique."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'INF-201', 'title': 'Bases de Données Relationnelles', 'level': 'L2', 'department': 'FDS', 'program': 'INFO',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser le modèle relationnel et le langage SQL.",
        'description': "Modélisation, algèbre relationnelle et SQL.",
        'sessions': [
            {'title': "Le modèle relationnel", 'num': 1, 'minutes': 45,
             'objective': "Comprendre tables, clés et contraintes.",
             'description': "Bases du modèle relationnel.",
             'chapters': [
                 {'title': "Tables, clés et intégrité", 'num': 1, 'objectives': "Identifier les clés primaires et étrangères.",
                  'summary': "### Relation = Table\nLigne = tuple, colonne = attribut.\n\n### Clés\n- **Primaire** : identifie de manière unique\n- **Étrangère** : référence une autre table\n\n### Contraintes\n- NOT NULL\n- UNIQUE\n- CHECK",
                  'quiz': [
                      {'text': "Une clé primaire est :", 'options': ['Unique et non nulle', 'Toujours numérique', 'Facultative', 'Multiple par table'], 'answer': 'Unique et non nulle', 'explanation': "La clé primaire identifie chaque ligne de manière unique."},
                  ]},
             ]},
            {'title': "SQL — Requêtes de base", 'num': 2, 'minutes': 50,
             'objective': "Écrire des SELECT simples et avec jointures.",
             'description': "SELECT, WHERE, JOIN, GROUP BY.",
             'chapters': [
                 {'title': "SELECT et filtres", 'num': 1, 'objectives': "Écrire des requêtes simples.",
                  'summary': "### SELECT\nSELECT colonnes FROM table WHERE condition;\n\n### Opérateurs\n=, <>, <, >, LIKE, IN, BETWEEN\n\n### Tri\nORDER BY col ASC|DESC",
                  'quiz': [
                      {'text': "Quel mot-clé filtre les résultats ?", 'options': ['WHERE', 'ORDER BY', 'GROUP BY', 'HAVING'], 'answer': 'WHERE', 'explanation': "WHERE filtre les lignes avant regroupement."},
                  ]},
                 {'title': "Jointures", 'num': 2, 'objectives': "Combiner plusieurs tables.",
                  'summary': "### INNER JOIN\nSELECT * FROM A INNER JOIN B ON A.id = B.a_id;\n\n### LEFT JOIN\nGarde les lignes de gauche même sans correspondance.\n\n### RIGHT JOIN\nGarde les lignes de droite.",
                  'quiz': [
                      {'text': "Quelle jointure garde toutes les lignes de gauche ?", 'options': ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'], 'answer': 'LEFT JOIN', 'explanation': "LEFT JOIN conserve la table de gauche."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'MTH-101', 'title': 'Analyse Mathématique I', 'level': 'L1', 'department': 'FDS', 'program': 'MATH',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser les suites, limites et continuité.",
        'description': "Suites numériques, limites et fonctions continues.",
        'sessions': [
            {'title': "Suites numériques", 'num': 1, 'minutes': 45,
             'objective': "Étudier la convergence d'une suite.",
             'description': "Convergence, monotonie, suites classiques.",
             'chapters': [
                 {'title': "Convergence et limites", 'num': 1, 'objectives': "Déterminer si une suite converge.",
                  'summary': "### Convergence\n(uₙ) converge vers L si ∀ε>0, ∃N, ∀n≥N : |uₙ - L| < ε.\n\n### Théorèmes\n- Suite croissante majorée → converge\n- Suite décroissante minorée → converge\n\n### Suites classiques\n- uₙ = 1/n → 0\n- uₙ = qⁿ → 0 si |q|<1",
                  'quiz': [
                      {'text': "Une suite croissante majorée :", 'options': ['Diverge', 'Converge', 'Est constante', 'N\'existe pas'], 'answer': 'Converge', 'explanation': "Théorème de la convergence monotone."},
                  ]},
             ]},
        ],
    },

    # ===== FDD — Droit =====
    {
        'code': 'DRO-101', 'title': 'Introduction au Droit', 'level': 'L1', 'department': 'FDD', 'program': 'DPRI',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Comprendre les fondements du droit et les sources juridiques.",
        'description': "Notion de droit, sources, organisation judiciaire.",
        'sessions': [
            {'title': "La notion de droit", 'num': 1, 'minutes': 45,
             'objective': "Distinguer droit objectif et subjectif.",
             'description': "Définitions et branches du droit.",
             'chapters': [
                 {'title': "Droit objectif vs droit subjectif", 'num': 1, 'objectives': "Distinguer les deux notions.",
                  'summary': "### Droit objectif\nEnsemble des règles juridiques qui régissent la vie en société.\n\n### Droit subjectif\nPrérogatives reconnues à un sujet par le droit objectif (ex: droit de propriété).\n\n### Branches\n- Droit public (constitutionnel, administratif)\n- Droit privé (civil, commercial, pénal)",
                  'quiz': [
                      {'text': "Le droit de propriété est un droit :", 'options': ['Objectif', 'Subjectif', 'Public', 'Pénal'], 'answer': 'Subjectif', 'explanation': "C'est une prérogative individuelle reconnue par le droit objectif."},
                  ]},
             ]},
            {'title': "Les sources du droit", 'num': 2, 'minutes': 45,
             'objective': "Hiérarchiser les sources juridiques.",
             'description': "Constitution, traités, lois, règlements, coutume.",
             'chapters': [
                 {'title': "Hiérarchie des normes", 'num': 1, 'objectives': "Ordonner les sources de Kelsen.",
                  'summary': "### Pyramide de Kelsen\n1. Constitution\n2. Traités internationaux\n3. Lois organiques\n4. Lois ordinaires\n5. Règlements (décrets, arrêtés)\n6. Coutume et jurisprudence\n\nChaque norme doit respecter celle du dessus.",
                  'quiz': [
                      {'text': "Quelle est la norme suprême ?", 'options': ['La loi', 'La Constitution', 'Le décret', 'L\'arrêté'], 'answer': 'La Constitution', 'explanation': "La Constitution est au sommet de la hiérarchie des normes."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'DRO-201', 'title': 'Droit Constitutionnel', 'level': 'L2', 'department': 'FDD', 'program': 'DPUB',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Comprendre l'organisation de l'État et des pouvoirs.",
        'description': "Séparation des pouvoirs, régimes politiques, Constitution togolaise.",
        'sessions': [
            {'title': "L'État et la Constitution", 'num': 1, 'minutes': 45,
             'objective': "Définir l'État et le rôle de la Constitution.",
             'description': "Éléments constitutifs de l'État.",
             'chapters': [
                 {'title': "Les éléments constitutifs de l'État", 'num': 1, 'objectives': "Identifier les 3 éléments.",
                  'summary': "### 3 éléments\n1. **Territoire**\n2. **Population**\n3. **Souveraineté**\n\n### Rôle de la Constitution\nOrganiser les pouvoirs, garantir les droits fondamentaux.",
                  'quiz': [
                      {'text': "Combien d'éléments constituent l'État ?", 'options': ['2', '3', '4', '5'], 'answer': '3', 'explanation': "Territoire, population, souveraineté."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'DRO-301', 'title': 'Droit des Obligations', 'level': 'L3', 'department': 'FDD', 'program': 'DPRI',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser le régime du contrat et de la responsabilité civile.",
        'description': "Formation, exécution et extinction des obligations.",
        'sessions': [
            {'title': "Le contrat", 'num': 1, 'minutes': 45,
             'objective': "Maîtriser les conditions de validité.",
             'description': "Formation du contrat et vices du consentement.",
             'chapters': [
                 {'title': "Conditions de validité", 'num': 1, 'objectives': "Identifier les 4 conditions.",
                  'summary': "### 4 conditions (art. 1108 ancien C.civ.)\n1. **Consentement** libre et éclairé\n2. **Capacité** des parties\n3. **Objet** certain et licite\n4. **Cause** licite\n\n### Vices du consentement\n- Erreur\n- Dol\n- Violence",
                  'quiz': [
                      {'text': "Quel n'est pas un vice du consentement ?", 'options': ['Erreur', 'Dol', 'Violence', 'Silence'], 'answer': 'Silence', 'explanation': "Le silence n'est pas un vice du consentement en droit français/OHADA."},
                  ]},
             ]},
        ],
    },

    # ===== FLLA — Anglais =====
    {
        'code': 'ANG-101', 'title': 'English Grammar & Composition', 'level': 'L1', 'department': 'FLLA', 'program': 'ANG',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Master English tenses, syntax, and academic writing.",
        'description': "Tenses, reported speech, essay writing.",
        'sessions': [
            {'title': "Tenses Overview", 'num': 1, 'minutes': 45,
             'objective': "Master the 12 English tenses.",
             'description': "Present, past, future in simple, continuous, perfect forms.",
             'chapters': [
                 {'title': "Present Tenses", 'num': 1, 'objectives': "Use present simple, continuous, perfect correctly.",
                  'summary': "### Present Simple\nHabitual actions: I work every day.\n\n### Present Continuous\nActions in progress: I am working now.\n\n### Present Perfect\nPast action with present relevance: I have worked here for 3 years.",
                  'quiz': [
                      {'text': "\"I ___ here since 2020.\"", 'options': ['work', 'am working', 'have worked', 'worked'], 'answer': 'have worked', 'explanation': "Since indicates present perfect."},
                  ]},
             ]},
            {'title': "Academic Writing", 'num': 2, 'minutes': 45,
             'objective': "Write structured academic essays.",
             'description': "Essay structure and linking words.",
             'chapters': [
                 {'title': "Essay Structure", 'num': 1, 'objectives': "Master intro-body-conclusion.",
                  'summary': "### Structure\n1. **Introduction** : hook + thesis statement\n2. **Body** : 2-3 paragraphs with topic sentences\n3. **Conclusion** : restate thesis + broader implication\n\n### Linking words\nHowever, therefore, moreover, furthermore, in conclusion.",
                  'quiz': [
                      {'text': "A thesis statement is found in :", 'options': ['Introduction', 'Body', 'Conclusion', 'Title'], 'answer': 'Introduction', 'explanation': "The thesis statement is in the introduction."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'ANG-201', 'title': 'British Literature', 'level': 'L2', 'department': 'FLLA', 'program': 'ANG',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Study major British literary movements and authors.",
        'description': "From Shakespeare to the Modernists.",
        'sessions': [
            {'title': "The Renaissance", 'num': 1, 'minutes': 45,
             'objective': "Understand the Elizabethan era.",
             'description': "Shakespeare and his contemporaries.",
             'chapters': [
                 {'title': "Shakespeare's Theatre", 'num': 1, 'objectives': "Identify Shakespeare's major works.",
                  'summary': "### William Shakespeare (1564-1616)\n- **Tragedies** : Hamlet, Macbeth, Othello, King Lear\n- **Comedies** : A Midsummer Night's Dream, Twelfth Night\n- **Histories** : Henry V, Richard III\n\n### The Globe Theatre\nOpen-air theatre in London, built in 1599.",
                  'quiz': [
                      {'text': "Which is a Shakespearean tragedy?", 'options': ['Hamlet', 'Twelfth Night', 'Henry V', 'The Tempest'], 'answer': 'Hamlet', 'explanation': "Hamlet is a tragedy. Twelfth Night is a comedy."},
                  ]},
             ]},
        ],
    },
    {
        'code': 'LIN-101', 'title': 'Introduction à la Linguistique', 'level': 'L1', 'department': 'FLLA', 'program': 'LIN',
        'semester': 'Semestre 1 (Harmattan)', 'price': 500, 'coefficient': 3, 'credit': 6,
        'objective': "Maîtriser les bases de la linguistique générale.",
        'description': "Phonétique, phonologie, morphologie, syntaxe.",
        'sessions': [
            {'title': "Les niveaux d'analyse", 'num': 1, 'minutes': 45,
             'objective': "Distinguer les niveaux linguistiques.",
             'description': "Phonème, morphème, syntagme, phrase.",
             'chapters': [
                 {'title': "Phonétique et phonologie", 'num': 1, 'objectives': "Distinguer phonème et son.",
                  'summary': "### Phonétique\nÉtude des sons physiques (phones).\n\n### Phonologie\nÉtude des phonèmes (unités distinctives).\n\n### Paire minimale\nDeux mots qui ne diffèrent que par un phonème : pain / bain.",
                  'quiz': [
                      {'text': "Une paire minimale distingue :", 'options': ['Deux morphèmes', 'Deux phonèmes', 'Deux phrases', 'Deux langues'], 'answer': 'Deux phonèmes', 'explanation': "Pain et bain ne diffèrent que par /p/ et /b/."},
                  ]},
             ]},
        ],
    },
]


class Command(BaseCommand):
    help = "Génère un jeu de données de test complet pour UL Study Flow."

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING("\n▶ Génération des données de test UL Study Flow\n"))

        # ===== Departments & Programs =====
        dept_map, prog_map = {}, {}
        for d in DEPARTMENTS:
            dept, _ = Department.objects.get_or_create(
                code=d['code'],
                defaults={
                    'id': gen_id('dept'),
                    'name': d['name'],
                    'faculty': d['faculty'],
                    'description': d['description'],
                }
            )
            dept_map[d['code']] = dept
            for p in d['programs']:
                prog, _ = Program.objects.get_or_create(
                    code=p['code'],
                    department=dept,
                    defaults={
                        'id': gen_id('prog'),
                        'name': p['name'],
                        'description': p['description'],
                    }
                )
                prog_map[p['code']] = prog
        self.stdout.write(f"  ✓ {len(dept_map)} départements, {len(prog_map)} filières")

        # ===== AcademicYear =====
        ay, _ = AcademicYear.objects.get_or_create(
            label='2025-2026',
            defaults={'id': gen_id('ay'), 'is_current': True, 'is_archived': False}
        )

        # ===== UE / Sessions / Chapters / Quizzes =====
        ue_created = sess_created = chap_created = quiz_created = 0

        for ue_data in UES:
            dept = dept_map.get(ue_data['department'])
            prog = prog_map.get(ue_data['program'])
            if not dept or not prog:
                continue

            ue, created = UE.objects.get_or_create(
                code=ue_data['code'],
                defaults={
                    'id': gen_id('ue'),
                    'title': ue_data['title'],
                    'description': ue_data['description'],
                    'objective': ue_data['objective'],
                    'department': dept,
                    'program': prog,
                    'level': ue_data['level'],
                    'semester': ue_data['semester'],
                    'academic_year': ay.label,
                    'is_published': True,
                    'price_fcfa': ue_data['price'],
                    'coefficient': ue_data['coefficient'],
                    'credit_ects': ue_data['credit'],
                }
            )
            if not created:
                continue
            ue_created += 1

            for s_data in ue_data['sessions']:
                sess, s_created = Session.objects.get_or_create(
                    ue=ue, session_number=s_data['num'],
                    defaults={
                        'id': gen_id('sess'),
                        'title': s_data['title'],
                        'description': s_data['description'],
                        'objective': s_data['objective'],
                        'estimated_minutes': s_data['minutes'],
                        'order': s_data['num'],
                        'is_published': True,
                        'is_locked_for_users': True if s_data['num'] > 1 else False,
                    }
                )
                if s_created:
                    sess_created += 1

                for c_data in s_data.get('chapters', []):
                    chap, c_created = Chapter.objects.get_or_create(
                        session=sess, number=c_data['num'],
                        defaults={
                            'id': gen_id('chap'),
                            'title': c_data['title'],
                            'objectives': c_data['objectives'],
                            'order': c_data['num'],
                            'summary_text': c_data['summary'],
                            'flashcards': [
                                {'id': gen_id('fc'), 'front': f"Notion clé : {c_data['title']}",
                                 'back': "À compléter à partir du résumé du cours.",
                                 'category': 'Notion fondamentale'},
                            ],
                        }
                    )
                    if not c_created:
                        continue
                    chap_created += 1

                    quiz_data = c_data.get('quiz') or []
                    if quiz_data:
                        quiz, q_created = Quiz.objects.get_or_create(
                            chapter=chap,
                            defaults={
                                'id': gen_id('quiz'),
                                'title': f"QCM — {c_data['title']}",
                                'description': "Auto-évaluation du chapitre.",
                                'passing_score_percent': 70,
                            }
                        )
                        if q_created:
                            quiz_created += 1
                            for idx, q in enumerate(quiz_data):
                                QuizQuestion.objects.create(
                                    id=gen_id('q'),
                                    quiz=quiz,
                                    text=q['text'],
                                    question_type='single',
                                    options=q['options'],
                                    correct_answer=q['answer'],
                                    explanation=q['explanation'],
                                    points=1,
                                    order=idx + 1,
                                )

        self.stdout.write(f"  ✓ {ue_created} UE, {sess_created} séances, {chap_created} chapitres, {quiz_created} QCM")

        # ===== Formulaires =====
        forms_data = [
            {
                'title': "Enquête de satisfaction",
                'description': "Aidez-nous à améliorer UL StudyFlow.",
                'theme_color': "#25D366",
                'fields': [
                    {'id': 'f_1', 'label': "Nom complet", 'type': 'text', 'required': True, 'order': 1},
                    {'id': 'f_2', 'label': "Téléphone", 'type': 'phone', 'required': True, 'order': 2},
                    {'id': 'f_3', 'label': "Niveau de satisfaction", 'type': 'emoji_rating', 'required': True,
                     'options': ['😡', '🙁', '😐', '😊', '🤩'], 'order': 3},
                    {'id': 'f_4', 'label': "Suggestions", 'type': 'textarea', 'required': False, 'order': 4},
                ],
            },
            {
                'title': "Inscription au tutorat",
                'description': "Inscrivez-vous aux séances de tutorat en ligne.",
                'theme_color': "#075E54",
                'fields': [
                    {'id': 'f_1', 'label': "Nom complet", 'type': 'text', 'required': True, 'order': 1},
                    {'id': 'f_2', 'label': "Téléphone", 'type': 'phone', 'required': True, 'order': 2},
                    {'id': 'f_3', 'label': "UE souhaitées", 'type': 'options', 'required': True,
                     'options': ['ECO-101', 'MTH-101', 'INF-101', 'ANG-101'], 'order': 3},
                ],
            },
        ]
        forms_created = 0
        for f in forms_data:
            _, created = DynamicForm.objects.get_or_create(
                title=f['title'],
                defaults={
                    'id': gen_id('form'),
                    'description': f['description'],
                    'theme_color': f['theme_color'],
                    'is_active': True,
                    'fields': f['fields'],
                }
            )
            if created:
                forms_created += 1
        self.stdout.write(f"  ✓ {forms_created} formulaires")

        # ===== Moyens de paiement =====
        pm_created = 0
        for pm in [
            {'name': "T-Money Togo (*145#)", 'type': 'phone_account', 'account': "+228 71 67 69 45",
             'instructions': "Composez *145#, option transfert vers ce numéro.", 'order': 1},
            {'name': "Moov Flooz (*155#)", 'type': 'phone_account', 'account': "+228 99 70 59 20",
             'instructions': "Composez *155#, transfert d'argent.", 'order': 2},
        ]:
            _, created = PaymentMethod.objects.get_or_create(
                name=pm['name'],
                defaults={
                    'id': gen_id('pm'),
                    'method_type': pm['type'],
                    'account_number': pm['account'],
                    'instructions': pm['instructions'],
                    'order': pm['order'],
                    'is_active': True,
                }
            )
            if created:
                pm_created += 1
        self.stdout.write(f"  ✓ {pm_created} moyens de paiement")

        # ===== Config =====
        PlatformConfig.get_solo()

        # ===== Codes promo =====
        promo_created = 0
        for p in [
            {'code': 'BIENVENUE10', 'pct': 10, 'app': 'ue_unlock'},
            {'code': 'RENTREE2026', 'pct': 20, 'app': 'ue_unlock'},
            {'code': 'ETUDIANT30', 'pct': 30, 'app': 'all'},
        ]:
            _, created = PromoCode.objects.get_or_create(
                code=p['code'],
                defaults={
                    'id': gen_id('promo'),
                    'discount_percent': p['pct'],
                    'applicable_to': p['app'],
                    'is_active': True,
                    'created_by': 'seed',
                }
            )
            if created:
                promo_created += 1
        self.stdout.write(f"  ✓ {promo_created} codes promo")

        # ===== Popups =====
        popup_created = 0
        for pop in [
            {
                'title': "🎓 Bienvenue sur UL StudyFlow !",
                'message': "Découvrez vos cours, QCM et l'assistant IA.\nBon apprentissage !",
                'type': 'info', 'size': 'md', 'position': 'center',
                'accent': '#25D366', 'pages': ['home'],
                'audience': 'anonymous', 'trigger': 'after_delay', 'delay': 4,
                'frequency': 'once',
            },
            {
                'title': "📚 Nouveautés Semestre 1",
                'message': "Nouvelles UE disponibles pour FASEG, FDS, FDD et FLLA.",
                'type': 'announcement', 'size': 'md', 'position': 'bottom_right',
                'accent': '#075E54', 'pages': ['student_home'],
                'audience': 'students', 'trigger': 'on_load',
                'frequency': 'per_day',
            },
        ]:
            _, created = PopupCampaign.objects.get_or_create(
                title=pop['title'],
                defaults={
                    'id': gen_id('pop'),
                    'message': pop['message'],
                    'popup_type': pop['type'],
                    'media_type': 'none',
                    'size': pop['size'],
                    'position': pop['position'],
                    'accent_color': pop['accent'],
                    'animation': 'fade',
                    'is_dismissible': True,
                    'target_pages': pop['pages'],
                    'target_audience': pop['audience'],
                    'trigger_type': pop['trigger'],
                    'trigger_delay_seconds': pop.get('delay', 3),
                    'frequency': pop['frequency'],
                    'frequency_custom_hours': 24,
                    'is_active': True,
                    'priority': 0,
                    'created_by': 'seed',
                }
            )
            if created:
                popup_created += 1
        self.stdout.write(f"  ✓ {popup_created} popups")

        # ===== Codes de parrainage pour tous les users =====
        rc_created = 0
        for u in User.objects.filter(referral_code__isnull=True):
            try:
                ReferralCode.objects.create(user=u)
                rc_created += 1
            except Exception:
                pass
        self.stdout.write(f"  ✓ {rc_created} codes de parrainage")

        # ===== Accès UE auto pour les étudiants existants =====
        ua_created = 0
        for u in User.objects.filter(role='USER', is_active=True):
            matching = UE.objects.filter(is_published=True, is_suspended=False).filter(
                department__code=u.department
            ) | UE.objects.filter(is_published=True, is_suspended=False, level=u.level)
            for ue in matching.distinct()[:4]:
                _, created = UserUEAccess.objects.get_or_create(
                    user=u, ue=ue,
                    defaults={
                        'id': gen_id('acc'),
                        'granted_by': 'seed',
                        'status': 'active',
                        'expires_at': timezone.now() + timedelta(days=200),
                    }
                )
                if created:
                    ua_created += 1
        self.stdout.write(f"  ✓ {ua_created} accès UE accordés aux étudiants existants")

        self.stdout.write(self.style.SUCCESS("\n✅ Données de test générées avec succès.\n"))