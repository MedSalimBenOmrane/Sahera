from flask import Blueprint, jsonify, request, abort
from .models import Thematique, SousThematique, Question, Utilisateur, Admin, Reponse,Notification, NotificationUtilisateur
from .extensions import db
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import date
from sqlalchemy.orm import joinedload
from sqlalchemy import func
import bcrypt
import jwt
from flask import current_app, request, jsonify, abort
import os

api_bp = Blueprint("api", __name__)

#Récupérer la liste de toutes les thématiques (avec leurs informations)
#Admin , User
@api_bp.route("/thematiques", methods=["GET"])
def get_thematiques():
    """
    Get a list of all thematiques with full information.
    """
    thematiques = Thematique.query.all()
    result = []
    for t in thematiques:
        result.append({
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "date_ouverture": t.date_ouverture.isoformat() if t.date_ouverture else None,
            "date_cloture": t.date_cloture.isoformat() if t.date_cloture else None
        })
    return jsonify(result)
#Récupérer les thématiques ouvertes
@api_bp.route("/thematiques/ouvertes", methods=["GET"])
def get_thematiques_ouvertes():
    """
    Récupérer les thématiques ouvertes (pas de date_cloture ou date_cloture future).
    """
    today = date.today()
    thematiques = Thematique.query.filter(
        (Thematique.date_cloture == None) | (Thematique.date_cloture > today)
    ).all()

    return jsonify([
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "date_ouverture": t.date_ouverture.isoformat() if t.date_ouverture else None,
            "date_cloture": t.date_cloture.isoformat() if t.date_cloture else None
        }
        for t in thematiques
    ])

#Récupérer les thématiques fermees
@api_bp.route("/thematiques/fermees", methods=["GET"])
def get_thematiques_fermees():
    """
    Récupérer les thématiques fermées (date_cloture <= aujourd'hui).
    """
    today = date.today()
    thematiques = Thematique.query.filter(
        Thematique.date_cloture != None,
        Thematique.date_cloture <= today
    ).all()

    return jsonify([
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "date_ouverture": t.date_ouverture.isoformat() if t.date_ouverture else None,
            "date_cloture": t.date_cloture.isoformat()
        }
        for t in thematiques
    ])
#Pour une thématique sélectionnée :
#Récupérer toutes les sous-thématiques associées
#Pour chaque sous-thématique : récupérer toutes les questions liées
#User,Admin
@api_bp.route("/thematiques/<int:thematique_id>/details", methods=["GET"])
def get_sous_thematiques_with_questions(thematique_id):
    thematique = Thematique.query.get_or_404(thematique_id)

    response = {
        "id": thematique.id,
        "name": thematique.name,
        "description": thematique.description,
        "date_ouverture": thematique.date_ouverture.isoformat() if thematique.date_ouverture else None,
        "date_cloture": thematique.date_cloture.isoformat() if thematique.date_cloture else None,
        "sous_thematiques": []
    }

    for sous in thematique.sous_thematiques:
        sous_data = {
            "id": sous.id,
            "titre": sous.titre,
            "questions": [{"id": q.id, "texte": q.texte} for q in sous.questions]
        }
        response["sous_thematiques"].append(sous_data)

    return jsonify(response)
#User,Admin
@api_bp.route("/thematiques/<int:id>", methods=["GET"])
def get_thematique(id):
    thematique = Thematique.query.get_or_404(id)
    return jsonify({
        "id": thematique.id,
        "name": thematique.name,
        "description": thematique.description,
        "date_ouverture": thematique.date_ouverture.isoformat() if thematique.date_ouverture else None,
        "date_cloture": thematique.date_cloture.isoformat() if thematique.date_cloture else None
    })

#User,Admin
@api_bp.route("/thematiques/<string:name>", methods=["GET"])
def get_thematique_by_name(name):
    thematique = Thematique.query.filter_by(name=name).first()
    if not thematique:
        return jsonify({"message": "Thématique non trouvée"}), 404
    return jsonify({
        "id": thematique.id,
        "name": thematique.name,
        "description": thematique.description,
        "date_ouverture": thematique.date_ouverture.isoformat() if thematique.date_ouverture else None,
        "date_cloture": thematique.date_cloture.isoformat() if thematique.date_cloture else None
    })


