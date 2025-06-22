from flask import Blueprint, jsonify, request, abort
from .models import Thematique, SousThematique, Question, Utilisateur, Admin, Reponse
from .extensions import db
from datetime import datetime 
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import date
from sqlalchemy.orm import joinedload
from sqlalchemy import func

api_bp = Blueprint("api", __name__)

# @api_bp.route("/thematiques", methods=["GET"])
# def get_thematiques():
#     """
#     Get a list of all thematiques.
#     Returns:
#         JSON list of thematiques.
#     """
#     thematiques = Thematique.query.all()
#     return jsonify([{"id": t.id, "name": t.name} for t in thematiques])


#Récupérer la liste de toutes les thématiques (avec leurs informations)

@api_bp.route("/thematiques", methods=["GET"])
def get_thematiques():
    """
    Get a list of all thematiques with full information.
    Returns:
        JSON list of thematiques with id, name, date_ouverture, and date_cloture.
    """
    thematiques = Thematique.query.all()

    result = []
    for t in thematiques:
        result.append({
            "id": t.id,
            "name": t.name,
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
            "date_ouverture": t.date_ouverture.isoformat() if t.date_ouverture else None,
            "date_cloture": t.date_cloture.isoformat()
        }
        for t in thematiques
    ])

#Pour une thématique sélectionnée :
#Récupérer toutes les sous-thématiques associées
#Pour chaque sous-thématique : récupérer toutes les questions liées
@api_bp.route("/thematiques/<int:thematique_id>/details", methods=["GET"])
def get_sous_thematiques_with_questions(thematique_id):
    thematique = Thematique.query.get_or_404(thematique_id)

    response = {
        "id": thematique.id,
        "name": thematique.name,
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



@api_bp.route("/thematiques/<int:id>", methods=["GET"])
def get_thematique(id):
    """
    Get a single thematique by ID.
    Args:
        id (int): Thematique ID.
    Returns:
        JSON of the thematique data or 404 if not found.
    """
    thematique = Thematique.query.get_or_404(id)
    return jsonify({"id": thematique.id, "name": thematique.name})

@api_bp.route("/thematiques/<string:name>", methods=["GET"])
def get_thematique_by_name(name):
    """
    Get a single thematique by name.
    Args:
        name (str): Thematique name.
    Returns:
        JSON of the thematique data or 404 if not found.
    """
    thematique = Thematique.query.filter_by(name=name).first()
    if not thematique:
        return jsonify({"message": "Thématique non trouvée"}), 404
    return jsonify({"id": thematique.id, "name": thematique.name})

#Ajouter une nouvelle thématique
@api_bp.route("/thematiques", methods=["POST"])
def create_thematique():
    """
    Create a new thematique.
    Request JSON:
        { "name": "Some Name" }
    Returns:
        JSON of the created thematique with 201 status.
    """
    data = request.get_json()
    if not data or "name" not in data:
        abort(400, description="Missing 'name'")
    thematique = Thematique(name=data["name"])
    db.session.add(thematique)
    db.session.commit()
    return jsonify({"id": thematique.id, "name": thematique.name}), 201

@api_bp.route("/thematiques/<int:id>", methods=["PUT"])
def update_thematique(id):
    """
    Update a thematique by ID.
    Args:
        id (int): Thematique ID.
    Request JSON:
        { "name": "Updated Name" }
    Returns:
        JSON of the updated thematique.
    """
    thematique = Thematique.query.get_or_404(id)
    data = request.get_json()
    if not data or "name" not in data:
        abort(400, description="Missing 'name'")
    thematique.name = data["name"]
    db.session.commit()
    return jsonify({"id": thematique.id, "name": thematique.name})
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


#Récupérer toutes les thématiques non complétées pour ce client  , un thematique completes , ca veut dire le client a repondu a toutes les questions de toutes les sous thematiques qui appartient a cce thematique 
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

@api_bp.route("/thematiques/<int:thematique_id>/sousthematiques/<int:id>", methods=["GET"])
def get_sousthematique(thematique_id, id):
    """
    Get a specific sous-thematique under a thematique.
    """
    sous_thematique = SousThematique.query.filter_by(id=id, thematique_id=thematique_id).first_or_404()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id})

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
@api_bp.route("/utilisateurs", methods=["GET"])
def get_utilisateurs():
    utilisateurs = Utilisateur.query.all()
    return jsonify([
        {
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.email,
            "date_naissance": u.date_naissance.isoformat() if u.date_naissance else None,
            "ethnicite": u.ethnicite,
            "genre": u.genre,
            "role": u.role
        } for u in utilisateurs
    ])
