var flappyPeaksFirebaseRef = new Firebase("https://flappypeaks.firebaseio.com/highscores");
var date = new Date().toLocaleString();

function saveHighscore (email, bestScore) {
    var childRef = flappyPeaksFirebaseRef.push();
    childRef.set({
        email: email,
        bestscore: bestScore,
        date: date
    });
}

function findBestHighScore() {
    flappyPeaksFirebaseRef.orderByChild("bestscore").limitToLast(1).once("value", function(data) {
        console.log(data.val());
    });
}