#Ajouter une nouvelle thématique
#Admin
@api_bp.route("/thematiques", methods=["POST"])
def create_thematique():
    data = request.get_json()
    if not data or "name" not in data:
        abort(400, description="Missing 'name'")
    
    thematique = Thematique(
        name=data["name"],
        description=data.get("description"),
        date_ouverture=data.get("date_ouverture"),
        date_cloture=data.get("date_cloture")
    )
    db.session.add(thematique)
    db.session.commit()

    return jsonify({
        "id": thematique.id,
        "name": thematique.name,
        "description": thematique.description
    }), 201

#Admin
@api_bp.route("/thematiques/<int:id>", methods=["PUT"])
def update_thematique(id):
    thematique = Thematique.query.get_or_404(id)
    data = request.get_json()
    if not data or "name" not in data:
        abort(400, description="Missing 'name'")

    thematique.name = data["name"]
    thematique.description = data.get("description", thematique.description)
    thematique.date_ouverture = data.get("date_ouverture", thematique.date_ouverture)
    thematique.date_cloture = data.get("date_cloture", thematique.date_cloture)
    db.session.commit()

    return jsonify({
        "id": thematique.id,
        "name": thematique.name,
        "description": thematique.description
    })
#Admin
#Supprimer une thématique existante
@api_bp.route("/thematiques/<int:id>", methods=["DELETE"])
def delete_thematique(id):
    """
    Delete a thematique by ID.
    Args:
        id (int): Thematique ID.
    Returns:
        JSON success message with 204 status.
    """
    thematique = Thematique.query.get_or_404(id)
    db.session.delete(thematique)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204

#User, 
#Récupérer toutes les thématiques non complétées pour ce client  , un thematique completes , ca veut dire le client a repondu a toutes les questions de toutes les sous thematiques qui appartient a cce thematique
#Admin, User 
@api_bp.route("/thematiques/non-completes/<int:client_id>", methods=["GET"])
def get_incomplete_thematiques(client_id):
    """
    Récupère les thématiques non complétées par un client.
    Une thématique est complétée si le client a répondu à toutes les questions de toutes les sous-thématiques.
    """
    thematiques = (
        Thematique.query
        .options(
            joinedload(Thematique.sous_thematiques).joinedload(SousThematique.questions)
        )
        .all()
    )

    incomplete_thematiques = []

    for t in thematiques:
        total_questions = 0
        question_ids = []

        for st in t.sous_thematiques:
            for q in st.questions:
                question_ids.append(q.id)
                total_questions += 1

        if total_questions == 0:
            # Pas de questions => considérée comme non complétée
            incomplete_thematiques.append({
                "id": t.id,
                "name": t.name
            })
            continue

        reponses_client = Reponse.query.filter(
            Reponse.client_id == client_id,
            Reponse.question_id.in_(question_ids)
        ).count()

        if reponses_client < total_questions:
            incomplete_thematiques.append({
                "id": t.id,
                "name": t.name
            })

    return jsonify(incomplete_thematiques)

#Admin, user
#Récupérer toutes les thématiques complétées pour ce client  , un thematique completes , ca veut dire le client a repondu a toutes les questions de toutes les sous thematiques qui appartient a cce thematique
@api_bp.route("/thematiques/completes/<int:client_id>", methods=["GET"])
def get_completed_thematiques(client_id):
    """
    Récupère les thématiques complétées par un client.
    Une thématique est complète si le client a répondu à toutes les questions de toutes les sous-thématiques.
    """
    thematiques = (
        Thematique.query
        .options(
            joinedload(Thematique.sous_thematiques).joinedload(SousThematique.questions)
        )
        .all()
    )

    completed_thematiques = []

    for t in thematiques:
        question_ids = [
            q.id
            for st in t.sous_thematiques
            for q in st.questions
        ]

        if not question_ids:
            continue  # Une thématique sans questions ne peut pas être complète

        nb_questions = len(question_ids)

        nb_reponses_client = Reponse.query.filter(
            Reponse.client_id == client_id,
            Reponse.question_id.in_(question_ids)
        ).count()

        if nb_reponses_client == nb_questions:
            completed_thematiques.append({
                "id": t.id,
                "name": t.name
            })

    return jsonify(completed_thematiques)

# SousThematique routes
##User,Admin
@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques", methods=["GET"])
def get_sousthematiques(thematique_id):
    """
    Get all sous-thematiques under a specific thematique.
    """
    thematique = Thematique.query.get_or_404(thematique_id)
    sous_thematiques = SousThematique.query.filter_by(thematique_id=thematique.id).all()
    return jsonify([
        {"id": s.id, "titre": s.titre, "thematique_id": s.thematique_id} for s in sous_thematiques
    ])
