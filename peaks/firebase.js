var FirebaseRepository = (function () {
    function FirebaseRepository() {
        this.flappyPeaksFirebaseRef = new Firebase("https://flappypeaks.firebaseio.com/highscores");
        this.date = new Date().toLocaleString();
    }

    FirebaseRepository.prototype.saveHighscore = function (email, bestScore) {
        var childRef = this.flappyPeaksFirebaseRef.push();
        childRef.set({
            email: email,
            bestscore: bestScore,
            date: this.date
        });
    };

    FirebaseRepository.prototype.findBestHighScore = function () {
        this.flappyPeaksFirebaseRef.orderByChild("bestscore").limitToLast(1).once("value", function(data) {
            var bestHighScore = data.val().bestscore;
            console.log(bestHighScore);
        });
    };

    return FirebaseRepository;
})();
