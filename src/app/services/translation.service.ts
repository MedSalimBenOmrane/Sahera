import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'fr' | 'en';

type TranslationValue = string | string[];

type Translations = Record<Lang, Record<string, TranslationValue>>;

const STORAGE_KEY = 'app-language';

const translations: Translations = {
  fr: {
    // Navbar
    'navbar.myResponses': 'Mes réponses',
    'navbar.questionnaire': 'Questionnaire',
    'navbar.notifications': 'Notifications',
    'navbar.account': 'Compte',
    'navbar.editProfile': 'Modifier mes coordonnées',
    'navbar.logout': 'Se déconnecter',
    'navbar.language.fr': 'FR',
    'navbar.language.en': 'EN',
    'navbar.profileTitle': 'Modifier mes coordonnées',
    'navbar.loading': 'Chargement…',
    'navbar.save': 'Enregistrer les changements',
    'navbar.logoutSuccess': 'Déconnexion réussie.',
    'navbar.error.loadProfile': 'Impossible de charger vos données.',
    'navbar.error.updateProfile': 'Erreur lors de la mise à jour.',

    // Footer
    'footer.social': 'Nos réseaux',
    'footer.copyright': '© 2024 . All rights reserved.',

    // Layout
    'layout.notifications': 'Notifications',

    // Landing
    'landing.title': 'Soulager les douleurs menstruelles et les fluctuations hormonales des femmes',
    'landing.subtitle': 'Une solution naturelle pour reprendre le pouvoir sur votre cycle et sur votre vie.',
    'landing.cta': 'Se connecter',

    // Auth / Login
    'auth.signup.title': 'Inscription',
    'auth.signup.name': 'Nom',
    'auth.signup.firstName': 'Prénom',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Mot de passe',
    'auth.signup.phone': 'Téléphone',
    'auth.signup.birthDate': 'Date de naissance',
    'auth.signup.genderLabel': 'Sexe :',
    'auth.signup.gender.female': 'Femme',
    'auth.signup.gender.male': 'Homme',
    'auth.signup.ethnicity': 'Ethnicité',
    'auth.signup.submit': 'S\'inscrire',
    'auth.login.title': 'Connexion',
    'auth.login.admin': 'Se connecter en tant qu’admin',
    'auth.login.submit': 'Se connecter',
    'auth.login.forgot': 'Mot de passe oublié ?',
    'auth.slide.0': 'SaHera',
    'auth.slide.1': 'Auriculothérapie et Intelligence Artificielle.',
    'auth.consent.title': 'Consentement éclairé et vérification',
    'auth.consent.intro': 'Consentement éclairé et engagement de participation',
    'auth.consent.projectTitle': 'Titre du projet',
    'auth.consent.projectName': 'Étude sur l’expérience d’utilisation d’un dispositif d’acupression auriculaire pour le soulagement des symptômes généraux de la périménopause, des troubles du cycle menstruel et du stress',
    'auth.consent.goal': 'Objectif du projet',
    'auth.consent.goalText': 'Ce projet vise à comprendre comment ce dispositif favorise le mieux-être de ses utilisatrices. Plus précisément, il cherche à évaluer le confort d’utilisation, la facilité d’intégration à la routine quotidienne et les effets ressentis sur des symptômes tels que les douleurs cycliques, les tensions musculaires, les troubles du sommeil, ou les variations d’humeur associées au stress ou aux changements hormonaux.',
    'auth.consent.data': 'Renseignements recueillis',
    'auth.consent.dataText': 'Nous collectons vos coordonnées de base (nom, prénom, âge, genre, origine ethnique et courriel) afin d’assurer le suivi de votre participation, de vous transmettre les questionnaires d’évaluation et de recueillir vos commentaires sur le dispositif. Ces informations soutiennent la validation scientifique du dispositif et la production des analyses globales menées auprès de la cohorte participante.',
    'auth.consent.questionnaires': 'Les questionnaires portent sur votre expérience d’utilisation : confort du dispositif, fréquence d’usage, contexte, effets perçus sur les douleurs, le sommeil, le stress et le bien-être général, ainsi que votre satisfaction globale.',
    'auth.consent.security': 'Sécurité et confidentialité : Toutes les données sont conservées sur des serveurs sécurisés, conformément à la Loi 25 sur la protection des renseignements personnels au Québec. Lors de l’analyse, l’ensemble des données sera anonymisé pour garantir la confidentialité des participantes.',
    'auth.consent.partnership': 'Engagement et relation de partenariat',
    'auth.consent.partnershipText': 'En recevant ce dispositif gratuitement, vous devenez partenaire actif du projet. Votre participation contribue directement à la validation scientifique et à l’amélioration du dispositif. Nous souhaitons également vous tenir informée des rapports d’analyse et de validation scientifique issus de cette étude, afin que vous puissiez suivre les résultats collectifs de la cohorte et les avancées du projet. À ce titre, vous consentez également à recevoir notre newsletter, qui vous transmettra périodiquement des nouvelles du projet, les résultats d’étape et des informations complémentaires sur les activités de recherche et de développement. Si vous décidez d’interrompre votre participation, vous vous engagez à retourner le dispositif, afin de permettre le respect du protocole d’étude.',
    'auth.consent.duration': 'Durée, moments d’évaluation et retrait',
    'auth.consent.durationText': 'Votre participation dure environ une année, à compter de la date où vous avez reçu le dispositif. Afin de suivre l’évolution de votre expérience dans le temps, deux évaluations vous seront demandées :',
    'auth.consent.duration6': 'Une première après 6 mois d’utilisation continue.',
    'auth.consent.duration12': 'Une seconde après 12 mois, au terme de votre participation.',
    'auth.consent.durationEnd': 'Chaque évaluation consiste à remplir le même formulaire de suivi (questionnaire sur le confort, les effets ressentis et la satisfaction). Ces deux temps de réponse permettront d’évaluer l’évolution des effets perçus au fil du temps et de renforcer la valeur scientifique des résultats du projet.',
    'auth.consent.contact': 'Pour toute question ou pour retirer votre consentement, écrivez-nous à :',
    'auth.consent.email': 'info@sahera.ca',
    'auth.consent.withdraw': 'En cas de retrait, vous devrez restituer le dispositif fourni.',
    'auth.consent.subtitle': 'Consentement',
    'auth.consent.check': 'Oui, je consens à participer à l’étude, j’accepte les conditions de participation et de retour du dispositif, et j’accepte de recevoir la newsletter d’information relative à cette étude.',
    'auth.consent.otpTitle': 'Entrez le code envoyé à votre email',
    'auth.consent.verify': 'Vérifier',
    'auth.consent.resend': 'Renvoyer code',
    'auth.forgot.title': 'Réinitialiser le mot de passe',
    'auth.forgot.send': 'Envoyer le code',
    'auth.forgot.verify': 'Vérifier',
    'auth.forgot.resend': 'Renvoyer code',
    'auth.forgot.save': 'Enregistrer',
    'auth.forgot.newPassword': 'Nouveau mot de passe',
    'auth.forgot.confirmPassword': 'Confirmer le mot de passe',
    'auth.toast.required': 'Champ obligatoire',
    'auth.toast.invalidEmail': 'Le format de l’email est invalide.',
    'auth.toast.emailTitle': 'Email incorrect',
    'auth.toast.shortPassword': 'Le mot de passe doit contenir au moins 8 caractères.',
    'auth.toast.passwordTitle': 'Mot de passe trop court',
    'auth.toast.phoneInvalid': 'Le numéro de téléphone doit contenir uniquement des chiffres.',
    'auth.toast.errorTitle': 'Erreur',
    'auth.toast.fixErrors': 'Veuillez corriger les erreurs avant de soumettre.',
    'auth.toast.errorGeneric': 'Veuillez renseigner tous les champs.',
    'auth.toast.signinTitle': 'Erreur d’authentification',
    'auth.toast.signupSent': 'Un code vous a été envoyé.',
    'auth.toast.resend': 'Nouveau code envoyé.',
    'auth.toast.verifyCodeError': 'Erreur lors de l’envoi du code.',
    'auth.toast.verifyCode': 'Vérification',
    'auth.toast.signupCreated': 'Compte créé ✔.',
    'auth.toast.signupSuccess': 'Succès',
    'auth.toast.codeIncomplete': 'Code incomplet.',
    'auth.toast.loginSuccess': 'Connexion réussie.',
    'auth.toast.loginSuccessTitle': 'Succès',
    'auth.toast.loginFailed': 'Email ou mot de passe incorrect.',
    'auth.slideshow.label': 'Diaporama décoratif',
    'auth.error.emailRequired': 'L’email est requis.',
    'auth.error.requestCodeFirst': 'Demandez d’abord un code.',
    'auth.error.codeIncomplete': 'Code incomplet.',
    'auth.error.passwordLength': 'Le mot de passe doit contenir au moins 8 caractères.',
    'auth.error.passwordMismatch': 'Les mots de passe ne correspondent pas.',
    'auth.error.tokenMissing': 'Token manquant, recommencez le processus.',
    'auth.error.savePassword': 'Impossible d’enregistrer le nouveau mot de passe.',

    // Mes réponses
    'answers.title': 'Mes Réponses :',
    'answers.tabs.all': 'Tous',
    'answers.tabs.completed': 'Complétés',
    'answers.tabs.incomplete': 'Incomplétés',
    'answers.loading': 'Chargement…',
    'answers.empty': 'Aucune donnée à afficher pour cet onglet.',
    'answers.pagination.prev': 'Précédent',
    'answers.pagination.next': 'Suivant',

    // Questionnaire list
    'questionnaire.title': 'Questionnaire à Faire :',
    'questionnaire.emptyLead': 'Vous n’avez aucun questionnaire disponible pour le moment.',
    'questionnaire.emptyTitle': 'Aucun questionnaire',
    'pagination.prev': 'Précédent',
    'pagination.next': 'Suivant',

    // Card
    'card.status.open': 'Ouvert',
    'card.status.closed': 'Fermé',
    'card.published': 'Publié :',
    'card.until': 'jusqu’au :',
    'card.completed': 'Questionnaire complété',
    'card.pending': 'En attente de réponses',
    'card.modify': 'Modifier',
    'card.respond': 'Répondre',
    'card.sessionClosed': 'La session est fermée',

    // Notifications
    'notifications.title': 'Historique des Notifications :',
    'notifications.loading': 'Chargement...',
    'notifications.emptyLead': 'Vous n’avez aucune notification pour le moment.',
    'notifications.emptyTitle': 'Pas de notification',
    'notification.subject': 'Objet :',
    'notification.markAsRead': 'Marquer comme lue',

    // Q&A
    'qna.theme': 'Thème :',
    'qna.loadingSubthemes': 'Chargement des sous-thématiques…',
    'qna.questionsFor': 'Questions pour « {{title}} »',
    'qna.selectOption': 'Sélectionnez une option',
    'qna.enterAnswer': 'Saisissez votre réponse',
    'qna.chooseDate': 'Choisissez une date',
    'qna.noQuestions': 'Aucune question pour cette sous-thématique.',
    'qna.saveAnswers': 'Enregistrer les réponses',
    'qna.emptySubthemeLead': 'Aucune sous-thématique disponible.',
    'qna.emptySubthemeTitle': 'Pas de contenu',
    'qna.toast.none': 'Aucune question à enregistrer.',
    'qna.toast.missing': 'Veuillez renseigner chaque question.',
    'qna.toast.partial': 'Certaines réponses n’ont pas pu être enregistrées.',
    'qna.toast.saved': 'Vos réponses pour « {{title}} » ont été enregistrées.',

    // Admin navbar
    'admin.participants': 'Participants',
    'admin.questionnaires': 'Questionnaire',
    'admin.messages': 'Messages',

    // Admin participants
    'admin.participants.title': 'Liste des participants',
    'admin.filters.id': 'ID exact',
    'admin.filters.name': 'Nom (commence par...)',
    'admin.filters.firstname': 'Prénom (commence par...)',
    'admin.create': 'Créer',
    'admin.actions': 'Actions',
    'admin.table.id': 'ID',
    'admin.table.name': 'Nom',
    'admin.table.firstname': 'Prénom',
    'admin.table.email': 'Email',
    'admin.table.phone': 'Téléphone',
    'admin.table.birthdate': 'Date de naissance',
    'admin.table.gender': 'Genre',
    'admin.table.ethnicity': 'Ethnicité',
    'admin.table.role': 'Rôle',
    'admin.edit': 'Modifier',
    'admin.delete': 'Supprimer',
    'admin.saveChanges': 'enregistrer les Changements',
    'admin.createParticipant': 'Créer Participant',
    'admin.dialog.editTitle': 'modifier participant',
    'admin.dialog.createTitle': 'Créer nouveau participant',
    'admin.emptyFiltered': 'Aucun participant trouvé pour ces critères.',
    'admin.empty': 'Aucun participant pour le moment.',
    'admin.confirmDelete': 'Voulez-vous vraiment supprimer "{{name}}" ?',

    // Admin notifications
    'admin.notifications.title': 'Historique des Messages',
    'admin.notifications.send': 'Envoyer message',
    'admin.notifications.dialogTitle': 'Envoyer une Notification',
    'admin.notifications.subject': 'Objet :',
    'admin.notifications.message': 'Message :',
    'admin.notifications.placeholderTitle': 'Titre',
    'admin.notifications.placeholderMessage': 'Votre message',
    'admin.notifications.sendAction': 'Envoyer',
    'admin.notifications.cancel': 'Annuler',

    // Admin questionnaire generation
    'admin.thematiques.title': 'Liste des Thématiques',
    'admin.thematiques.emptyLead': 'Aucune thématique n’est disponible pour le moment.',
    'admin.thematiques.emptyTitle': 'Pas de questionnaire',
    'admin.thematiques.createTitle': 'Créer une Thématique',
    'admin.thematiques.titre': 'Titre :',
    'admin.thematiques.titreFr': 'Titre (FR)',
    'admin.thematiques.titreEn': 'Titre (EN)',
    'admin.thematiques.description': 'Description :',
    'admin.thematiques.descriptionFr': 'Description (FR)',
    'admin.thematiques.descriptionEn': 'Description (EN)',
    'admin.thematiques.openDate': 'Date d’ouverture :',
    'admin.thematiques.closeDate': 'Date de clôture :',
    'admin.thematiques.csv': 'Importer CSV :',
    'admin.thematiques.create': 'Creer',
    'admin.thematiques.wait': 'Patientez...',
    'admin.thematiques.errorPrefix': 'Erreur :',
    'admin.thematiques.errorGeneric': 'Une erreur est survenue pendant la création.',
    'admin.thematiques.drag': 'Glissez et d?posez',
    'admin.thematiques.or': 'ou',
    'admin.thematiques.browse': 'Parcourir un fichier CSV',

    // Admin qcard
    'admin.card.openDate': 'Date d\'Ouverture :',
    'admin.card.edit': 'Modifier',
    'admin.card.delete': 'Supprimer',
    'admin.card.viewResponses': 'Voir Réponse',
    'admin.card.editDialogTitle': 'Modifier la Thématique',
    'admin.card.title': 'Titre :',
    'admin.card.description': 'Description :',
    'admin.card.open': 'Date d’ouverture :',
    'admin.card.close': 'Date de clôture :',
    'admin.card.apply': 'Appliquer',
    'admin.card.dateOrderError': 'La date d’ouverture doit être antérieure ou égale à la date de clôture.',
    'admin.card.closedShort': 'Fermé',
    'admin.card.opensInDays': 'Ouvre dans {{days}} jours',
    'admin.card.opensTomorrow': 'Ouvre demain',
    'admin.card.daysLeft': '{{days}} jours restants',
    'admin.card.oneDayLeft': '1 jour restant',
    'admin.card.lastDay': 'Dernier jour',

    // Admin details
    'admin.details.title': 'Détails de la thématique « {{title}} »',
    'admin.details.subtheme': 'Sous-thématique',
    'admin.details.question': 'Question',
    'admin.details.answersCount': 'Nombre de réponses',
    'admin.details.view': 'Voir Réponse',
    'admin.details.analyze': 'Analyser',
    'admin.details.noQuestion': 'Aucune question',
    'admin.analysis.title': 'Analyse des réponses',
    'admin.analysis.question': 'Question :',
    'admin.analysis.chartTitle': 'Nombre de réponses par option',
    'admin.analysis.option': 'Option',
    'admin.analysis.answers': 'Réponses',
    'admin.thematiques.confirmDelete': 'Voulez-vous vraiment supprimer cette thématique ?',

    // Admin question details
    'admin.questionDetails.title': 'Détails de la question : « {{title}} »',
    'admin.questionDetails.userId': 'ID Utilisateur',
    'admin.questionDetails.name': 'Nom',
    'admin.questionDetails.firstname': 'Prénom',
    'admin.questionDetails.answer': 'Réponse',
    'admin.questionDetails.empty': 'Aucune réponse pour cette question.',
    'dashboard.progression': 'Progression des thématiques',
    'dashboard.incomplete': 'Non complété',
    'dashboard.complete': 'Complété',
    'dashboard.usersCount': 'Nombre d’utilisateurs',
    'dashboard.themeAxis': 'Thématique',
    'dashboard.ageDistributionTitle': 'Répartition par tranche d’âge',
    'dashboard.usersLabel': 'Nombre d’utilisateurs',
    'dashboard.ethnicityTitle': 'Distribution d’ethnicité par genre',
    'dashboard.gender.female': 'Femmes',
    'dashboard.gender.male': 'Hommes',
    'dashboard.genderDistributionTitle': 'Répartition par genre',
    'dashboard.analysis.responses': 'Analyse des réponses',
    'dashboard.analysis.count': 'Nombre de réponses',

    // Generic
    'generic.loading': 'Loading...',
    'generic.apply': 'Appliquer',
    'generic.close': 'Fermer',
    'generic.save': 'Enregistrer',

    // Option labels (values stay in FR for the API)
    'option.gender.female': 'Femme',
    'option.gender.male': 'Homme',
    'option.ethnicity.native': 'Amérindien ou Autochtone d’Alaska',
    'option.ethnicity.asian': 'Asiatique',
    'option.ethnicity.black': 'Noir ou Afro-Américain',
    'option.ethnicity.latino': 'Hispanique ou Latino',
    'option.ethnicity.mena': 'Moyen-Oriental ou Nord-Africain',
    'option.ethnicity.pacific': 'Océanien (Hawaïen ou des îles du Pacifique)',
    'option.ethnicity.white': 'Blanc ou Européen Américain',
  },
  en: {
    // Navbar
    'navbar.myResponses': 'My responses',
    'navbar.questionnaire': 'Questionnaire',
    'navbar.notifications': 'Notifications',
    'navbar.account': 'Account',
    'navbar.editProfile': 'Edit my details',
    'navbar.logout': 'Log out',
    'navbar.language.fr': 'FR',
    'navbar.language.en': 'EN',
    'navbar.profileTitle': 'Edit my details',
    'navbar.loading': 'Loading…',
    'navbar.save': 'Save changes',
    'navbar.logoutSuccess': 'Signed out successfully.',
    'navbar.error.loadProfile': 'Unable to load your data.',
    'navbar.error.updateProfile': 'Error while updating.',

    // Footer
    'footer.social': 'Follow us',
    'footer.copyright': '© 2024 . All rights reserved.',

    // Layout
    'layout.notifications': 'Notifications',

    // Landing
    'landing.title': 'Relieve menstrual pain and hormonal fluctuations for women',
    'landing.subtitle': 'A natural solution to regain control of your cycle and your life.',
    'landing.cta': 'Sign in',

    // Auth / Login
    'auth.signup.title': 'Sign up',
    'auth.signup.name': 'Last name',
    'auth.signup.firstName': 'First name',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Password',
    'auth.signup.phone': 'Phone number',
    'auth.signup.birthDate': 'Birth date',
    'auth.signup.genderLabel': 'Gender:',
    'auth.signup.gender.female': 'Female',
    'auth.signup.gender.male': 'Male',
    'auth.signup.ethnicity': 'Ethnicity',
    'auth.signup.submit': 'Sign up',
    'auth.login.title': 'Sign in',
    'auth.login.admin': 'Sign in as admin',
    'auth.login.submit': 'Sign in',
    'auth.login.forgot': 'Forgot password?',
    'auth.slide.0': 'SaHera',
    'auth.slide.1': 'Auriculotherapy and Artificial Intelligence.',
    'auth.consent.title': 'Informed consent and verification',
    'auth.consent.intro': 'Informed consent and participation agreement',
    'auth.consent.projectTitle': 'Project title',
    'auth.consent.projectName': 'Study on the experience of using an auricular acupressure device to relieve general perimenopause symptoms, menstrual cycle disorders, and stress',
    'auth.consent.goal': 'Project goal',
    'auth.consent.goalText': 'This project aims to understand how the device improves user wellbeing. More specifically, it evaluates comfort of use, ease of integrating it into a daily routine, and perceived effects on symptoms such as cyclical pain, muscle tension, sleep disorders, or mood changes linked to stress or hormonal shifts.',
    'auth.consent.data': 'Information collected',
    'auth.consent.dataText': 'We collect your basic information (name, first name, age, gender, ethnic origin, and email) to track your participation, send evaluation questionnaires, and gather your feedback on the device. This supports the scientific validation of the device and the production of cohort-level analyses.',
    'auth.consent.questionnaires': 'The questionnaires cover your experience: device comfort, frequency and context of use, perceived effects on pain, sleep, stress, and overall wellbeing, and your overall satisfaction.',
    'auth.consent.security': 'Security and confidentiality: All data is stored on secure servers, in line with Québec’s Law 25 on personal data protection. During analysis, all data is anonymized to ensure participant confidentiality.',
    'auth.consent.partnership': 'Commitment and partnership',
    'auth.consent.partnershipText': 'By receiving this device free of charge, you become an active partner in the project. Your participation directly contributes to scientific validation and product improvement. We also want to keep you informed of analysis and validation reports from this study, so you can follow cohort-wide results and project progress. For this purpose, you also agree to receive our newsletter, which will periodically share project updates, interim results, and additional information on research and development activities. If you decide to stop participating, you agree to return the device to respect the study protocol.',
    'auth.consent.duration': 'Duration, evaluation times, and withdrawal',
    'auth.consent.durationText': 'Your participation lasts about one year from the date you received the device. To track how your experience evolves, two evaluations are required:',
    'auth.consent.duration6': 'A first after 6 months of continuous use.',
    'auth.consent.duration12': 'A second after 12 months, at the end of your participation.',
    'auth.consent.durationEnd': 'Each evaluation uses the same follow-up form (comfort, perceived effects, satisfaction). These two checkpoints help assess changes over time and strengthen the scientific value of the results.',
    'auth.consent.contact': 'For any question or to withdraw your consent, write to:',
    'auth.consent.email': 'info@sahera.ca',
    'auth.consent.withdraw': 'If you withdraw, you must return the device provided.',
    'auth.consent.subtitle': 'Consent',
    'auth.consent.check': 'Yes, I consent to take part in the study, I accept the participation and device return conditions, and I agree to receive the newsletter related to this study.',
    'auth.consent.otpTitle': 'Enter the code sent to your email',
    'auth.consent.verify': 'Verify',
    'auth.consent.resend': 'Resend code',
    'auth.forgot.title': 'Reset password',
    'auth.forgot.send': 'Send code',
    'auth.forgot.verify': 'Verify',
    'auth.forgot.resend': 'Resend code',
    'auth.forgot.save': 'Save',
    'auth.forgot.newPassword': 'New password',
    'auth.forgot.confirmPassword': 'Confirm password',
    'auth.toast.required': 'Required field',
    'auth.toast.invalidEmail': 'Email format is invalid.',
    'auth.toast.emailTitle': 'Invalid email',
    'auth.toast.shortPassword': 'Password must be at least 8 characters long.',
    'auth.toast.passwordTitle': 'Password too short',
    'auth.toast.phoneInvalid': 'Phone number must contain only digits.',
    'auth.toast.errorTitle': 'Error',
    'auth.toast.fixErrors': 'Please fix the errors before submitting.',
    'auth.toast.errorGeneric': 'Please fill in every field.',
    'auth.toast.signinTitle': 'Authentication error',
    'auth.toast.signupSent': 'A code was sent to you.',
    'auth.toast.resend': 'New code sent.',
    'auth.toast.verifyCodeError': 'Error while sending the code.',
    'auth.toast.verifyCode': 'Verification',
    'auth.toast.signupCreated': 'Account created ✔.',
    'auth.toast.signupSuccess': 'Success',
    'auth.toast.codeIncomplete': 'Incomplete code.',
    'auth.toast.loginSuccess': 'Signed in successfully.',
    'auth.toast.loginSuccessTitle': 'Success',
    'auth.toast.loginFailed': 'Incorrect email or password.',
    'auth.slideshow.label': 'Decorative slideshow',
    'auth.error.emailRequired': 'Email is required.',
    'auth.error.requestCodeFirst': 'Request a code first.',
    'auth.error.codeIncomplete': 'Incomplete code.',
    'auth.error.passwordLength': 'Password must contain at least 8 characters.',
    'auth.error.passwordMismatch': 'Passwords do not match.',
    'auth.error.tokenMissing': 'Missing token, please restart the process.',
    'auth.error.savePassword': 'Unable to save the new password.',

    // Mes réponses
    'answers.title': 'My responses:',
    'answers.tabs.all': 'All',
    'answers.tabs.completed': 'Completed',
    'answers.tabs.incomplete': 'Incomplete',
    'answers.loading': 'Loading…',
    'answers.empty': 'No data to display for this tab.',
    'answers.pagination.prev': 'Previous',
    'answers.pagination.next': 'Next',

    // Questionnaire list
    'questionnaire.title': 'Questionnaires to do:',
    'questionnaire.emptyLead': 'You have no available questionnaire right now.',
    'questionnaire.emptyTitle': 'No questionnaire',
    'pagination.prev': 'Previous',
    'pagination.next': 'Next',

    // Card
    'card.status.open': 'Open',
    'card.status.closed': 'Closed',
    'card.published': 'Published:',
    'card.until': 'until:',
    'card.completed': 'Questionnaire completed',
    'card.pending': 'Awaiting answers',
    'card.modify': 'Edit',
    'card.respond': 'Answer',
    'card.sessionClosed': 'The session is closed',

    // Notifications
    'notifications.title': 'Notifications history:',
    'notifications.loading': 'Loading...',
    'notifications.emptyLead': 'You have no notification yet.',
    'notifications.emptyTitle': 'No notification',
    'notification.subject': 'Subject:',
    'notification.markAsRead': 'Mark as read',

    // Q&A
    'qna.theme': 'Topic:',
    'qna.loadingSubthemes': 'Loading subtopics…',
    'qna.questionsFor': 'Questions for « {{title}} »',
    'qna.selectOption': 'Select an option',
    'qna.enterAnswer': 'Enter your answer',
    'qna.chooseDate': 'Choose a date',
    'qna.noQuestions': 'No question for this subtopic.',
    'qna.saveAnswers': 'Save answers',
    'qna.emptySubthemeLead': 'No subtopic available.',
    'qna.emptySubthemeTitle': 'No content',
    'qna.toast.none': 'No question to save.',
    'qna.toast.missing': 'Please answer every question.',
    'qna.toast.partial': 'Some answers could not be saved.',
    'qna.toast.saved': 'Your answers for « {{title}} » have been saved.',

    // Admin navbar
    'admin.participants': 'Participants',
    'admin.questionnaires': 'Questionnaire',
    'admin.messages': 'Messages',

    // Admin participants
    'admin.participants.title': 'Participants list',
    'admin.filters.id': 'Exact ID',
    'admin.filters.name': 'Last name (starts with...)',
    'admin.filters.firstname': 'First name (starts with...)',
    'admin.create': 'Create',
    'admin.actions': 'Actions',
    'admin.table.id': 'ID',
    'admin.table.name': 'Last name',
    'admin.table.firstname': 'First name',
    'admin.table.email': 'Email',
    'admin.table.phone': 'Phone',
    'admin.table.birthdate': 'Birth date',
    'admin.table.gender': 'Gender',
    'admin.table.ethnicity': 'Ethnicity',
    'admin.table.role': 'Role',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    'admin.saveChanges': 'Save changes',
    'admin.createParticipant': 'Create participant',
    'admin.dialog.editTitle': 'Edit participant',
    'admin.dialog.createTitle': 'Create new participant',
    'admin.emptyFiltered': 'No participant found for these filters.',
    'admin.empty': 'No participant yet.',
    'admin.confirmDelete': 'Do you really want to delete "{{name}}" ?',

    // Admin notifications
    'admin.notifications.title': 'Message history',
    'admin.notifications.send': 'Send message',
    'admin.notifications.dialogTitle': 'Send a notification',
    'admin.notifications.subject': 'Subject:',
    'admin.notifications.message': 'Message:',
    'admin.notifications.placeholderTitle': 'Title',
    'admin.notifications.placeholderMessage': 'Your message',
    'admin.notifications.sendAction': 'Send',
    'admin.notifications.cancel': 'Cancel',

    // Admin questionnaire generation
    'admin.thematiques.title': 'Themes list',
    'admin.thematiques.emptyLead': 'No theme is available for now.',
    'admin.thematiques.emptyTitle': 'No questionnaire',
    'admin.thematiques.createTitle': 'Create a Theme',
    'admin.thematiques.titre': 'Title:',
    'admin.thematiques.titreFr': 'Title (FR)',
    'admin.thematiques.titreEn': 'Title (EN)',
    'admin.thematiques.description': 'Description:',
    'admin.thematiques.descriptionFr': 'Description (FR)',
    'admin.thematiques.descriptionEn': 'Description (EN)',
    'admin.thematiques.openDate': 'Opening date:',
    'admin.thematiques.closeDate': 'Closing date:',
    'admin.thematiques.csv': 'Import CSV:',
    'admin.thematiques.create': 'Create',
    'admin.thematiques.wait': 'Please wait...',
    'admin.thematiques.errorPrefix': 'Error:',
    'admin.thematiques.errorGeneric': 'An error occurred during creation.',
    'admin.thematiques.drag': 'Drag and Drop',
    'admin.thematiques.or': 'or',
    'admin.thematiques.browse': 'Browse CSV file',

    // Admin qcard
    'admin.card.openDate': 'Opening date:',
    'admin.card.edit': 'Edit',
    'admin.card.delete': 'Delete',
    'admin.card.viewResponses': 'View responses',
    'admin.card.editDialogTitle': 'Edit Theme',
    'admin.card.title': 'Title:',
    'admin.card.description': 'Description:',
    'admin.card.open': 'Opening date:',
    'admin.card.close': 'Closing date:',
    'admin.card.apply': 'Apply',
    'admin.card.dateOrderError': 'The opening date must be before or equal to the closing date.',
    'admin.card.closedShort': 'Closed',
    'admin.card.opensInDays': 'Opens in {{days}} days',
    'admin.card.opensTomorrow': 'Opens tomorrow',
    'admin.card.daysLeft': '{{days}} days left',
    'admin.card.oneDayLeft': '1 day left',
    'admin.card.lastDay': 'Last day',

    // Admin details
    'admin.details.title': 'Theme details « {{title}} »',
    'admin.details.subtheme': 'Subtopic',
    'admin.details.question': 'Question',
    'admin.details.answersCount': 'Number of answers',
    'admin.details.view': 'View responses',
    'admin.details.analyze': 'Analyse',
    'admin.details.noQuestion': 'No question',
    'admin.analysis.title': 'Answers analysis',
    'admin.analysis.question': 'Question:',
    'admin.analysis.chartTitle': 'Answers per option',
    'admin.analysis.option': 'Option',
    'admin.analysis.answers': 'Answers',
    'admin.thematiques.confirmDelete': 'Do you really want to delete this theme?',

    // Admin question details
    'admin.questionDetails.title': 'Question details: « {{title}} »',
    'admin.questionDetails.userId': 'User ID',
    'admin.questionDetails.name': 'Last name',
    'admin.questionDetails.firstname': 'First name',
    'admin.questionDetails.answer': 'Answer',
    'admin.questionDetails.empty': 'No answer for this question.',
    'dashboard.progression': 'Themes progression',
    'dashboard.incomplete': 'Incomplete',
    'dashboard.complete': 'Complete',
    'dashboard.usersCount': 'Number of users',
    'dashboard.themeAxis': 'Theme',
    'dashboard.ageDistributionTitle': 'Age range distribution',
    'dashboard.usersLabel': 'Number of users',
    'dashboard.ethnicityTitle': 'Ethnicity distribution by gender',
    'dashboard.gender.female': 'Women',
    'dashboard.gender.male': 'Men',
    'dashboard.genderDistributionTitle': 'Gender breakdown',
    'dashboard.analysis.responses': 'Answer analysis',
    'dashboard.analysis.count': 'Number of answers',

    // Generic
    'generic.loading': 'Loading...',
    'generic.apply': 'Apply',
    'generic.close': 'Close',
    'generic.save': 'Save',

    // Option labels (values stay in FR for the API)
    'option.gender.female': 'Female',
    'option.gender.male': 'Male',
    'option.ethnicity.native': 'American Indian or Alaska Native',
    'option.ethnicity.asian': 'Asian',
    'option.ethnicity.black': 'Black or African American',
    'option.ethnicity.latino': 'Hispanic or Latino',
    'option.ethnicity.mena': 'Middle Eastern or North African',
    'option.ethnicity.pacific': 'Pacific Islander (Hawaiian or Pacific Islands)',
    'option.ethnicity.white': 'White or European American',
  }
};

