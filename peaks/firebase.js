var FirebaseRepository = (function () {
    function FirebaseRepository() {
        this.flappyPeaksFirebaseRef = new Firebase("https://flappypeaks.firebaseio.com/highscores");
        this.date = new Date().toString();
    }

    FirebaseRepository.prototype.saveHighscore = function (email, prenom, nom, bestScore, onComplete) {
        var childRef = this.flappyPeaksFirebaseRef.push();
        childRef.set({
            email: email,
            prenom: prenom,
            nom: nom,
            bestscore: bestScore,
            date: this.date
        }, onComplete);
    };

    FirebaseRepository.prototype.findBestHighScore = function (email) {
        this.flappyPeaksFirebaseRef.orderByChild('email').once('value', function(data) {
            var score = _.max(data.exportVal(), function(score){ return score.bestscore; });
            alert('Ton meilleur score : ' + score.bestscore);
        });
    };

    return FirebaseRepository;
})();
