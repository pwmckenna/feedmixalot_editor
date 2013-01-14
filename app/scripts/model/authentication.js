define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function() {
            this.feeds = new Firebase('https://feedmixalot.firebaseIO.com/feeds');
            this.auth = new FirebaseAuthClient(this.feeds);
            this.set('status', false);
        },
        login: function() {
            this.auth.login('facebook', _.bind(this.onLogin, this));
        },
        onLogin: function(error, token, user) {
            console.log('onLogin', error, token, user);
            if (!error) {
                // You can now do Firebase operations as an authenticated user...
                console.log('User ID: ' + user.id); // '1234'
                console.log('Provider: ' + user.provider); // 'facebook'
                this.set('user', user);
                this.set('token', token);
                this.set('status', true);
            } else {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});