#User,Admin
@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques/<int:id>", methods=["GET"])
def get_sousthematique(thematique_id, id):
    """
    Get a specific sous-thematique under a thematique.
    """
    sous_thematique = SousThematique.query.filter_by(id=id, thematique_id=thematique_id).first_or_404()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id})
#Admin
@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques", methods=["POST"])
def create_sousthematique(thematique_id):
    """
    Create a new sous-thematique under a given thematique.
    """
    thematique = Thematique.query.get_or_404(thematique_id)
    data = request.get_json()
    if not data or "titre" not in data:
        abort(400, description="Missing 'titre'")
    
    sous_thematique = SousThematique(titre=data["titre"], thematique_id=thematique.id)
    db.session.add(sous_thematique)
    db.session.commit()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id}), 201
#Admin
@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques/<int:id>", methods=["PUT"])
def update_sousthematique(thematique_id, id):
    """
    Update a sous-thematique that belongs to a specific thematique.
    """
    sous_thematique = SousThematique.query.filter_by(id=id, thematique_id=thematique_id).first_or_404()
    data = request.get_json()
    if not data or "titre" not in data:
        abort(400, description="Missing 'titre'")
    
    sous_thematique.titre = data["titre"]
    db.session.commit()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id})
#Admin
@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques/<int:id>", methods=["DELETE"])
def delete_sousthematique(thematique_id, id):
    """
    Delete a sous-thematique that belongs to a specific thematique.
    """
    sous_thematique = SousThematique.query.filter_by(id=id, thematique_id=thematique_id).first_or_404()
    db.session.delete(sous_thematique)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204

# Question routes
#Admin,User
@api_bp.route("/questions", methods=["GET"])
def get_questions():
    """
    Get a list of all questions.
    Returns:
        JSON list of questions with their sous_thematique_id.
    """
    questions = Question.query.all()
    return jsonify([
        {"id": q.id, "texte": q.texte, "sous_thematique_id": q.sous_thematique_id} for q in questions
    ])
#Admin,User
@api_bp.route("/questions/<int:id>", methods=["GET"])
def get_question(id):
    """
    Get a single question by ID.
    Args:
        id (int): Question ID.
    Returns:
        JSON of the question data or 404 if not found.
    """
    question = Question.query.get_or_404(id)
    return jsonify({"id": question.id, "texte": question.texte, "sous_thematique_id": question.sous_thematique_id})
#Admin
@api_bp.route("/questions", methods=["POST"])
def create_question():
    """
    Create a new question.
    Request JSON:
        { "texte": "Question text", "sous_thematique_id": 1 }
    Returns:
        JSON of the created question with 201 status.
    """
    data = request.get_json()
    if not data or "texte" not in data or "sous_thematique_id" not in data:
        abort(400, description="Missing 'texte' or 'sous_thematique_id'")
    question = Question(texte=data["texte"], sous_thematique_id=data["sous_thematique_id"])
    db.session.add(question)
    db.session.commit()
    return jsonify({"id": question.id, "texte": question.texte, "sous_thematique_id": question.sous_thematique_id}), 201
#Admin
@api_bp.route("/questions/<int:id>", methods=["PUT"])
def update_question(id):
    """
    Update a question by ID.
    Args:
        id (int): Question ID.
    Request JSON:
        { "texte": "Updated text", "sous_thematique_id": 2 }
    Returns:
        JSON of the updated question.
    """
    question = Question.query.get_or_404(id)
    data = request.get_json()
    if not data or "texte" not in data or "sous_thematique_id" not in data:
        abort(400, description="Missing 'texte' or 'sous_thematique_id'")
    question.texte = data["texte"]
    question.sous_thematique_id = data["sous_thematique_id"]
    db.session.commit()
    return jsonify({"id": question.id, "texte": question.texte, "sous_thematique_id": question.sous_thematique_id})
#Admin
@api_bp.route("/questions/<int:id>", methods=["DELETE"])
def delete_question(id):
    """
    Delete a question by ID.
    Args:
        id (int): Question ID.
    Returns:
        JSON success message with 204 status.
    """
    question = Question.query.get_or_404(id)
    db.session.delete(question)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204


