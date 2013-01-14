define([
    'jquery',
    'underscore',
    './view'
], function($, _, View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .btn': 'onClick'
        },
        initialize: function() {
            this.template = _.template($('#login_template').html());
            this.model.on('change:status', this.render, this);
        },
        onClick: function(ev) {
            if(this.$('.btn').hasClass('disabled')) {
                return;
            }
            this.$('.btn').addClass('disabled');
            this.model.login();
        },
        render: function() {
            this.$el.html(this.template());
            if(this.model.get('status')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }            
            return this;
        }
    });
    return LoginView;
});