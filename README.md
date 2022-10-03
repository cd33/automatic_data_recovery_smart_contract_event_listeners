# automatic_data_recovery_smart_contract_event_listeners
* Exemple simple d'un système permettant la récupération d'information à partir d'un smart contract.  
Les informations sont stockées dans une base de données Firestore.  
Grâce aux event listeners, la base de données est mise à jour à chaque modification du smart contract.
----------------
* A simple example of a system for retrieving information from a smart contract.  
The information is stored in a Firestore database.  
Thanks to the event listeners, the database is updated each time the smart contract is modified.

## Installation
* Pour tester le projet, il vous faut créer une bdd firestore grâce à [Firebase](https://firebase.google.com/).  
Une fois votre projet créé, allez dans les Paramètres du projet/Comptes de service/SDK Admin Firebase/Générer une nouvelle clé privée.  
Vous pourrez ainsi remplir le fichier key.json avec vos informations.  
* Créez un fichier .env qui contient le lien pour accéder au JsonRpcProvider dans mon exemple, j'utilise [Infura](https://infura.io/)
```
INFURA="https://rinkeby.infura.io/v3/XXX"
```
* Remplacez les champs "address721" par l'adresse de votre contrat.
* Remplacez "Bibs721.json" par votre propre artifact.
* Faites un "npm install" à la racine du projet puis un "npm start" pour le lancer.
----------------
* To test the project, you need to create a firestore db with [Firebase](https://firebase.google.com/).  
Once your project is created, go to Project Settings/Service Accounts/SDK Admin Firebase/Generate new private key.  
This will allow you to fill the key.json file with your information.  
* Replace the fields "address721" with the address of your contract.
* Replace "Bibs721.json" with your own artifact.
* Create an .env file that contains the link to access the JsonRpcProvider in my example, I am using [Infura](https://infura.io/)
```
INFURA="https://rinkeby.infura.io/v3/XXX"
```
* Do an "npm install" at the root of the project and then an "npm start" to launch it.