#Récupérer la liste de tous les utilisateurs (clients) et leurs informations de base
# Get all users
# Récupérer la liste de tous les utilisateurs (clients) et leurs informations de base
#Admin
@api_bp.route("/utilisateurs", methods=["GET"])
def get_utilisateurs():
    utilisateurs = Utilisateur.query.all()
    return jsonify([
        {
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.email,
            "telephone": u.telephone,
            "date_naissance": u.date_naissance.isoformat() if u.date_naissance else None,
            "ethnicite": u.ethnicite,
            "genre": u.genre,
            "role": u.role
        } for u in utilisateurs
    ])

#Admin
# Récupérer un seul utilisateur par ID
@api_bp.route("/utilisateurs/<int:id>", methods=["GET"])
def get_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    return jsonify({
        "id": u.id,
        "nom": u.nom,
        "prenom": u.prenom,
        "email": u.email,
        "telephone": u.telephone,
        "date_naissance": u.date_naissance.isoformat() if u.date_naissance else None,
        "ethnicite": u.ethnicite,
        "genre": u.genre,
        "role": u.role
    })

#Admin, User
# Créer un nouvel utilisateur
@api_bp.route("/utilisateurs", methods=["POST"])
def create_utilisateur():
    data = request.get_json()
    required_fields = ["nom", "prenom", "email", "mot_de_passe"]
    if not all(field in data for field in required_fields):
        abort(400, description="Champs requis manquants")

    hashed_password = bcrypt.hashpw(data["mot_de_passe"].encode('utf-8'), bcrypt.gensalt())

    u = Utilisateur(
        nom=data["nom"],
        prenom=data["prenom"],
        email=data["email"],
        mot_de_passe=hashed_password.decode('utf-8'),
        date_naissance=data.get("date_naissance"),
        ethnicite=data.get("ethnicite"),
        genre=data.get("genre"),
        telephone=data.get("telephone"),
        role=data.get("role", "utilisateur")
    )
    db.session.add(u)
    db.session.commit()
    return jsonify({"id": u.id}), 201


#Admin, User
# Mettre à jour un utilisateur existant
@api_bp.route("/utilisateurs/<int:id>", methods=["PUT"])
def update_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    data = request.get_json()

    u.nom = data.get("nom", u.nom)
    u.prenom = data.get("prenom", u.prenom)
    u.email = data.get("email", u.email)

    # Hash the password only if a new one is provided
    if "mot_de_passe" in data and data["mot_de_passe"]:
        hashed_password = bcrypt.hashpw(data["mot_de_passe"].encode('utf-8'), bcrypt.gensalt())
        u.mot_de_passe = hashed_password.decode('utf-8')

    u.date_naissance = data.get("date_naissance", u.date_naissance)
    u.ethnicite = data.get("ethnicite", u.ethnicite)
    u.genre = data.get("genre", u.genre)
    u.telephone = data.get("telephone", u.telephone)
    u.role = data.get("role", u.role)

    db.session.commit()
    return jsonify({
        "message": "Utilisateur mis à jour avec succès",
        "id": u.id,
        "nom": u.nom,
        "prenom": u.prenom,
        "email": u.email,
        "telephone": u.telephone
    }), 200

#Admin
# Supprimer un utilisateur
@api_bp.route("/utilisateurs/<int:id>", methods=["DELETE"])
def delete_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "Utilisateur supprimé"}), 204

#admin
# Get all admins
@api_bp.route("/admins", methods=["GET"])
def get_admins():
    admins = Admin.query.all()
    return jsonify([
        {
            "id": a.id,
            "nom": a.nom,
            "prenom": a.prenom,
            "email": a.email,
            "date_naissance": a.date_naissance.isoformat() if a.date_naissance else None,
            "telephone": a.telephone
        } for a in admins
    ])

# GET a specific admin
@api_bp.route("/admins/<int:id>", methods=["GET"])
def get_admin(id):
    a = Admin.query.get_or_404(id)
    return jsonify({
        "id": a.id,
        "nom": a.nom,
        "prenom": a.prenom,
        "email": a.email,
        "date_naissance": a.date_naissance.isoformat() if a.date_naissance else None,
        "telephone": a.telephone
    })

