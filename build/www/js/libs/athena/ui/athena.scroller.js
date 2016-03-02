define(['athena', 'jstween'], function() {
    var view = Athena.View.extend({
        $target : null,
        $parent : null,
        $box : null,
        $bg : null,
        targetPos0 : null,
        mousePos0 : null,
        touchPos0 : null,
        direction : null, //v竖向，h横向
        parentRect : null,
        targetRect : null,
        dragRect : null,
        hasTouch : null,
        init : function() {
            view.__super__.init.apply(this);

            if (document.hasOwnProperty && document.hasOwnProperty("ontouchstart"))
                this.hasTouch = true;
            else
                this.hasTouch = false;

            if (this.args.direction || this.args.direction == 'v' || this.args.direction == 'h')
                this.direction = this.args.direction;

            if (this.args.content) {
                this.$target = this.args.content;
                this.$parent = this.$target.parent();
            }

            this.mousePos0 = {
                x : 0,
                y : 0
            };
            this.touchPos0 = {
                x : 0,
                y : 0
            };
            this.direction = 'v';
            this.parentRect = {
                width : 0,
                height : 0
            };
            this.targetRect = {
                width : 0,
                height : 0
            };
            this.dragRect = {
                width : 0,
                height : 0
            };
            this.targetPos0 = {
                x : parseFloat(this.$target.css('margin-left')),
                y : parseFloat(this.$target.css('margin-top'))
            };

            if (this.args.bar) {
                this.$el = this.args.bar;
            } else if (this.$parent.find('.scroll-bar').length == 0) {
                this.$parent.append('<div class="scroll-bar"><div class="scroll-bg"></div><div class="scroll-box"></div></div>');
                this.$el = this.$parent.find('.scroll-bar');
            } else {
                throw "scoller havn't bar!!!";
            }

            //this.$el.css({'position':'absolute'});
            this.$bg = this.$el.find('.scroll-bg');
            //this.$bg.css({'position':'absolute','left':0,'top':0});
            this.$box = this.$el.find('.scroll-box');
            //this.$box.css({'position':'absolute','left':0,'top':0,'cursor':'pointer'});

            this.update();
        },
        destroy : function() {
            this.frozen();
            view.__super__.destroy.apply(this);
        },
        active : function() {
            this.frozen();
            if (this.hasTouch) {
                this.$parent.on('touchstart', {
                    self : this
                }, this._touchStart);
            } else {
                this.$box.on('mousedown', {
                    self : this
                }, this._mouseDown);
            }
        },
        frozen : function() {
            this._dragOff();
            if (this.hasTouch) {
                this.$parent.off('touchstart', this._touchStart);
            } else {
                this.$box.off('mousedown', this._mouseDown);
            }
        },
        _touchDragOn : function() {
            $(document).on('touchmove', {
                self : this
            }, this._touchMove);
            $(document).on('touchend', {
                self : this
            }, this._touchEnd);
        },
        _touchDragOff : function() {
            $(document).off('touchmove', this._touchMove);
            $(document).off('touchend', this._touchEnd);
        },
        _touchStart : function(event) {
            var _self = event.data.self;
            event.preventDefault();
            event = event.originalEvent.touches[0];
            _self.touchPos0.y = event.clientY;
            _self.touchPos0.x = event.clientX;
            _self._touchDragOn();
            return false;
        },
        _touchMove : function(event) {
            var _self = event.data.self;
            event.preventDefault();
            event = event.originalEvent.touches[0];

            switch (_self.direction) {
            case 'v':
                var _dy = (_self.touchPos0.y - event.clientY) / _self.targetRect.height * _self.parentRect.height;
                _self._scrollTo(parseFloat(_self.$box.css('margin-top')) + _dy);
                break;
            case 'h':
                var _dx = (_self.touchPos0.x - event.clientX) / _self.targetRect.width * _self.parentRect.width;
                _self._scrollTo(parseFloat(_self.$box.css('margin-left')) + _dx);
                break;
            }
            _self.touchPos0.y = event.clientY;
            _self.touchPos0.x = event.clientX;
            return false;
        },
        _touchEnd : function(event) {
            var _self = event.data.self;
            _self._touchDragOff();
            return false;
        },
        _dragOn : function() {
            $(document).on('mousemove', {
                self : this
            }, this._mouseMove);
            $(document).on('mouseup', {
                self : this
            }, this._mouseUp);
        },
        _dragOff : function() {
            $(document).off('mousemove', this._mouseMove);
            $(document).off('mouseup', this._mouseUp);
        },
        _mouseDown : function(event) {
            var _self = event.data.self;
            _self.mousePos0.y = event.clientY - parseFloat(_self.$box.css('margin-top'));
            _self.mousePos0.x = event.clientX - parseFloat(_self.$box.css('margin-left'));
            _self._dragOn();
            return false;
        },
        _mouseMove : function(event) {
            var _self = event.data.self;
            var event = event || window.event;
            switch (_self.direction) {
            case 'v':
                var _dy = event.clientY - _self.mousePos0.y;
                _self._scrollTo(_dy);
                break;
            case 'h':
                var _dx = event.clientX - _self.mousePos0.x;
                _self._scrollTo(_dx);
                break;
            }
            return false;
        },
        _mouseUp : function(event) {
            var _self = event.data.self;
            _self._dragOff();
            return false;
        },
        _scrollTo : function(num) {
            var _self = this;
            switch (_self.direction) {
            case 'v':
                var _dy = num;
                _dy = Math.min(_self.dragRect.height, Math.max(0, _dy));
                _self.$box.css({
                    'margin-top' : _dy
                });
                var _y = -_dy / _self.dragRect.height * (_self.targetRect.height - _self.parentRect.height) + this.targetPos0.y;
                JT.kill(_self.$target);
                JT.to(_self.$target, 0.3, {
                    marginTop : _y,
                    marginLeft : this.targetPos0.x
                });
                break;
            case 'h':
                var _dx = num;
                _dx = Math.min(_self.dragRect.width, Math.max(0, _dx));
                _self.$box.css({
                    'margin-left' : _dx
                });
                var _x = -_dx / _self.dragRect.width * (_self.targetRect.width - _self.parentRect.width) + this.targetPos0.x;
                JT.kill(_self.$target);
                JT.to(_self.$target, 0.3, {
                    marginTop : this.targetPos0.y,
                    marginLeft : _x
                });
                break;
            }
        },
        update : function() {
            this.parentRect.width = this.$parent.width();
            this.parentRect.height = this.$parent.height();
            this.targetRect.width = this.$target.width() + this.targetPos0.x;
            this.targetRect.height = this.$target.height() + this.targetPos0.y;

            switch (this.direction) {
            case 'v':
                if (this.targetRect.height <= this.parentRect.height) {
                    this.$el.css({
                        'display' : 'none'
                    });
                    return;
                } else {
                    this.$el.css({
                        'display' : 'block'
                    });
                }
                this.$bg.height(this.parentRect.height);
                var _n = this.parentRect.height / this.targetRect.height * this.parentRect.height | 0;
                this.$box.height(_n);
                this.dragRect.height = this.parentRect.height - _n;
                var _y = parseFloat(this.$target.css('margin-top'));
                this.$target.css({'margin-top' : Math.min(this.targetPos0.y, Math.max(this.targetRect.height - this.parentRect.height - this.targetPos0.y, _y))});
                this.$box.css({
                    'margin-top' : (_y - this.targetPos0.y) / (this.parentRect.height - this.targetRect.height) * this.dragRect.height
                });
                break;
            case 'h':
                if (this.targetRect.width <= this.parentRect.width) {
                    this.$el.css({
                        'display' : 'none'
                    });
                    return;
                } else {
                    this.$el.css({
                        'display' : 'block'
                    });
                }
                this.$bg.width(this.parentRect.width);
                var _n = this.parentRect.width / this.targetRect.width * this.parentRect.width | 0;
                this.$box.width(_n);
                this.dragRect.width = this.parentRect.width - _n;
                var _x = parseFloat(this.$target.css('margin-left'));
                this.$target.css({'margin-left' : Math.min(this.targetPos0.x, Math.max(this.targetRect.width - this.parentRect.width - this.targetPos0.x, _x))});
                this.$box.css({
                    'margin-left' : (_x - this.targetPos0.x) / (this.targetRect.width - this.parentRect.width) * this.dragRect.width
                });
                break;
            }
            if (this.targetRect.height > 0)
                this.active();
            else
                this.frozen();
        },
        reset : function() {
            this.$box.css({
                'margin-left' : 0,
                'margin-top' : 0
            });
            this.$target.css({
                'margin-left' : this.targetPos0.x,
                'margin-top' : this.targetPos0.y
            });
        }
    });
    return view;
});
