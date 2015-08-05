jQuery.validator.addMethod("mobileZH", function(value, element) {
	return this.optional(element) || /^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/.test(value);
}, "请填写正确的手机号");