# POST create a new admin
@api_bp.route("/admins", methods=["POST"])
def create_admin():
    data = request.get_json()
    mot_de_passe_en_clair = data.get("mot_de_passe")

    if not mot_de_passe_en_clair:
        return jsonify({"error": "Mot de passe est requis"}), 400

    mot_de_passe_hash = bcrypt.hashpw(
        mot_de_passe_en_clair.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    admin = Admin(
        nom=data.get("nom"),
        prenom=data.get("prenom"),
        email=data.get("email"),
        mot_de_passe=mot_de_passe_hash,
        date_naissance=data.get("date_naissance"),
        telephone=data.get("telephone")
    )
    db.session.add(admin)
    db.session.commit()
    return jsonify({"id": admin.id}), 201

# PUT update an existing admin
@api_bp.route("/admins/<int:id>", methods=["PUT"])
def update_admin(id):
    admin = Admin.query.get_or_404(id)
    data = request.get_json()

    admin.nom = data.get("nom", admin.nom)
    admin.prenom = data.get("prenom", admin.prenom)
    admin.email = data.get("email", admin.email)
    admin.date_naissance = data.get("date_naissance", admin.date_naissance)
    admin.telephone = data.get("telephone", admin.telephone)

    nouveau_mot_de_passe = data.get("mot_de_passe")
    if nouveau_mot_de_passe:
        admin.mot_de_passe = bcrypt.hashpw(
            nouveau_mot_de_passe.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    db.session.commit()
    return jsonify({"id": admin.id})

# DELETE an admin
@api_bp.route("/admins/<int:id>", methods=["DELETE"])
def delete_admin(id):
    admin = Admin.query.get_or_404(id)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin supprimé"}), 204

# Obtenir toutes les réponses
#Admin, User
@api_bp.route("/reponses", methods=["GET"])
def get_reponses():
    reponses = Reponse.query.all()
    return jsonify([
        {
            "id": r.id,
            "contenu": r.contenu,
            "date_creation": r.date_creation.isoformat() if r.date_creation else None,
            "question_id": r.question_id,
            "utilisateur_id": r.utilisateur_id
        } for r in reponses
    ])
#Admin, User
# Obtenir une réponse par ID
@api_bp.route("/reponses/<int:id>", methods=["GET"])
def get_reponse(id):
    r = Reponse.query.get_or_404(id)
    return jsonify({
        "id": r.id,
        "contenu": r.contenu,
        "date_creation": r.date_creation.isoformat() if r.date_creation else None,
        "question_id": r.question_id,
        "utilisateur_id": r.utilisateur_id
    })
#User
# Créer une nouvelle réponse
@api_bp.route("/reponses", methods=["POST"])
def create_reponse():
    data = request.get_json()
    required_fields = ["contenu", "question_id", "utilisateur_id"]
    if not all(field in data for field in required_fields):
        abort(400, description="Champs requis manquants : contenu, question_id, utilisateur_id")

    # parsing de date_creation si fourni, sinon date du jour
    if "date_creation" in data:
        try:
            date_creation = datetime.fromisoformat(data["date_creation"]).date()
        except ValueError:
            abort(400, description="Format de date_creation invalide, attendu YYYY-MM-DD")
    else:
        date_creation = date.today()

    r = Reponse(
        contenu=data["contenu"],
        date_creation=date_creation,
        question_id=data["question_id"],
        utilisateur_id=data["utilisateur_id"]
    )
    db.session.add(r)
    db.session.commit()

    return jsonify({
        "id": r.id,
        "contenu": r.contenu,
        "date_creation": r.date_creation.isoformat(),
        "question_id": r.question_id,
        "utilisateur_id": r.utilisateur_id
    }), 201
#User
# Mettre à jour une réponse existante
@api_bp.route("/reponses/<int:id>", methods=["PUT"])
def update_reponse(id):
    r = Reponse.query.get_or_404(id)
    data = request.get_json()

    if "contenu" in data:
        r.contenu = data["contenu"]
    if "date_creation" in data:
        try:
            r.date_creation = datetime.fromisoformat(data["date_creation"]).date()
        except ValueError:
            abort(400, description="Format de date_creation invalide, attendu YYYY-MM-DD")

    r.question_id = data.get("question_id", r.question_id)
    r.utilisateur_id = data.get("utilisateur_id", r.utilisateur_id)

    db.session.commit()
    return jsonify({
        "id": r.id,
        "contenu": r.contenu,
        "date_creation": r.date_creation.isoformat() if r.date_creation else None,
        "question_id": r.question_id,
        "utilisateur_id": r.utilisateur_id
    })
#User
# Supprimer une réponse
@api_bp.route("/reponses/<int:id>", methods=["DELETE"])
def delete_reponse(id):
    r = Reponse.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Réponse supprimée"}), 204
#User, Admin
# Récupérer les réponses d’un client pour une sous-thématique
@api_bp.route("/clients/<int:client_id>/sousthematiques/<int:sous_id>/reponses", methods=["GET"])
def get_reponses_client_sousthematique(client_id, sous_id):
    questions = Question.query.filter_by(sous_thematique_id=sous_id).all()
    question_ids = [q.id for q in questions]
    reponses = Reponse.query.filter(
        Reponse.utilisateur_id == client_id,
        Reponse.question_id.in_(question_ids)
    ).all()

    response_data = [
        {
            "reponse_id": rep.id,
            "question_id": rep.question_id,
            "contenu": rep.contenu,
            "date_creation": rep.date_creation.isoformat() if rep.date_creation else None
        } for rep in reponses
    ]
    return jsonify(response_data)
#User, Admin
#Récupérer toutes les questions (pour la sous-thématique sélectionnée)
@api_bp.route("/sousthematiques/<int:sous_id>/questions", methods=["GET"])
def get_questions_by_sousthematique(sous_id):
    questions = Question.query.filter_by(sous_thematique_id=sous_id).all()

    results = [{
        "id": q.id,
        "texte": q.texte
    } for q in questions]

    return jsonify(results)

#Authentification: Login
@api_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    mot_de_passe = data.get("mot_de_passe")

    utilisateur = Utilisateur.query.filter_by(email=email).first()
    if utilisateur and bcrypt.checkpw(mot_de_passe.encode('utf-8'), utilisateur.mot_de_passe.encode('utf-8')):
        token = jwt.encode({
            'id': utilisateur.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            "token": token,
            "id": utilisateur.id,
            "nom": utilisateur.nom,
            "prenom": utilisateur.prenom,
            "email": utilisateur.email
        }), 200
    else:
        return jsonify({"message": "Email ou mot de passe incorrect"}), 401

# Assuming these are imported at the top:
# from yourapp.models import Admin, Utilisateur, Notification, NotificationUtilisateur
# from flask import request, jsonify
# from yourapp.extensions import db

# Login route (unchanged, already good)
@api_bp.route("/auth/admin/login", methods=["POST"])
def login_login():
    data = request.get_json()
    email = data.get("email")
    mot_de_passe = data.get("mot_de_passe")

    admin = Admin.query.filter_by(email=email).first()
    if admin and bcrypt.checkpw(mot_de_passe.encode('utf-8'), admin.mot_de_passe.encode('utf-8')):
        token = jwt.encode({
            'id': admin.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            "token": token,
            "id": admin.id,
            "nom": admin.nom,
            "prenom": admin.prenom,
            "email": admin.email
        }), 200
    else:
        return jsonify({"message": "Email ou mot de passe incorrect"}), 401

# Send notification
#Admin
@api_bp.route('/notifications/send', methods=['POST'])
def send_notification():
    data = request.get_json()
    contenu = data.get('contenu')
    utilisateur_ids = data.get('utilisateur_ids')  # Should be a list

    if not contenu or not utilisateur_ids:
        return jsonify({"message": "Contenu and utilisateur_ids are required"}), 400
    
    if not isinstance(utilisateur_ids, list):
        return jsonify({"message": "utilisateur_ids must be a list"}), 400

    notif = Notification(contenu=contenu)
    db.session.add(notif)
    db.session.flush()  # To get notif.id before commit if needed

    for uid in utilisateur_ids:
        user = Utilisateur.query.get(uid)
        if user:
            liaison = NotificationUtilisateur(utilisateur=user, notification=notif)
            db.session.add(liaison)

    db.session.commit()
    return jsonify({"message": "Notification envoyée"}), 201

# Get notifications for a user
@api_bp.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications_for_user(user_id):
    user = Utilisateur.query.get_or_404(user_id)
    notifications = []

    for liaison in user.liaisons_notifications:
        date_envoi = liaison.notification.date_envoi
        notifications.append({
            "notification_id": liaison.notification.id,
            "contenu": liaison.notification.contenu,
            "date_envoi": date_envoi.isoformat() if date_envoi else None,
            "est_lu": liaison.est_lu
        })

    return jsonify(notifications)

# Mark a notification as read
@api_bp.route('/notifications/<int:user_id>/<int:notification_id>/read', methods=['PUT'])
def mark_as_read(user_id, notification_id):
    liaison = NotificationUtilisateur.query.filter_by(
        utilisateur_id=user_id,
        notification_id=notification_id
    ).first_or_404()

    liaison.est_lu = True
    db.session.commit()
    return jsonify({"message": "Notification marquée comme lue"})
