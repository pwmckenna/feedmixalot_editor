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
            this.set('status', 'disconnected');
        },
        getLoginStatus: function() {
            console.log('getLoginStatus');
            FB.getLoginStatus(_.bind(this.onLoginStatus, this));
        },
        onLoginStatus: function(response) {
            console.log('onLoginStatus', response);
            this.set('status', response.status);
            this.set(response.authResponse);
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
            } else {
                console.log(error);
            }
            this.getLoginStatus();
        }
    });
    return AuthenticationModel;
});