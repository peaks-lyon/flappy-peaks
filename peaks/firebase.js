var FirebaseRepository = (function () {
    function FirebaseRepository() {
        this.flappyPeaksFirebaseRef = new Firebase("https://flappypeaks.firebaseio.com/highscores");
        this.date = new Date().toString();
    }

    FirebaseRepository.prototype.saveHighscore = function (email, prenom, nom, bestScore) {
        var childRef = this.flappyPeaksFirebaseRef.push();
        childRef.set({
            email: email,
            prenom: prenom,
            nom: nom,
            bestscore: bestScore,
            date: this.date
        });
    };

    return FirebaseRepository;
})();
