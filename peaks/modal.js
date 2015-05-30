var Modal = (function () {
    function Modal(selector) {
        this.modal = document.querySelector(selector);
    }

    Modal.prototype.show = function () {
        this.modal.style.visibility = 'visible';
        return this;
    };

    Modal.prototype.hide = function () {
        this.modal.style.visibility = 'hidden';
        return this;
    };

    return Modal;
})();