@api_bp.route("/utilisateurs/<int:id>", methods=["GET"])
def get_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    return jsonify({
        "id": u.id,
        "nom": u.nom,
        "prenom": u.prenom,
        "email": u.email,
        "date_naissance": u.date_naissance.isoformat() if u.date_naissance else None,
        "ethnicite": u.ethnicite,
        "genre": u.genre,
        "role": u.role
    })

@api_bp.route("/utilisateurs", methods=["POST"])
def create_utilisateur():
    data = request.get_json()
    u = Utilisateur(
        nom=data.get("nom"),
        prenom=data.get("prenom"),
        email=data.get("email"),
        mot_de_passe=data.get("mot_de_passe"),
        date_naissance=data.get("date_naissance"),
        ethnicite=data.get("ethnicite"),
        genre=data.get("genre"),
        role=data.get("role", "utilisateur")
    )
    db.session.add(u)
    db.session.commit()
    return jsonify({"id": u.id}), 201
#Mettre à jour les coordonnées d’un utilisateur (modifier ses données)
@api_bp.route("/utilisateurs/<int:id>", methods=["PUT"])
def update_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    data = request.get_json()
    u.nom = data.get("nom", u.nom)
    u.prenom = data.get("prenom", u.prenom)
    u.email = data.get("email", u.email)
    u.mot_de_passe = data.get("mot_de_passe", u.mot_de_passe)
    u.date_naissance = data.get("date_naissance", u.date_naissance)
    u.ethnicite = data.get("ethnicite", u.ethnicite)
    u.genre = data.get("genre", u.genre)
    u.role = data.get("role", u.role)
    db.session.commit()
    return jsonify({"id": u.id})
#Supprimer un utilisateur
@api_bp.route("/utilisateurs/<int:id>", methods=["DELETE"])
def delete_utilisateur(id):
    u = Utilisateur.query.get_or_404(id)
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "Utilisateur supprimé"}), 204


#admin
@api_bp.route("/admins", methods=["GET"])
def get_admins():
    admins = Admin.query.all()
    return jsonify([
        {
            "id": a.id,
            "nom": a.nom,
            "prenom": a.prenom,
            "email": a.email,
            "niveau_acces": a.niveau_acces
        } for a in admins
    ])

@api_bp.route("/admins/<int:id>", methods=["GET"])
def get_admin(id):
    a = Admin.query.get_or_404(id)
    return jsonify({
        "id": a.id,
        "nom": a.nom,
        "prenom": a.prenom,
        "email": a.email,
        "niveau_acces": a.niveau_acces
    })

@api_bp.route("/admins", methods=["POST"])
def create_admin():
    data = request.get_json()
    admin = Admin(
        nom=data.get("nom"),
        prenom=data.get("prenom"),
        email=data.get("email"),
        mot_de_passe=data.get("mot_de_passe"),
        date_naissance=data.get("date_naissance"),
        ethnicite=data.get("ethnicite"),
        genre=data.get("genre"),
        role="admin",
        niveau_acces=data.get("niveau_acces", "élevé")
    )
    db.session.add(admin)
    db.session.commit()
    return jsonify({"id": admin.id}), 201

