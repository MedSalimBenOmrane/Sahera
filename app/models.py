from app.extensions import db
from datetime import date
from sqlalchemy.dialects.postgresql import JSONB   # <-- ajouter
from sqlalchemy.orm import validates               # <-- ajouter

class Thematique(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True) 
    date_ouverture = db.Column(db.Date, nullable=True)
    date_cloture = db.Column(db.Date, nullable=True)
    sous_thematiques = db.relationship("SousThematique", backref="thematique", cascade="all, delete-orphan")


class SousThematique(db.Model):
    __tablename__ = "sousthematique"

    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(200), nullable=False)
    thematique_id = db.Column(db.Integer, db.ForeignKey("thematique.id"), nullable=False)

    questions = db.relationship("Question", backref="sous_thematique", cascade="all, delete-orphan")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    texte = db.Column(db.Text, nullable=False)
    sous_thematique_id = db.Column(db.Integer, db.ForeignKey("sousthematique.id"), nullable=False)

    # Liste des choix affichés dans la liste déroulante
    options = db.Column(JSONB, nullable=False, default=list)

    reponses = db.relationship("Reponse", backref="question", cascade="all, delete-orphan")

    @validates("options")
    def _validate_options(self, key, options):
        if not isinstance(options, list) or len(options) == 0:
            raise ValueError("`options` doit être une liste non vide.")
        cleaned, seen = [], set()
        for o in options:
            if not isinstance(o, str):
                raise ValueError("Chaque option doit être une chaîne.")
            s = o.strip()
            if not s:
                raise ValueError("Les options vides sont interdites.")
            if s in seen:
                raise ValueError("Options en double interdites.")
            if len(s) > 255:
                raise ValueError("Une option dépasse 255 caractères.")
            cleaned.append(s)
            seen.add(s)
        return cleaned


class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'

    id = db.Column(db.Integer, primary_key=True)
    
    nom = db.Column(db.String(120), nullable=False)
    prenom = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    date_naissance = db.Column(db.Date, nullable=True)
    ethnicite = db.Column(db.String(120), nullable=True)
    genre = db.Column(db.String(20), nullable=True)
    telephone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(50), nullable=False, default="utilisateur")
    type = db.Column(db.String(50))  # Pour le polymorphisme

    __mapper_args__ = {
        'polymorphic_identity': 'utilisateur',
        'polymorphic_on': type
    }

    reponses = db.relationship("Reponse", backref="utilisateur", cascade="all, delete-orphan")

    # Add this relationship for notification link table
    liaisons_notifications = db.relationship(
        "NotificationUtilisateur",
        back_populates="utilisateur",
        cascade="all, delete-orphan"
    )


class Admin(db.Model):
    """
    Simple Admin table with personal and authentication information.
    """
    __tablename__ = 'admin'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(120), nullable=False)
    prenom = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    date_naissance = db.Column(db.Date, nullable=True)
    telephone = db.Column(db.String(20), nullable=True)

class Reponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.String(255), nullable=False)
    date_creation = db.Column(db.Date, nullable= True)
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"), nullable=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey("utilisateur.id"), nullable=False)


class NotificationUtilisateur(db.Model):
    __tablename__ = 'notification_utilisateur'

    notification_id = db.Column(db.Integer, db.ForeignKey('notification.id'), primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), primary_key=True)
    est_lu = db.Column(db.Boolean, default=False)

    # Relations vers les entités Notification et Utilisateur
    notification = db.relationship("Notification", back_populates="liaisons_utilisateurs")
    utilisateur = db.relationship("Utilisateur", back_populates="liaisons_notifications")

class Notification(db.Model):
    __tablename__ = 'notification'

    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False) 
    contenu = db.Column(db.Text, nullable=False)
    date_envoi = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationship with users via association table
    liaisons_utilisateurs = db.relationship(
        "NotificationUtilisateur",
        back_populates="notification",
        cascade="all, delete-orphan"
    )

    
