define([
    'jquery',
    'underscore',
    './view',
    './feed'
], function($, _, View, FeedView) {
    'use strict';
    var LoggedInView = View.extend({
        events: {
            'click .addFeed': 'onAddFeed'
        },
        initialize: function() {
            _.bindAll(this, 'onFeedAdded', 'onFeedRemoved');
            this.template = _.template($('#logged_in_template').html());
            this.model.on('change:user', this.onUser, this);
            this.views = [];
        },
        onFeedAdded: function(feedChildSnapshot) {
            var view = new FeedView({
                model: feedChildSnapshot
            });
            this.views[feedChildSnapshot.name()] = view;
            this.$('.feeds').append(view.render().el);
        },
        onFeedRemoved: function(feedChildSnapshot) {
            this.views[feedChildSnapshot.name()].remove();
            delete this.views[feedChildSnapshot.name()];
        },
        onAddFeed: function(ev) {
            var user = this.model.get('user');
            this.model.users.child(user.id).child('feeds').push({
                name: 'new feed',
                facebook_id: this.model.get('user').id
            });
        },
        onUser: function() {
            var user = this.model.get('user');
            if(user) {
                this.model.users.child(user.id).child('feeds').on('child_added', this.onFeedAdded);
                this.model.users.child(user.id).child('feeds').on('child_removed', this.onFeedRemoved);
            }
            this.render();
        },
        render: function() {
            this.$el.html(this.template());
            if(this.model.get('user')) {
                this.$el.show();
            } else {
                this.$el.hide();
            }
            return this;
        }
    });
    return LoggedInView;
});