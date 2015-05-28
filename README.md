# flappy-peaks
Clone of HTML5 flappy bird game with peaks colors

# url du jeux
[http://peaks-lyon.github.io/flappy-peaks](http://peaks-lyon.github.io/flappy-peaks)

# Contribuer

## Installation
```sh
git clone https://github.com/peaks-lyon/flappy-peaks.git
cd flappy-peaks
npm install
```
npm install permet de récupérer les dépendances pour lancer un server web local. Ce server permet de fournir les assets pour phaser.io 

## développement
Il faut lancer un server web avec la commande suivante
```sh
npm run gulp connect
```
Ensuite, se rendre sur [http://localhost:8080](http://localhost:8080)


# publier
Pour publier le projet. Il faut lancer la commande
```sh
npm run publish
```
Cette commande situer dans [package.json](package.json) écrase la branche origin *gh-pages* par la branche origin *master*