from flask import Blueprint, jsonify, request, abort
from .models import Thematique, SousThematique, Question, Utilisateur, Admin, Reponse
from .extensions import db
from datetime import datetime 
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

api_bp = Blueprint("api", __name__)

# Thematique routes
@api_bp.route("/thematiques", methods=["GET"])
def get_thematiques():
    """
    Get a list of all thematiques.
    Returns:
        JSON list of thematiques.
    """
    thematiques = Thematique.query.all()
    return jsonify([{"id": t.id, "name": t.name} for t in thematiques])

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


# SousThematique routes

@api_bp.route("/sousthematiques", methods=["GET"])
def get_sousthematiques():
    """
    Get a list of all sous thematiques.
    Returns:
        JSON list of sous thematiques with their thematique_id.
    """
    sous_thematiques = SousThematique.query.all()
    return jsonify([
        {"id": s.id, "titre": s.titre, "thematique_id": s.thematique_id} for s in sous_thematiques
    ])

@api_bp.route("/sousthematiques/<int:id>", methods=["GET"])
def get_sousthematique(id):
    """
    Get a single sous thematique by ID.
    Args:
        id (int): SousThematique ID.
    Returns:
        JSON of the sous thematique data or 404 if not found.
    """
    sous_thematique = SousThematique.query.get_or_404(id)
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id})

@api_bp.route("/sousthematiques", methods=["POST"])
def create_sousthematique():
    """
    Create a new sous thematique.
    Request JSON:
        { "titre": "Some Title", "thematique_id": 1 }
    Returns:
        JSON of the created sous thematique with 201 status.
    """
    data = request.get_json()
    if not data or "titre" not in data or "thematique_id" not in data:
        abort(400, description="Missing 'titre' or 'thematique_id'")
    sous_thematique = SousThematique(titre=data["titre"], thematique_id=data["thematique_id"])
    db.session.add(sous_thematique)
    db.session.commit()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id}), 201

@api_bp.route("/sousthematiques/<int:id>", methods=["PUT"])
def update_sousthematique(id):
    """
    Update a sous thematique by ID.
    Args:
        id (int): SousThematique ID.
    Request JSON:
        { "titre": "Updated Title", "thematique_id": 2 }
    Returns:
        JSON of the updated sous thematique.
    """
    sous_thematique = SousThematique.query.get_or_404(id)
    data = request.get_json()
    if not data or "titre" not in data or "thematique_id" not in data:
        abort(400, description="Missing 'titre' or 'thematique_id'")
    sous_thematique.titre = data["titre"]
    sous_thematique.thematique_id = data["thematique_id"]
    db.session.commit()
    return jsonify({"id": sous_thematique.id, "titre": sous_thematique.titre, "thematique_id": sous_thematique.thematique_id})

@api_bp.route("/sousthematiques/<int:id>", methods=["DELETE"])
def delete_sousthematique(id):
    """
    Delete a sous thematique by ID.
    Args:
        id (int): SousThematique ID.
    Returns:
        JSON success message with 204 status.
    """
    sous_thematique = SousThematique.query.get_or_404(id)
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


#utilisateurs
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