@api_bp.route("/admins/<int:id>", methods=["PUT"])
def update_admin(id):
    admin = Admin.query.get_or_404(id)
    data = request.get_json()
    admin.nom = data.get("nom", admin.nom)
    admin.prenom = data.get("prenom", admin.prenom)
    admin.email = data.get("email", admin.email)
    admin.mot_de_passe = data.get("mot_de_passe", admin.mot_de_passe)
    admin.date_naissance = data.get("date_naissance", admin.date_naissance)
    admin.ethnicite = data.get("ethnicite", admin.ethnicite)
    admin.genre = data.get("genre", admin.genre)
    admin.niveau_acces = data.get("niveau_acces", admin.niveau_acces)
    db.session.commit()
    return jsonify({"id": admin.id})

@api_bp.route("/admins/<int:id>", methods=["DELETE"])
def delete_admin(id):
    admin = Admin.query.get_or_404(id)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin supprimé"}), 204


#Reponses
@api_bp.route("/reponses", methods=["GET"])
def get_reponses():
    reponses = Reponse.query.all()
    return jsonify([
        {
            "id": r.id,
            "texte": r.texte,
            "question_id": r.question_id,
            "utilisateur_id": r.utilisateur_id
        } for r in reponses
    ])

@api_bp.route("/reponses/<int:id>", methods=["GET"])
def get_reponse(id):
    r = Reponse.query.get_or_404(id)
    return jsonify({
        "id": r.id,
        "texte": r.texte,
        "question_id": r.question_id,
        "utilisateur_id": r.utilisateur_id
    })

@api_bp.route("/reponses", methods=["POST"])
def create_reponse():
    data = request.get_json()
    r = Reponse(
        texte=data.get("texte"),
        question_id=data.get("question_id"),
        utilisateur_id=data.get("utilisateur_id")
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({"id": r.id}), 201

@api_bp.route("/reponses/<int:id>", methods=["PUT"])
def update_reponse(id):
    r = Reponse.query.get_or_404(id)
    data = request.get_json()
    r.texte = data.get("texte", r.texte)
    r.question_id = data.get("question_id", r.question_id)
    r.utilisateur_id = data.get("utilisateur_id", r.utilisateur_id)
    db.session.commit()
    return jsonify({"id": r.id})

@api_bp.route("/reponses/<int:id>", methods=["DELETE"])
def delete_reponse(id):
    r = Reponse.query.get_or_404(id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Réponse supprimée"}), 204

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Utilisateur.query.filter_by(email=data['email']).first()
    if not user or not Bcrypt.check_password_hash(user.mot_de_passe, data['mot_de_passe']):
        return jsonify({"message": "Identifiants invalides"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200



#Récupérer toutes les réponses existantes du client pour une sous-thématique (afin d’afficher
#ses réponses précédentes)
@api_bp.route("/clients/<int:client_id>/sousthematiques/<int:sous_id>/reponses", methods=["GET"])
def get_reponses_client_sousthematique(client_id, sous_id):
    # Récupérer toutes les questions de la sous-thématique
    questions = Question.query.filter_by(sous_thematique_id=sous_id).all()
    question_ids = [q.id for q in questions]

    # Récupérer toutes les réponses du client liées à ces questions
    reponses = Reponse.query.filter(
        Reponse.utilisateur_id == client_id,
        Reponse.question_id.in_(question_ids)
    ).all()

    response_data = [
        {
            "reponse_id": rep.id,
            "question_id": rep.question_id,
            "texte_reponse": rep.texte
        } for rep in reponses
    ]

    return jsonify(response_data)

#Récupérer toutes les questions (pour la sous-thématique sélectionnée)
@api_bp.route("/sousthematiques/<int:sous_id>/questions", methods=["GET"])
def get_questions_by_sousthematique(sous_id):
    questions = Question.query.filter_by(sous_thematique_id=sous_id).all()

    results = [{
        "id": q.id,
        "texte": q.texte
    } for q in questions]

    return jsonify(results)
