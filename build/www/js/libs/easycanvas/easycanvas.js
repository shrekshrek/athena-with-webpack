/*!
 * VERSION: 0.1.0
 * DATE: 2015-08-25
 * GIT:https://github.com/shrekshrek/easycanvas
 *
 * @author: Shrek.wang, shrekshrek@gmail.com
 **/

(function (factory) {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            root.EC = factory(root, exports);
        });
    } else if (typeof exports !== 'undefined') {
        factory(root, exports);
    } else {
        root.EC = factory(root, {});
    }

}(function (root, EC) {
    var previousEC = root.EC;

    EC.VERSION = '0.1.0';

    EC.noConflict = function () {
        root.EC = previousEC;
        return this;
    };

    // --------------------------------------------------------------------extend
    var keys = function (obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };

    var extend = function (obj) {
        var length = arguments.length;
        if (length < 2 || obj == null) return obj;
        for (var index = 1; index < length; index++) {
            var source = arguments[index],
                ks = keys(source),
                l = ks.length;
            for (var i = 0; i < l; i++) {
                var key = ks[i];
                obj[key] = source[key];
            }
        }
        return obj;
    };

    var extend2 = function (protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && Object.prototype.hasOwnProperty.call(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }

        extend(child, parent, staticProps);

        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (protoProps) extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;

        return child;
    };

    // --------------------------------------------------------------------基类


    EC.STROKE_CAPS_MAP = ["butt", "round", "square"];
    EC.STROKE_JOINTS_MAP = ["miter", "round", "bevel"];
    EC.TEXT_ALIGN_MAP = ["center", "end", "left", "right", "start"];
    EC.TEXT_BASELINE_MAP = ["alphabetic", "top", "hanging", "middle", "ideographic", "bottom"];

    EC.Object = function () {
        this.initialize.apply(this, arguments);
    };

    extend(EC.Object.prototype, {
        x: 0,
        y: 0,
        position: function (x, y) {
            switch (arguments.length) {
                case 1 :
                    this.x = x;
                    this.y = x;
                    return this;
                case 2 :
                    this.x = x;
                    this.y = y;
                    return this;
            }
            return this;
        },
        move: function (x, y) {
            switch (arguments.length) {
                case 1 :
                    this.x += x;
                    this.y += x;
                    return this;
                case 2 :
                    this.x += x;
                    this.y += y;
                    return this;
            }
            return this;
        },

        rotation: 0,
        rotate: function (x) {
            switch (arguments.length) {
                case 1 :
                    this.rotation += x;
                    return this;
            }
            return this;
        },

        scaleX: 0,
        scaleY: 0,
        scale: function (x, y) {
            switch (arguments.length) {
                case 1 :
                    this.scaleX = x;
                    this.scaleY = x;
                    return this;
                case 2 :
                    this.scaleX = x;
                    this.scaleY = y;
                    return this;
            }
            return this;
        },

        width: 0,
        height: 0,
        size: function (x, y) {
            switch (arguments.length) {
                case 1 :
                    this.width = x;
                    this.height = x;
                    return this;
                case 2 :
                    this.width = x;
                    this.height = y;
                    return this;
            }
            return this;
        },

        initialize: function () {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.width = 0;
            this.height = 0;
            this.children = [];
        },
        destroy: function () {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].destroy();
            }
            this.children = [];
        },

        parent: null,
        children: null,
        index: null,
        addChild: function (view) {
            if (view.parent)
                view.parent.removeChild(view);

            var _len = this.children.length;
            view.parent = this;
            view.index = _len;
            this.children[_len] = view;

            return this;
        },
        addChildAt: function (view, index) {
            if (view.parent)
                view.parent.removeChild(view);

            var _len = this.children.length;
            var _index = Math.max(0, Math.min(_len - 1, index));
            this.children.splice(_index, 0, view);
            view.parent = this;

            for (var i = _len - 1; i >= 0; i--) {
                this.children[i].index = i;
            }

            return this;
        },
        removeChild: function (view) {
            if (view.parent !== this) return;

            this.children.splice(view.index, 1);
            view.parent = null;
            view.index = null;

            var _len = this.children.length;
            for (var i = _len - 1; i >= 0; i--) {
                this.children[i].index = i;
            }

            return this;
        }
    });
    EC.Object.extend = extend2;


    // --------------------------------------------------------------------核心元件
    EC.Sprite = EC.Object.extend({
        update: function (ctx) {
            if (!ctx) return;
            ctx.save();
            this.transform(ctx);
            this.childUpdate(ctx);
            ctx.restore();

        },

        transform: function (ctx) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.scale(this.scaleX, this.scaleY);
        },

        childUpdate: function (ctx) {
            var _len = this.children.length;
            for (var i = 0; i < _len; i++) {
                var _child = this.children[i];
                _child.update(ctx);
            }
        }

    });


    EC.Stage = EC.Sprite.extend({
        el: null,
        ctx: null,
        initialize: function (params) {
            EC.Stage.__super__.initialize.apply(this, [params]);

            var _dom;
            if (params && params.el) {
                _dom = params.el;
            } else {
                _dom = document.createElement("canvas");
            }

            this.ctx = _dom.getContext('2d');
            this.el = _dom;
            _dom.le = this;
        },

        update: function () {
            this.ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.ctx.save();
            this.childUpdate(this.ctx);
            this.ctx.restore();
            return this;
        }
    });


    EC.Bitmap = EC.Sprite.extend({
        image: null,
        initialize: function (params) {
            EC.Stage.__super__.initialize.apply(this, [params]);

            if (params && params.image) {
                this.image = params.image;
            }

            this.originX = 0.5;
            this.originY = 0.5;
        },

        update: function (ctx) {
            if (!ctx) return;
            ctx.save();
            this.transform(ctx);
            ctx.drawImage(this.image, -this.image.width * this.originX, -this.image.height * this.originY, this.image.width, this.image.height);
            this.childUpdate(ctx);
            ctx.restore();
        },

        originX: 0,
        originY: 0,
        origin: function (x, y) {
            switch (arguments.length) {
                case 1 :
                    this.originX = Math.max(0, Math.min(1, x));
                    this.originY = Math.max(0, Math.min(1, x));
                    return this;
                case 2 :
                    this.originX = Math.max(0, Math.min(1, x));
                    this.originY = Math.max(0, Math.min(1, y));
                    return this;
            }
            return this;
        }

    });


    EC.Graphic = EC.Sprite.extend({
        actions: [],
        initialize: function (params) {
            EC.Graphic.__super__.initialize.apply(this, [params]);

            this.actions = [];
        },

        update: function (ctx) {
            if (!ctx) return;
            ctx.save();
            this.transform(ctx);
            this.updateG(ctx);
            this.childUpdate(ctx);
            ctx.restore();
        },

        updateG: function (ctx) {
            var _len = this.actions.length;
            for (var i = 0; i < _len; i++) {
                this.actions[i].update(ctx);
            }
        },

        clear: function () {
            this.actions = [];
        },

        fill: function (style) {
            this.actions.push(new G.fill(style));
        },
        strokeStyle: function (width, caps, joints, miterLimit, ignoreScale) {
            this.actions.push(new G.strokeStyle(width, caps, joints, miterLimit, ignoreScale));
        },
        stroke: function (style) {
            this.actions.push(new G.stroke(style));
        },
        moveTo: function (x, y) {
            this.actions.push(new G.moveTo(x, y));
        },
        lineTo: function (x, y) {
            this.actions.push(new G.lineTo(x, y));
        },
        arcTo: function (x1, y1, x2, y2, radius) {
            this.actions.push(new G.arcTo(x1, y1, x2, y2, radius));
        },
        arc: function (x, y, radius, startAngle, endAngle, anticlockwise) {
            this.actions.push(new G.arc(x, y, radius, startAngle, endAngle, anticlockwise));
        },
        quadraticCurveTo: function (cpx, cpy, x, y) {
            this.actions.push(new G.quadraticCurveTo(cpx, cpy, x, y));
        },
        bezierCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.actions.push(new G.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y));
        },
        rect: function (x, y, w, h) {
            this.actions.push(new G.rect(x, y, w, h));
        },
        closePath: function () {
            this.actions.push(new G.closePath());
        },
        beginPath: function () {
            this.actions.push(new G.beginPath());
        },
        circle: function (x, y, radius) {
            this.actions.push(new G.circle(x, y, radius));
        },
        ellipse: function (x, y, w, h) {
            this.actions.push(new G.ellipse(x, y, w, h));
        }

    });


    EC.Text = EC.Sprite.extend({
        actions: [],
        initialize: function (params) {
            EC.Text.__super__.initialize.apply(this, [params]);

            this.actions = [];
        },

        update: function (ctx) {
            if (!ctx) return;
            ctx.save();
            this.transform(ctx);
            this.updateG(ctx);
            this.childUpdate(ctx);
            ctx.restore();
        },

        updateG: function (ctx) {
            var _len = this.actions.length;
            for (var i = 0; i < _len; i++) {
                this.actions[i].update(ctx);
            }
        },

        clear: function () {
            this.actions = [];
        },

        fontStyle: function (font, textAlign, textBaseline) {
            this.actions.push(new G.fontStyle(font, textAlign, textBaseline));
        },
        fillText: function (text, x, y, maxWidth) {
            this.actions.push(new G.fillText(text, x, y, maxWidth));
        },
        strokeText: function (text, x, y, maxWidth) {
            this.actions.push(new G.strokeText(text, x, y, maxWidth));
        }

    });


    var G = {};

    //---------------------------------------------------------------------------graphic
    (G.fill = function (style) {
        this.style = style;
    }).prototype.update = function (ctx) {
        ctx.fillStyle = this.style;
        ctx.fill();
    };

    (G.strokeStyle = function (width, caps, joints, miterLimit, ignoreScale) {
        this.width = width;
        this.caps = caps;
        this.joints = joints;
        this.miterLimit = miterLimit;
        this.ignoreScale = ignoreScale;
    }).prototype.update = function (ctx) {
        ctx.lineWidth = (this.width == null ? "1" : this.width);
        ctx.lineCap = (this.caps == null ? "butt" : (isNaN(this.caps) ? this.caps : EC.STROKE_CAPS_MAP[this.caps]));
        ctx.lineJoin = (this.joints == null ? "miter" : (isNaN(this.joints) ? this.joints : EC.STROKE_JOINTS_MAP[this.joints]));
        ctx.miterLimit = (this.miterLimit == null ? "10" : this.miterLimit);
        ctx.ignoreScale = (this.ignoreScale == null ? false : this.ignoreScale);
    };

    (G.stroke = function (style) {
        this.style = style;
    }).prototype.update = function (ctx) {
        ctx.strokeStyle = this.style;
        ctx.stroke();
    };

    (G.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    }).prototype.update = function (ctx) {
        ctx.moveTo(this.x, this.y);
    };

    (G.lineTo = function (x, y) {
        this.x = x;
        this.y = y;
    }).prototype.update = function (ctx) {
        ctx.lineTo(this.x, this.y);
    };

    (G.arcTo = function (x1, y1, x2, y2, radius) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.radius = radius;
    }).prototype.update = function (ctx) {
        ctx.arcTo(this.x1, this.y1, this.x2, this.y2, this.radius);
    };

    (G.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.anticlockwise = !!anticlockwise;
    }).prototype.update = function (ctx) {
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
    };

    (G.quadraticCurveTo = function (cpx, cpy, x, y) {
        this.cpx = cpx;
        this.cpy = cpy;
        this.x = x;
        this.y = y;
    }).prototype.update = function (ctx) {
        ctx.quadraticCurveTo(this.cpx, this.cpy, this.x, this.y);
    };

    (G.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        this.cp1x = cp1x;
        this.cp1y = cp1y;
        this.cp2x = cp2x;
        this.cp2y = cp2y;
        this.x = x;
        this.y = y;
    }).prototype.update = function (ctx) {
        ctx.bezierCurveTo(this.cp1x, this.cp1y, this.cp2x, this.cp2y, this.x, this.y);
    };

    (G.rect = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }).prototype.update = function (ctx) {
        ctx.rect(this.x, this.y, this.w, this.h);
    };

    (G.closePath = function () {
    }).prototype.update = function (ctx) {
        ctx.closePath();
    };

    (G.beginPath = function () {
    }).prototype.update = function (ctx) {
        ctx.beginPath();
    };

    (G.circle = function (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }).prototype.update = function (ctx) {
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    };

    (G.ellipse = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }).prototype.update = function (ctx) {
        var x = this.x, y = this.y;
        var w = this.w, h = this.h;

        var k = 0.5522848;
        var ox = (w / 2) * k;
        var oy = (h / 2) * k;
        var xe = x + w;
        var ye = y + h;
        var xm = x + w / 2;
        var ym = y + h / 2;

        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    };

    //---------------------------------------------------------------------------text
    (G.fontStyle = function (font, textAlign, textBaseline) {
        this.font = font;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
    }).prototype.update = function (ctx) {
        ctx.font = (this.font == null ? "1" : this.font);
        ctx.textAlign = (this.textAlign == null ? "start" : (isNaN(this.textAlign) ? this.textAlign : EC.TEXT_ALIGN_MAP[this.textAlign]));
        ctx.textBaseline = (this.textBaseline == null ? "alphabetic" : (isNaN(this.textBaseline) ? this.textBaseline : EC.TEXT_BASELINE_MAP[this.textBaseline]));
    };

    (G.fillText = function (text, x, y, maxWidth) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.maxWidth = maxWidth;
    }).prototype.update = function (ctx) {
        ctx.fillText(this.text, this.x, this.y, this.maxWidth);
    };

    (G.strokeText = function (text, x, y, maxWidth) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.maxWidth = maxWidth;
    }).prototype.update = function (ctx) {
        ctx.strokeText(this.text, this.x, this.y, this.maxWidth);
    };


    return EC;
}));
