define(["athena", "csstween"], function() {
    var view = Athena.view.BaseBtn.extend({
        $obj1: null,
        $obj2: null,
        alpha1: [1, 0],
        alpha2: [0, 1],
        time: 0.2,
        init: function() {
            Athena.view.BaseBtn.prototype.init.apply(this);
            if (this.args.time) {
                this.time = this.args.time;
            }
            if (this.args.alpha) {
                if (this.args.alpha[0])
                    this.alpha1 = this.args.alpha[0];
                if (this.args.alpha[1])
                    this.alpha2 = this.args.alpha[1];
            }
            this.$obj1 = this.$el.children('.normal');
            this.$obj2 = this.$el.children('.hover');
            if (this.$obj1)
                this.$obj1.css({"opacity": this.alpha1[0]});
            if (this.$obj2)
                this.$obj2.css({"opacity": this.alpha2[0]});
        },
        mouseOverHandler: function() {
            if (this._isSelected)
                return;
            if (this.$obj1) {
                CT.to(this.$obj1, this.time, {autoAlpha: this.alpha1[1]});
            }
            if (this.$obj2) {
                CT.to(this.$obj2, this.time, {autoAlpha: this.alpha2[1]});
            }
        },
        mouseOutHandler: function() {
            if (this._isSelected)
                return;
            if (this.$obj1) {
                CT.to(this.$obj1, this.time, {autoAlpha: this.alpha1[0]});
            }
            if (this.$obj2) {
                CT.to(this.$obj2, this.time, {autoAlpha: this.alpha2[0]});
            }
        }
    });
    return view;
});
