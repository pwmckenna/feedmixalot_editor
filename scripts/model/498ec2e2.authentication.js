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
            this.getLoginStatus();
        },
        getLoginStatus: function() {
            FB.getLoginStatus(_.bind(this.onLoginStatus, this));
        },
        onLoginStatus: function(response) {
            this.set('status', response.status);
            this.set(response.authResponse);
        },
        login: function() {
            this.auth.login('facebook', _.bind(function(error, token, user) {
                console.log(error, token, user);
                if (!error) {
                    // You can now do Firebase operations as an authenticated user...
                    console.log('User ID: ' + user.id); // '1234'
                    console.log('Provider: ' + user.provider); // 'facebook'
                } else {
                    console.log(error);
                }
                this.getLoginStatus();
            }, this));
        }
    });
    return AuthenticationModel;
});