const genderOptions: Array<{ value: string; labelKey: string }> = [
  { value: 'Femme', labelKey: 'auth.signup.gender.female' },
  { value: 'Homme', labelKey: 'auth.signup.gender.male' },
];

const ethnicityOptions: Array<{ value: string; labelKey: string }> = [
  { value: "Amerindien ou Autochtone d'Alaska", labelKey: 'option.ethnicity.native' },
  { value: 'Asiatique', labelKey: 'option.ethnicity.asian' },
  { value: 'Noir ou Afro-Americain', labelKey: 'option.ethnicity.black' },
  { value: 'Hispanique ou Latino', labelKey: 'option.ethnicity.latino' },
  { value: 'Moyen-Oriental ou Nord-Africain', labelKey: 'option.ethnicity.mena' },
  { value: 'Oceanien (Hawaien ou des iles du Pacifique)', labelKey: 'option.ethnicity.pacific' },
  { value: 'Blanc ou Europeen Americain', labelKey: 'option.ethnicity.white' },
];

const legacyEthnicityOptions: Array<{ value: string; labelKey: string }> = [
  { value: "Amerindien ou Autochtone d'Alaska", labelKey: 'option.ethnicity.native' },
  { value: 'Noir ou Afro-Americain', labelKey: 'option.ethnicity.black' },
  { value: 'Oceanien (Hawaien ou des iles du Pacifique)', labelKey: 'option.ethnicity.pacific' },
  { value: 'Blanc ou Europeen Americain', labelKey: 'option.ethnicity.white' },
];
@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly genders = [...genderOptions];
  readonly ethnicities = [...ethnicityOptions, ...legacyEthnicityOptions];

  private currentLang$ = new BehaviorSubject<Lang>(this.getInitialLang());

  get language$() {
    return this.currentLang$.asObservable();
  }

  get currentLang(): Lang {
    return this.currentLang$.value;
  }

  setLanguage(lang: Lang): void {
    if (lang === this.currentLang$.value) return;
    this.currentLang$.next(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const value = this.lookup(key);
    if (typeof value !== 'string') {
      return Array.isArray(value) ? value.join(' ') : key;
    }
    return this.interpolate(value, params);
  }

  translateOptionLabel(category: 'gender' | 'ethnicity', value: string): string {
    const list = category === 'gender' ? this.genders : this.ethnicities;
    const match = list.find((opt: { value: string; labelKey: string }) => opt.value === value);
    if (!match) return value;
    return this.translate(match.labelKey);
  }

  getOptions(category: 'gender' | 'ethnicity'): Array<{ value: string; labelKey: string }> {
    if (category === 'gender') {
      return [...genderOptions];
    }
    return [...ethnicityOptions, ...legacyEthnicityOptions];
  }

  private lookup(key: string): TranslationValue | undefined {
    const lang = this.currentLang$.value;
    return translations[lang][key] ?? translations.fr[key];
  }

  private interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return Object.keys(params).reduce(
      (acc, p) => acc.replace(new RegExp(`{{\\s*${p}\\s*}}`, 'g'), String(params[p])),
      str
    );
  }

  private getInitialLang(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === 'fr' || stored === 'en') return stored;
    return 'fr';
  }
}
