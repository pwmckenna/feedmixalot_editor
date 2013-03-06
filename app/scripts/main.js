require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        // Backbone
        'backbone': {

            // Depends on underscore/lodash and jQuery
            'deps': ['underscore', 'jquery'],

            // Exports the global window.Backbone object
            'exports': 'Backbone'

        },
        'firebase': {
            'exports': 'Firebase'
        },
        'firebase-auth-client': {
            'exports': 'FirebaseAuthClient'
        }
    },
    paths: {
        hm: 'vendor/hm',
        esprima: 'vendor/esprima',
        jquery: 'vendor/jquery.min',
        smoothie: 'vendor/smoothie',
        backbone: 'components/backbone/backbone-min',
        humane: 'components/Humane-Dates/humane',
        underscore: 'components/underscore/underscore-min',
        backbone: 'components/backbone/backbone-min',
        firebase: 'vendor/firebase',
        'firebase-auth-client': 'vendor/firebase-auth-client'
    }
});

require(['model/authentication', 'view/app'], function (AuthenticationModel, AppView) {
    'use strict';
    window.authentication = new AuthenticationModel();
    $('body').append(new AppView({
        model: window.authentication
    }).render().el);
});
