Le format du formulaire de report est le suivant :

{
  "key": "FORM_34_32", 						    <-- Code du formulaire de la forme "FORM_" + ast_code + "_" + wtr_code
  "editable": true,
  "definitions": [							      <-- Liste des questions
	
	La première définition est particulière, elle n'est pas affichée. Elle sert de chapeau pour toutes les questions du formulaire
  
    {
      "key": "questionPrincipal",			<-- Sa clé est toujours "questionPrincipal"
      "type": "section",					    <-- De type "section"
      "label": "",
      "component": "question",
      "editable": true,
      "attributes": {},
      "rules": []
    },
	
	
	Ensuite il y a les questions du formulaire dans l'ordre d'affichage
	
    {
      "key": "UUID-10",						        <-- Code de la question dans le formulaire, de la forme "UUID-" + index
      "type": "property",					        <-- De type "property"
      "label": "Origine du débordement",	<-- Libellé de la question
      "component": "select",				      <-- Type d'affichage, actuellement "select", "input" et "comment"
      "canBeDeleted": true,               <-- Indique si la question peut etre supprimé lorsqu'un utilisateur personnalisera ce formulaire pour un contrat
      "editable": true,
      "attributes": {						          <-- Précision du type d'affichage.
        "value": "",
        "options": [							          <-- Dans le cas du select, liste des valeurs de la liste
          {
            "key": "Casse ",
            "value": "Casse "
          },
          {
            "key": "Contre-pente",
            "value": "Contre-pente"
          }
        ],
        "multiple": false						        <-- Dans le cas du select, si on peut sélectionner plusieurs valeurs
      },
      "rules": [							            <-- Règle de la question, actuellement il y a que la règle sur le fait que le champ est obligatoire
        {
          "key": "required",					          <-- Code de l'erreur
          "value": "Obligatoire",
          "message": "Ce champ est obligatoire"	<-- Message d'erreur affiché si la règle n'est pas respectée
        }
      ],
      "section": "questionPrincipal",		  <-- Rattachement de la question à la question chapeau
      "displayCondition": {               <-- Condition d'affichage de la question
        "key": "UUID-2",                    <-- Code de la question dans le formulaire qui conditionne l'affichage de la question
        "value": [                          <-- Liste des réponses à la question conditionnant l'affichage de la question
          "Autre (à préciser)"                Ce qui veut dire que pour que cette question soit affiché, il faut que au moins la réponse "Autre (à préciser)" pour la question de code UUID-2 soit sélectionnée
        ]
      },
      "rqnCode": "UUID-115"					      <-- Code de la question dans le dictionnaire de question
    },
    
	
    {
      "key": "UUID-30",
      "type": "property",
      "label": "Volume d''effluents pompés",
      "component": "input",
      "editable": true,
      "attributes": {
        "type": "number",						        <-- Dans le cas du input, on peut préciser c'est un input de type number. Si c'est un input text attributes est vide.
        "hiddenNull": false
      },
      "rules": [
        {
          "key": "required",
          "value": "Obligatoire",
          "message": "Ce champ est obligatoire"
        }
      ],
      "section": "questionPrincipal",
      "rqnCode": "UUID-239"
    },
	
	
    {
      "key": "COMMENT",							    <-- Cas particulier pour le champ commentaire, son code est toujours "COMMENT" (car on a besoin de le récupérer après le remplissage du formulaire pour le renvoyer à Praxedo)
      "type": "property",
      "label": "Commentaire",
      "component": "comment",					  <-- Son type d'affichage est "comment"
      "editable": true,
      "attributes": {},
      "rules": [
        {
          "key": "required",
          "value": "Obligatoire",
          "message": "Ce champ est obligatoire"
        }
      ],
      "section": "questionPrincipal",
      "rqnCode": "UUID-25"
    }

Il y a, à la fin, la liste des questions optionnelles.
Ces questions pourront être ajouter à un formulaire personnalisé d'un contrat.
Elles ne sont pas affichées dans le report.
    {
      "key": "optional",							    <-- Toujours "optional"
      "type": "property",
      "label": "",
      "component": "",					  
      "editable": true,
      "attributes": {},
      "rules": [],
      "section": "questionPrincipal",
      "rqnCode": "UUID-147",
      isOptional: true                    <-- Indique que c'est une question optionelle
    }
  ],
  "relations": []
}